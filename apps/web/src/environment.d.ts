declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      NODE_ENV: 'development' | 'production';
      SUPABASE_PROJECT_REF: string;

      // Stripe
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      STRIPE_PRICE_ID: string;

      // n8n
      NEXT_PUBLIC_N8N_WEBHOOK_URL: string;

      // Cron
      CRON_SECRET: string;

      // OAuth (placeholder)
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
      LINKEDIN_CLIENT_ID?: string;
      LINKEDIN_CLIENT_SECRET?: string;
    }
  }
}

export {};
