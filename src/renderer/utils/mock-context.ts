export function initMockContextModules() {
  if (window.contextModules) return;

  window.contextModules = {
    request: async (url: string, config: any) => {
      return fetch(url, config).then(res => res.json());
    },
    process: {
      production: import.meta.env.PROD,
      platform: 'browser',
      tauri: 'false',
      arch: 'unknown',
      buildDate: Date.now(),
    },
    electron: {
      shell: {
        openExternal: async (url: string) => {
          window.open(url, '_blank');
        },
      },
      ipcRenderer: {
        invoke: async (channel: string, ...args: any[]) => {
          console.log('Mock ipcRenderer.invoke:', channel, args);
          return Promise.resolve(null);
        },
        removeAllListeners: (channel: string) => {},
        removeListener: (channel: string, listener: any) => {},
        on: (channel: string, listener: any) => {},
      },
      dialog: {
        showMessageBox: async (config: any) => {
          return { response: 0 };
        },
        showSaveDialog: async (config: any) => {
          return { filePath: '/mock/path' };
        },
        showOpenDialog: async (config: any) => {
          return { filePaths: [] };
        },
      },
      app: {
        setLoginItemSettings: async (config: any) => {},
        quit: async () => {},
        relaunch: async () => {},
        getVersion: async () => '0.0.0',
      },
      clipboard: {
        readText: async () => '',
        writeText: async (text: string) => {},
        writeImage: async (dataUrl: string) => {},
      },
    },
    io: {
      saveImage: async (filePath: string, dataUrl: string) => {},
      saveString: async (filePath: string, content: string) => {},
      saveJsonToCsv: async (filePath: string, json: any[]) => {},
      readStringFile: async (path: string) => '',
      readFile: async (path: string) => new ArrayBuffer(0),
    },
    electronStore: {
      get: async <T = unknown>(type: any, key: string, init?: T) => {
        const stored = localStorage.getItem(`mock_store_${type}_${key}`);
        return stored ? JSON.parse(stored) : init;
      },
      set: async (type: any, key: string, data: unknown) => {
        localStorage.setItem(`mock_store_${type}_${key}`, JSON.stringify(data));
      },
      delete: async (type: any, key: string) => {
        localStorage.removeItem(`mock_store_${type}_${key}`);
      },
      cover: async (type: any, data: unknown) => {
        localStorage.setItem(`mock_store_${type}`, JSON.stringify(data));
      },
      all: async (type: any) => {
        const stored = localStorage.getItem(`mock_store_${type}`);
        return stored ? JSON.parse(stored) : {};
      },
    },
  };
}