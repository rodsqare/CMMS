#!/bin/bash
# Clear Prisma cache and regenerate client
rm -rf node_modules/.prisma
rm -rf .next
npm run prisma:generate 2>/dev/null || npx prisma generate
npm run dev
