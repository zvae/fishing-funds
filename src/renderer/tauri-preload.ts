import {
  invoke,
  convertFileSrc,
} from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getVersion, getPlatform } from './tauri-adapter';

export async function initContextModules() {
  const platform = await getPlatform();
  const version = await getVersion();

  window.contextModules = {
    request: async (url: string, config: any) => {
      return await invoke('request', { url, config });
    },
    process: {
      production: import.meta.env.PROD,
      platform: platform,
      tauri: version,
      arch: 'x64',
      buildDate: Date.now(),
    },
    electron: {
      shell: {
        openExternal: async (url: string) => {
          return await invoke('shell_open_external', { url });
        },
      },
      ipcRenderer: {
        invoke: async (channel: string, ...args: any[]) => {
          channel = channel.replace(/-/g, '_');
          console.log('ipcRenderer invoke', channel, ...args);
          return await invoke(channel, ...args);
        },
        removeAllListeners: (channel: string) => {
          // Tauri doesn't have a direct equivalent
        },
        removeListener: (channel: string, listener: any) => {
          // Tauri doesn't have a direct equivalent
        },
        on: (channel: string, listener: any) => {
          listen(channel, (event) => {
            listener(null, event.payload);
          });
        },
      },
      dialog: {
        showMessageBox: async (config: any) => {
          return await invoke('show_message_box', { config });
        },
        showSaveDialog: async (config: any) => {
          return await invoke('show_save_dialog', { config });
        },
        showOpenDialog: async (config: any) => {
          return await invoke('show_open_dialog', { config });
        },
      },
      app: {
        setLoginItemSettings: async (config: any) => {
          return await invoke('set_login_item_settings', { enabled: config.openAtLogin });
        },
        quit: async () => {
          return await invoke('app_quit');
        },
        relaunch: async () => {
          return await invoke('app_relaunch');
        },
        getVersion: async () => {
          return await invoke('get_version');
        },
      },
      clipboard: {
        readText: async () => {
          return await invoke('clipboard_read_text');
        },
        writeText: async (text: string) => {
          return await invoke('clipboard_write_text', { text });
        },
        writeImage: async (dataUrl: string) => {
          return await invoke('clipboard_write_image', { dataUrl });
        },
      },
    },
    io: {
      saveImage: async (path: string, content: string) => {
        return await invoke('io_save_image', { path, content });
      },
      saveJsonToCsv: async (path: string, content: any[]) => {
        return await invoke('io_save_json_to_csv', { path, content });
      },
      saveString: async (path: string, content: string) => {
        return await invoke('io_save_string', { path, content });
      },
      readStringFile: async (path: string) => {
        return await invoke('io_read_string_file', { path });
      },
      readFile: async (path: string) => {
        return await invoke('io_read_file', { path });
      },
    },
    electronStore: {
      get: async (type: Store.StoreType, key: string, init?: unknown) => {
        const upperType = type.charAt(0).toUpperCase() + type.slice(1);
        return await invoke('get_storage_config', { config: { type: upperType, key, init } });
      },
      set: async (type: Store.StoreType, key: string, value: unknown) => {
        const upperType = type.charAt(0).toUpperCase() + type.slice(1);
        console.log('set_storage_config:', { type: upperType, key, value });
        return await invoke('set_storage_config', { config: { type: upperType, key, value } });
      },
      delete: async (type: Store.StoreType, key: string) => {
        const upperType = type.charAt(0).toUpperCase() + type.slice(1);
        return await invoke('delete_storage_config', { config: { type: upperType, key } });
      },
      cover: async (type: Store.StoreType, value: unknown) => {
        const upperType = type.charAt(0).toUpperCase() + type.slice(1);
        return await invoke('cover_storage_config', { config: { type: upperType, value } });
      },
      all: async (type: Store.StoreType) => {
        const upperType = type.charAt(0).toUpperCase() + type.slice(1);
        return await invoke('all_storage_config', { config: { type: upperType } });
      },
    },
  };
}