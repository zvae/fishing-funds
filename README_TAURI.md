# Fishing Funds - Tauri 2.0

基金,大盘,股票,虚拟货币状态栏显示小应用，基于 Tauri 2.0 开发，支持 MacOS, Windows, Linux 客户端。

## 开发环境设置

### 1. 安装 Rust

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Windows
# 访问 https://rustup.rs/ 下载安装器
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 开发

```bash
pnpm tauri:dev
```

### 4. 构建

```bash
pnpm tauri:build
```

## 项目结构

- `src/renderer/` - React 前端代码
- `src-tauri/` - Rust 后端代码
- `build/` - 构建资源 (图标等)

## 从 Electron 迁移

本项目已从 Electron 迁移到 Tauri 2.0，详见 [MIGRATION.md](./MIGRATION.md)。

主要优势：
- 包体积减少 60-80%
- 内存占用更低
- 启动速度更快
- 更好的安全性

## 技术栈

### 前端
- React 19
- Redux Toolkit
- Ant Design 6
- ECharts 6
- TypeScript

### 后端
- Rust
- Tauri 2.0
- Tauri Plugins (store, updater, clipboard, dialog, etc.)

## License

GPL-3.0