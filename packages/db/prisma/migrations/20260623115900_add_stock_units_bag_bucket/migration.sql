-- Keep the database StockUnit enum aligned with schema.prisma.
-- These values must be committed before later migrations can cast product rows to them.

ALTER TYPE "StockUnit" ADD VALUE IF NOT EXISTS 'BAG';
ALTER TYPE "StockUnit" ADD VALUE IF NOT EXISTS 'BUCKET';
ALTER TYPE "StockUnit" ADD VALUE IF NOT EXISTS 'PACK';
ALTER TYPE "StockUnit" ADD VALUE IF NOT EXISTS 'ROLL';
ALTER TYPE "StockUnit" ADD VALUE IF NOT EXISTS 'CAN';
