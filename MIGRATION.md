# Electron 到 Tauri 2.0 迁移指南

## 概述

本项目已从 Electron 迁移到 Tauri 2.0。主要变化包括：

1. **后端**: Electron 主进程 (Node.js/TypeScript) → Tauri 后端 (Rust)
2. **前端**: 保持 React + TypeScript，但 API 调用方式改变
3. **构建系统**: electron-vite + electron-builder → Vite + Tauri CLI
4. **包体积**: 预计减少 60-80%

## 前置要求

### 1. 安装 Rust

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 或访问 https://rustup.rs/
```

### 2. 安装系统依赖

#### macOS
```bash
xcode-select --install
```

#### Linux
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

#### Windows
- 安装 Microsoft Visual Studio C++ Build Tools
- 安装 WebView2 (Windows 10/11 已预装)

## 安装依赖

```bash
# 1. 初始化 git 子模块（数据服务层）
git submodule init
git submodule update

# 2. 安装 Node.js 依赖
pnpm install
```

## 开发命令

```bash
# 开发模式
pnpm tauri:dev

# 构建应用
pnpm tauri:build
```

## 架构变化

### 前端 API 适配

前端代码通过 `tauri-preload.ts` 和 `tauri-adapter.ts` 提供与 Electron 兼容的 API 接口：

```typescript
// Electron 方式
const { ipcRenderer } = window.contextModules.electron;
const version = await ipcRenderer.invoke('get-version');

// Tauri 方式 (自动适配，无需修改现有代码)
const { ipcRenderer } = window.contextModules.electron;
const version = await ipcRenderer.invoke('get-version');
```

### Rust 后端命令

所有 IPC 命令在 `src-tauri/src/commands.rs` 中定义，映射到原来的 Electron 主进程功能。

### 插件对应关系

| Electron 模块 | Tauri 插件 |
|--------------|-----------|
| electron-store | tauri-plugin-store |
| electron-updater | tauri-plugin-updater |
| globalShortcut | tauri-plugin-global-shortcut |
| clipboard | tauri-plugin-clipboard-manager |
| dialog | tauri-plugin-dialog |
| fs | tauri-plugin-fs |
| shell | tauri-plugin-shell |
| http (undici) | tauri-plugin-http |

## 功能差异

### ✅ 已支持功能

- [x] 系统托盘和菜单
- [x] 本地存储 (config, cache, state)
- [x] 自动更新
- [x] 全局快捷键
- [x] 剪贴板操作
- [x] 文件 IO
- [x] 系统主题检测
- [x] HTTP 请求
- [x] 开机自启动
- [x] 单实例运行

### ⚠️ 需要注意的功能

#### 1. Menubar 窗口
Electron 的 `menubar` 库在 Tauri 中没有直接对应物。当前实现使用系统托盘 + 隐藏窗口模拟：
- 点击托盘图标显示/隐藏窗口
- 窗口位置需要手动计算（在托盘图标附近）

如需真正的菜单栏效果，需要自定义实现窗口定位逻辑。

#### 2. TouchBar (macOS)
Tauri 目前不支持 TouchBar。相关功能已移除。

#### 3. 系统代理
系统代理检测需要在 Rust 中实现更复杂的逻辑。

#### 4. OpenAI 集成
建议在前端直接使用 OpenAI SDK，而非通过 Rust 后端。

### ❌ 已移除功能

- TouchBar (macOS 特有)
- electron-log (使用浏览器 console 或 Rust log)
- electron-window-state (使用 Tauri 内置窗口状态管理)

## 文件结构

```
.
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── main.rs         # 入口文件
│   │   ├── lib.rs          # 主库文件
│   │   ├── commands.rs      # IPC 命令
│   │   ├── tray.rs         # 托盘管理
│   │   ├── store.rs        # 存储管理
│   │   ├── hotkey.rs       # 快捷键管理
│   │   ├── updater.rs      # 更新管理
│   │   └── http_client.rs  # HTTP 客户端
│   ├── Cargo.toml          # Rust 依赖
│   └── tauri.conf.json     # Tauri 配置
├── src/renderer/           # React 前端 (保持不变)
│   ├── tauri-preload.ts    # Tauri API 适配
│   └── tauri-adapter.ts    # 辅助函数
└── vite.config.ts          # Vite 配置
```

## 配置文件

### tauri.conf.json

主要配置项：
- `identifier`: 应用唯一标识
- `build.frontendDist`: 前端构建输出目录
- `bundle.icon`: 应用图标
- `app.trayIcon`: 托盘图标配置

### Cargo.toml

Rust 依赖配置，包括所有 Tauri 插件。

## 图标配置

需要准备以下尺寸的图标：
- 32x32
- 128x128
- 128x128@2x (256x256)
- icon.icns (macOS)
- icon.ico (Windows)

将图标放在 `src-tauri/icons/` 目录。

## 已知问题

1. **窗口透明度和模糊效果**: macOS 的 vibrancy 效果已支持，但 Windows/Linux 可能需要额外配置。

2. **多窗口同步**: 需要在 Rust 中实现窗口间通信逻辑。

3. **WebView 标签**: Tauri 支持 WebView，但需要额外配置 CSP。

## 测试

```bash
# 开发模式测试
pnpm tauri:dev

# 构建测试
pnpm tauri:build
```

## 部署

构建后的应用位于：
- macOS: `src-tauri/target/release/bundle/dmg/`
- Windows: `src-tauri/target/release/bundle/msi/`
- Linux: `src-tauri/target/release/bundle/appimage/`

## 下一步

1. 安装 Rust 环境
2. 运行 `pnpm install`
3. 运行 `pnpm tauri:dev` 测试开发模式
4. 根据需要调整托盘图标、窗口位置等细节
5. 测试所有功能，特别是：
   - 本地存储读写
   - 自动更新
   - 全局快捷键
   - 文件导入导出
6. 构建发布版本

## 获取帮助

- [Tauri 官方文档](https://tauri.app/v2/guides/)
- [Tauri GitHub](https://github.com/tauri-apps/tauri)
- [Tauri Discord](https://discord.com/invite/tauri)

## 迁移进度

- [x] 项目结构初始化
- [x] Rust 后端核心功能
- [x] 前端 API 适配
- [x] 构建配置
- [ ] 图标资源迁移
- [ ] 完整功能测试
- [ ] 性能优化
- [ ] 发布部署