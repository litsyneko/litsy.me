// Strapi API configuration
export const STRAPI_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337",
  apiToken: process.env.STRAPI_API_TOKEN,
} as const

// Strapi database configuration (Supabase PostgreSQL)
export const STRAPI_DATABASE_CONFIG = {
  client: "postgres",
  connection: {
    connectionString: process.env.SUPABASE_DATABASE_URL,
    host: process.env.SUPABASE_HOST,
    port: Number.parseInt(process.env.SUPABASE_PORT || "5432"),
    database: process.env.SUPABASE_DATABASE,
    user: process.env.SUPABASE_USER,
    password: process.env.SUPABASE_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  pool: {
    min: 2,
    max: 10,
  },
}

// Cloudflare R2 storage configuration for Strapi
export const STRAPI_STORAGE_CONFIG = {
  provider: "aws-s3",
  providerOptions: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    endpoint: process.env.R2_ENDPOINT,
    params: {
      Bucket: process.env.R2_BUCKET_NAME,
    },
    region: "auto",
    s3ForcePathStyle: true,
  },
  actionOptions: {
    upload: {},
    uploadStream: {},
    delete: {},
  },
}
