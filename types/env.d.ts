declare type Env = {
  SESSION_SECRET: string;
  GOOGLE_AUTH_CALLBACK_URL: string;
  GOOGLE_AUTH_CLIENT_ID: string;
  GOOGLE_AUTH_CLIENT_SECRET: string;
  SESSION_KV: KVNamespace;
  DB: D1Database;
};
