#!/usr/bin/env pwsh
# install.ps1 — wire dsh-theme-tuner into the running DSH "web" profile.
#
# The OFFICIAL channel is:   dsh plugin --profile web add link:<this dir>
# which delegates to pnpm and reconciles dsh.profile.bundles. That path is used
# first. It can be blocked by the profile's pnpm supply-chain policy
# (minimumReleaseAge) — a common, pre-existing condition. When that happens this
# script falls back to a fully-local JUNCTION install (no pnpm, no network):
#   1. junction  <profile>\node_modules\dsh-theme-tuner  -> this dir
#   2. junction  the needed host deps (@deepseek-ai/dsh-settings + schemastery)
#      into this dir's node_modules so the host half resolves them
#   3. append dsh-theme-tuner to dsh.profile.bundles
#
# Both paths finish by RE-ASSERTING the bundle entry. A profile can lose that
# entry (a plugin-manager rewrite drops out-of-band rows) and then the plugin
# silently stops loading even though it is still installed — which is exactly
# the "it stopped working after an upgrade" symptom. An entry left in
# disabled-plugins.json also keeps it off; this script reports that.
#
# IMPORTANT: a NEW plugin needs a profile RESTART to take effect (client-modules
# caches plugin-set metadata). After this succeeds, restart DSH to see the new
# "主题定制" settings page.
$ErrorActionPreference = "Stop"

$pluginDir  = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$home       = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE ".dsh" }
$profileDir = Join-Path $home "profiles\web"
$manifest   = Join-Path $profileDir "package.json"
$disabled   = Join-Path $profileDir "disabled-plugins.json"

if (-not (Test-Path $manifest)) { throw "Profile 'web' not found at $profileDir." }

# --- backup ---------------------------------------------------------------
$backup = "$manifest.dsh-theme-tuner.bak"
Copy-Item $manifest $backup -Force
Write-Host "Backed up profile manifest -> $backup"
$patchFile = Join-Path $profileDir "cordis.patch.yml"
if (Test-Path $patchFile) { Copy-Item $patchFile "$patchFile.dsh-theme-tuner.bak" -Force }

# --- bundle entry (the layer that actually loads the plugin) ---------------
function Assert-BundleEntry {
  $pkg = Get-Content $manifest -Raw | ConvertFrom-Json
  $dsh = $pkg.dsh
  if ($null -eq $dsh) {
    $dsh = [pscustomobject]@{}
    $pkg | Add-Member -Force -NotePropertyName dsh -NotePropertyValue $dsh
  }
  $profile = $dsh.profile
  if ($null -eq $profile) {
    $profile = [pscustomobject]@{}
    $dsh | Add-Member -Force -NotePropertyName profile -NotePropertyValue $profile
  }
  $bundles = @()
  if ($profile.bundles) { $bundles = @($profile.bundles) }
  if ($bundles -notcontains "dsh-theme-tuner") {
    $profile | Add-Member -Force -NotePropertyName bundles -NotePropertyValue ($bundles + "dsh-theme-tuner")
    $pkg | ConvertTo-Json -Depth 20 | Set-Content $manifest -Encoding UTF8
    Write-Host "Appended dsh-theme-tuner to dsh.profile.bundles"
  } else {
    Write-Host "dsh-theme-tuner already in dsh.profile.bundles"
  }
  if (Test-Path $disabled) {
    $off = Get-Content $disabled -Raw | ConvertFrom-Json
    if ($off.PSObject.Properties.Name -contains "dsh-theme-tuner") {
      Write-Host "WARNING: dsh-theme-tuner is still listed in disabled-plugins.json — enable it from the plugin manager (or delete that entry) or the row stays hidden."
    }
  }
}

# --- try official CLI first ------------------------------------------------
$dsh = Get-Command dsh -ErrorAction SilentlyContinue
$installed = $false
if ($dsh) {
  Write-Host "Trying official: dsh plugin --profile web add link:$pluginDir"
  & $dsh plugin --profile web add "link:$pluginDir" 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Official install succeeded (pnpm path)."
    $installed = $true
  } else {
    Write-Host "Official path failed (pnpm policy block, or a DSH compatibility refusal — see its message) — falling back to junction install."
  }
}

# --- junction fallback ------------------------------------------------------
function Add-Junction($Path, $Target) {
  if (Test-Path $Path) { Write-Host "  exists: $Path"; return }
  New-Item -ItemType Junction -Path $Path -Target $Target | Out-Null
  Write-Host "  junctioned $Path -> $Target"
}

if (-not $installed) {
  # 1) plugin junction in the profile node_modules
  Add-Junction (Join-Path $profileDir "node_modules\dsh-theme-tuner") $pluginDir

  # 2) host-dependency junctions inside the plugin dir (so the host half resolves
  #    @deepseek-ai/dsh-settings and @deepseek-ai/schemastery without pnpm).
  #    Prefer the active installation; fall back to the newest versioned tree,
  #    because the host half needs a schemastery with `.volatile()` (>= 3.18.4)
  #    to project its Config into a DSH 0.2.0 settings form.
  $dshRoot = Join-Path $env:APPDATA "io.github.hairyf.deepseek-harness-desktop\dependencies"
  $candidates = @((Join-Path $dshRoot "dsh")) + @(
    Get-ChildItem $dshRoot -Directory -Filter "dsh-*" -ErrorAction SilentlyContinue |
      Sort-Object Name -Descending | ForEach-Object { $_.FullName }
  )
  function Find-DshDep($dep) {
    foreach ($c in $candidates) {
      $t = Join-Path $c "node_modules\@deepseek-ai\$dep"
      if (Test-Path (Join-Path $t "package.json")) { return $t }
    }
    return $null
  }
  $pluginNode = Join-Path $pluginDir "node_modules\@deepseek-ai"
  New-Item -ItemType Directory -Force -Path $pluginNode | Out-Null
  foreach ($dep in @("dsh-settings", "schemastery")) {
    $t = Find-DshDep $dep
    if ($t) { Add-Junction (Join-Path $pluginNode $dep) $t }
    else { Write-Host "  WARN: dependency not found in any dsh install: $dep" }
  }
  $schema = Join-Path $pluginNode "schemastery\lib\index.mjs"
  if (Test-Path $schema) {
    if (-not (Select-String -Path $schema -Pattern "prototype\.volatile" -Quiet)) {
      Write-Host "  WARN: the junctioned schemastery has no .volatile(); DSH 0.2.0 settings will not persist. Install @deepseek-ai/schemastery >= 3.18.4."
    }
  }
}

# --- 3) always re-assert the bundle layer -----------------------------------
Assert-BundleEntry

Write-Host ""
Write-Host "Install complete. RESTART the DSH web profile to see the '主题定制' settings page."
Write-Host "  - Revert: restore the .bak file and delete the junction at node_modules\dsh-theme-tuner"
