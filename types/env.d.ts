declare module 'process' {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        PORT: number;
        MICROFRONTEND_CONTROL_SERVER_URL: string;
        BACKEND_URL: string;
        BACKEND_NAME: string;
        MICROFRONTEND_NAME: string;
        MODULE_FEDERATION_SCOPE: string;
        MAIN_EXPOSED_COMPONENT: string;
        DOMAIN: string;
        IS_DEV: boolean;
      }
    }
  }
}
