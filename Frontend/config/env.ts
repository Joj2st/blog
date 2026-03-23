export const env = {
  // API
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // App
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Blog Platform',
  APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A modern blog platform',
  
  // Auth
  TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
} as const;

export type Env = typeof env;
