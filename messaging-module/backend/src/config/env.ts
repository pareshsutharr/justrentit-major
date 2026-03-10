import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4002),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(10),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  FILE_STORAGE: z.enum(["local", "s3"]).default("local"),
  LOCAL_UPLOAD_DIR: z.string().default("./uploads"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional()
});

export const env = envSchema.parse(process.env);
