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
# IMPORTANT: a NEW plugin needs a profile RESTART to take effect (client-modules
# caches plugin-set metadata). After this succeeds, restart DSH to see the new
# "主题定制" settings page.
$ErrorActionPreference = "Stop"

$pluginDir  = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$home       = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE ".dsh" }
$profileDir = Join-Path $home "profiles\web"
$manifest   = Join-Path $profileDir "package.json"

if (-not (Test-Path $manifest)) { throw "Profile 'web' not found at $profileDir." }

# --- backup ---------------------------------------------------------------
$backup = "$manifest.dsh-theme-tuner.bak"
Copy-Item $manifest $backup -Force
Write-Host "Backed up profile manifest -> $backup"
$patchFile = Join-Path $profileDir "cordis.patch.yml"
if (Test-Path $patchFile) { Copy-Item $patchFile "$patchFile.dsh-theme-tuner.bak" -Force }

# --- try official CLI first ------------------------------------------------
$dsh = Get-Command dsh -ErrorAction SilentlyContinue
if ($dsh) {
  Write-Host "Trying official: dsh plugin --profile web add link:$pluginDir"
  & $dsh plugin --profile web add "link:$pluginDir" 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Official install succeeded (pnpm path)."
    Write-Host "RESTART DSH to see the '主题定制' settings page."
    return
  }
  Write-Host "Official path failed (pnpm policy block?) — falling back to junction install."
}

# --- junction fallback ------------------------------------------------------
function Add-Junction($Path, $Target) {
  if (Test-Path $Path) { Write-Host "  exists: $Path"; return }
  New-Item -ItemType Junction -Path $Path -Target $Target | Out-Null
  Write-Host "  junctioned $Path -> $Target"
}

# 1) plugin junction in the profile node_modules
Add-Junction (Join-Path $profileDir "node_modules\dsh-theme-tuner") $pluginDir

# 2) host-dependency junctions inside the plugin dir (so the host half resolves
#    @deepseek-ai/dsh-settings and @deepseek-ai/schemastery without pnpm)
$dshPackage = Get-Command dsh -ErrorAction SilentlyContinue
$installAnchor = if ($dshPackage) { Split-Path -Parent (Split-Path -Parent $dshPackage.Source) } else { $env:APPDATA }
$dshNode = Join-Path $env:APPDATA "io.github.hairyf.deepseek-harness-desktop\dependencies\dsh\node_modules\@deepseek-ai"
$pluginNode = Join-Path $pluginDir "node_modules\@deepseek-ai"
New-Item -ItemType Directory -Force -Path $pluginNode | Out-Null
foreach ($dep in @("dsh-settings", "schemastery")) {
  $t = Join-Path $dshNode $dep
  if (Test-Path $t) { Add-Junction (Join-Path $pluginNode $dep) $t }
  else { Write-Host "  WARN: dependency not found in dsh install: $t" }
}

# 3) append to dsh.profile.bundles
$pkg = Get-Content $manifest -Raw | ConvertFrom-Json
if ($null -eq $pkg.dsh.profile.bundles) { $pkg.dsh.profile.bundles = @() }
if ($pkg.dsh.profile.bundles -notcontains "dsh-theme-tuner") {
  $pkg.dsh.profile.bundles += "dsh-theme-tuner"
  $pkg | ConvertTo-Json -Depth 20 | Set-Content $manifest -Encoding UTF8
  Write-Host "Appended dsh-theme-tuner to dsh.profile.bundles"
} else {
  Write-Host "dsh-theme-tuner already in dsh.profile.bundles"
}

Write-Host ""
Write-Host "Junction install complete. RESTART the DSH web profile to see the '主题定制' settings page."
Write-Host "  - Revert: restore the .bak file and delete the junction at node_modules\dsh-theme-tuner"
