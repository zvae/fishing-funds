declare global {
  interface Window {
    contextModules: {
      request: (url: string, config: any) => Promise<any>;
      process: {
        production: boolean;
        platform: string;
        tauri: string;
        arch: string;
        buildDate: number;
      };
      electron: {
        shell: {
          openExternal: (url: string) => Promise<void>;
        };
        ipcRenderer: {
          invoke: (channel: string, ...args: any[]) => Promise<any>;
          removeAllListeners: (channel: string) => void;
          removeListener: (channel: string, listener: any) => void;
          on: (channel: string, listener: any) => void;
        };
        dialog: {
          showMessageBox: (config: any) => Promise<any>;
          showSaveDialog: (config: any) => Promise<any>;
          showOpenDialog: (config: any) => Promise<any>;
        };
        app: {
          setLoginItemSettings: (config: any) => Promise<void>;
          quit: () => Promise<void>;
          relaunch: () => Promise<void>;
          getVersion: () => Promise<string>;
        };
        clipboard: {
          readText: () => Promise<string>;
          writeText: (text: string) => Promise<void>;
          writeImage: (dataUrl: string) => Promise<void>;
        };
      };
      io: {
        saveImage: (filePath: string, dataUrl: string) => Promise<unknown>;
        saveString: (filePath: string, content: string) => Promise<unknown>;
        saveJsonToCsv: (filePath: string, json: any[]) => Promise<unknown>;
        readStringFile: (path: string) => Promise<string>;
        readFile: (path: string) => Promise<ArrayBuffer>;
      };
      electronStore: {
        get: <T = unknown>(type: Store.StoreType, key: string, init?: T) => Promise<T>;
        set: (type: Store.StoreType, key: string, data: unknown) => Promise<void>;
        delete: (type: Store.StoreType, key: string) => Promise<void>;
        cover: (type: Store.StoreType, data: unknown) => Promise<void>;
        all: (type: Store.StoreType) => Promise<any>;
      };
    };
  }
}

export {};