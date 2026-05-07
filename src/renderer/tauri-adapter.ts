import { invoke } from '@tauri-apps/api/core';
import { getName, getVersion, getTauriVersion } from '@tauri-apps/api/app';
import { platform, arch } from '@tauri-apps/plugin-os';

export async function getVersion(): Promise<string> {
  try {
    return await getVersion();
  } catch {
    return '0.1.0';
  }
}

export async function getPlatform(): Promise<string> {
  try {
    return await platform();
  } catch {
    return 'unknown';
  }
}

export async function getArch(): Promise<string> {
  try {
    return await arch();
  } catch {
    return 'unknown';
  }
}

export async function getAppName(): Promise<string> {
  try {
    return await getName();
  } catch {
    return 'Fishing Funds';
  }
}

export async function getTauriVersion(): Promise<string> {
  try {
    return await getTauriVersion();
  } catch {
    return '2.0.0';
  }
}