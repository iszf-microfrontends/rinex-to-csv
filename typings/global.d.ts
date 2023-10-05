declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        PORT: number;
        APP_NAME: string;
        DOMAIN: string;
        MCS_URL: string;
        BACKEND_URL: string;
        BACKEND_NAME: string;
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __DEV__: boolean;
