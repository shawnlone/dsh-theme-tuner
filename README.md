# dsh-theme-tuner

> [English](README_en.md)

在 DeepSeek Harness (DSH) 的「通用设置 → 外观」下方直接调整界面主题——**强调色 / 背景 / 前景 / 对比度 / 渐变度**，实时生效。

> 复用「外观」自带的 **浅色 / 深色 / 跟随系统** 切换，无需重复的切换按钮。

## 效果

| ![深色 · 主题效果](assets/screenshot_01.png)<br>深色 · 主题效果 | ![深色 · 主题效果](assets/screenshot_02.png)<br>深色 · 主题效果 | ![深色 · 主题效果](assets/screenshot_03.png)<br>深色 · 主题效果 |
| --- | --- | --- |
| ![深色 · 主题效果](assets/screenshot_04.png)<br>深色 · 主题效果 | ![浅色 · 主题效果](assets/screenshot_05.png)<br>浅色 · 主题效果 | ![主题调节面板](assets/screenshot_06.png)<br>主题调节面板 |

## 功能

- 挂在「通用设置 → 外观」正下方，调整 **强调色 / 背景 / 前景 / 对比度 / 渐变度**。
- 复用「外观」的 浅色 / 深色 / 跟随系统 切换，针对**当前激活主题**调整。
- 浅色、深色两套配色**分别保存**；对比度按当前主题微调前景文字的清晰度。
- 改动**实时生效**（`theme.overrideTokens` 写入 `--dsw-alias-*` 设计变量），可一键**恢复当前主题默认**。

## 安装

```sh
dsh plugin --profile web add github:shawnlone/dsh-theme-tuner
```

> 本仓库按「仓库根即插件包」组织：`package.json` 声明了 `dsh.bundle.patch`（安装入口）与 `dsh.client`（浏览器端 UI），根目录放置 `cordis.patch.yml`。
> 新增插件需 **重启一次对应的 web profile** 才会生效。另提供 `scripts/install.ps1` / `scripts/install.sh` 一键脚本（内含 pnpm 供应链策略无法通过时的本地 junction 安装回退）。

## 原理

插件通过 `theme.overrideTokens` 把自定义值写入 DSH 的设计 token：

- **强调色**：`--dsw-alias-brand-primary` / `--dsw-alias-button-primary-fill` / `--dsw-alias-state-business-primary`
- **背景**：`--dsw-alias-bg-base` / `--dsw-alias-bg-layer-1/2/3` / `--dsw-specific-sidebar-fill`
- **前景**：`--dsw-alias-label-primary/secondary/tertiary`（由所选前景色 + 对比度自动推导）

设置经 `theme-tuner` 命名空间持久化；设置行注册到 `settings.general.item`（order 10.5），排在「外观」（order 10）正下方（DSH 0.1.2-rc.1 起新增的「字号大小」在 order 11、「对话显示」在 order 12，故用 10.5 保持紧贴外观）。

## 目录结构

```
dsh-theme-tuner/
  package.json          # 双面插件清单：dsh.client + dsh.bundle.patch
  cordis.patch.yml      # bundle 挂载行 (insert)
  lib/index.js          # 主机半区：注册 theme-tuner 设置命名空间 + schema
  lib/client.js         # 浏览器半区：设置行 UI + 实时 token 应用
  scripts/              # install.ps1 / install.sh
  preview.html          # 独立效果演示
  assets/               # 文档 / 插件市场截图
```

## 许可证

[MIT](LICENSE)
