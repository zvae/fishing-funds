import { initMockContextModules } from './utils/mock-context';
import { initContextModules } from '@/tauri-preload';

// @ts-ignore
if (window.__TAURI__) {
  // 初始化 Tauri 上下文模块，只有在 Tauri 环境下才初始化
  await initContextModules();
} else {
  // 非 Tauri 环境下，初始化模拟上下文模块
  initMockContextModules();
}

import('./index.tsx');