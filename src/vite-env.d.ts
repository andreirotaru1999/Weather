/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VISUALCROSSING_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
