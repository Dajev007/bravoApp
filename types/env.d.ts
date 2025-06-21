declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      EXPO_PUBLIC_GEMINI_API_KEY: string;
      EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    }
  }
}

export {};