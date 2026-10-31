import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

// Força o carregamento do .env e do .env.local no Node.js
dotenv.config();
dotenv.config({ path: '.env.local' });

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || '',
    directUrl: process.env.DIRECT_URL,
  },
});