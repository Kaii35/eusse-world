-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "suppliers";

-- CreateTable
CREATE TABLE "suppliers"."suppliers" (
    "id" UUID NOT NULL,
    "tenant_id" VARCHAR(64) NOT NULL,
    "legal_name" VARCHAR(200) NOT NULL,
    "tax_id" VARCHAR(32) NOT NULL,
    "status" VARCHAR(16) NOT NULL,
    "rejection_reason" VARCHAR(500),
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers"."supplier_members" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supplier_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers"."supplier_products" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "category" VARCHAR(80) NOT NULL,
    "base_price_amount" DECIMAL(18,4) NOT NULL,
    "base_price_currency" VARCHAR(3) NOT NULL,
    "colors" JSONB NOT NULL,
    "sizes" JSONB NOT NULL,
    "status" VARCHAR(16) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supplier_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers"."print_options" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "technique" VARCHAR(16) NOT NULL,
    "sizes" JSONB NOT NULL,
    "placements" JSONB NOT NULL,
    "unit_fee_amount" DECIMAL(18,4) NOT NULL,
    "unit_fee_currency" VARCHAR(3) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "print_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "suppliers_tenant_id_status_idx" ON "suppliers"."suppliers"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_tenant_id_tax_id_key" ON "suppliers"."suppliers"("tenant_id", "tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_members_user_id_key" ON "suppliers"."supplier_members"("user_id");

-- CreateIndex
CREATE INDEX "supplier_members_supplier_id_idx" ON "suppliers"."supplier_members"("supplier_id");

-- CreateIndex
CREATE INDEX "supplier_products_supplier_id_status_idx" ON "suppliers"."supplier_products"("supplier_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "print_options_product_id_technique_key" ON "suppliers"."print_options"("product_id", "technique");

-- AddForeignKey
ALTER TABLE "suppliers"."supplier_members" ADD CONSTRAINT "supplier_members_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"."suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers"."supplier_products" ADD CONSTRAINT "supplier_products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"."suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers"."print_options" ADD CONSTRAINT "print_options_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "suppliers"."supplier_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
