import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || '',
  },
});