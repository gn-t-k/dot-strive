import type { AppLoadContext } from '@remix-run/cloudflare';

const keys = [
  'SESSION_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
] as const;

type GetEnv = (context: AppLoadContext) => (key: typeof keys[number]) => string;
export const getEnv: GetEnv = (context) => (key) => {
  const value = context[key];

  if (typeof value !== 'string') {
    throw new TypeError(`Missing environment variable: ${key}`);
  }

  return value;
};
