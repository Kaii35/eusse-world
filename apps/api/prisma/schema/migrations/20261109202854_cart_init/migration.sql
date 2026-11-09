-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "cart";

-- CreateTable
CREATE TABLE "cart"."cart_lines" (
    "id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "color" VARCHAR(60) NOT NULL,
    "qty_by_size" JSONB NOT NULL,
    "print_technique" VARCHAR(16),
    "print_size" VARCHAR(16),
    "print_placement" VARCHAR(80),
    "unit_price_amount" DECIMAL(18,4) NOT NULL,
    "unit_price_currency" VARCHAR(3) NOT NULL,
    "priced_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "cart_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cart_lines_owner_user_id_idx" ON "cart"."cart_lines"("owner_user_id");
