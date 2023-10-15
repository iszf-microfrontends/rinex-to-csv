/* eslint-disable @typescript-eslint/naming-convention */
declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        PORT?: number;
        PREVIEW_PORT?: number;
        APP_NAME?: string;
        DOMAIN?: string;
        MCS_URL?: string;
        BACKEND_URL?: string;
        BACKEND_NAME?: string;
      }
    }
  }
}

declare const __DEV__: boolean;
