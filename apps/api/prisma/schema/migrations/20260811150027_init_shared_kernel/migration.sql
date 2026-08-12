-- Arranque del kernel compartido.
--
-- Estas tres cosas tienen que existir ANTES que cualquier tabla que las use. Van aquí y no
-- sólo en `docker/postgres/init/`, porque ese script se ejecuta únicamente al crear el
-- volumen de desarrollo: la base de datos de sombra de Prisma, la de CI y cualquier
-- entorno nuevo aplican SÓLO estas migraciones. Sin esto, `prisma migrate deploy` falla en
-- el primer despliegue con "function shared.uuid_generate_v7() does not exist".

CREATE SCHEMA IF NOT EXISTS "shared";

-- gen_random_bytes, que usa uuid_generate_v7
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- UUID v7: ordenable en el tiempo, no enumerable, sin filtrar volumen de negocio
-- (docs/03-conventions.md §5). PostgreSQL 18 lo trae nativo; en 16 se genera aquí.
CREATE OR REPLACE FUNCTION shared.uuid_generate_v7()
RETURNS uuid
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  unix_ts_ms = substring(int8send((extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3);
  uuid_bytes = unix_ts_ms || gen_random_bytes(10);
  uuid_bytes = set_byte(uuid_bytes, 6, (b'0111' || get_byte(uuid_bytes, 6)::bit(4))::bit(8)::int);
  uuid_bytes = set_byte(uuid_bytes, 8, (b'10'   || get_byte(uuid_bytes, 8)::bit(6))::bit(8)::int);
  RETURN encode(uuid_bytes, 'hex')::uuid;
END
$$ LANGUAGE plpgsql VOLATILE;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "shared";

-- CreateTable
CREATE TABLE "shared"."outbox_events" (
    "id" UUID NOT NULL DEFAULT shared.uuid_generate_v7(),
    "event_id" UUID NOT NULL,
    "type" VARCHAR(128) NOT NULL,
    "payload" JSONB NOT NULL,
    "tenant_id" VARCHAR(64) NOT NULL,
    "correlation_id" VARCHAR(128) NOT NULL,
    "occurred_at" TIMESTAMPTZ NOT NULL,
    "status" VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared"."processed_events" (
    "event_id" UUID NOT NULL,
    "handler" VARCHAR(128) NOT NULL,
    "processed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_events_pkey" PRIMARY KEY ("event_id","handler")
);

-- CreateTable
CREATE TABLE "shared"."idempotency_records" (
    "id" UUID NOT NULL DEFAULT shared.uuid_generate_v7(),
    "account_id" UUID NOT NULL,
    "idempotency_key" UUID NOT NULL,
    "request_hash" VARCHAR(64) NOT NULL,
    "response_status" INTEGER NOT NULL,
    "response_body" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "outbox_events_event_id_key" ON "shared"."outbox_events"("event_id");

-- CreateIndex
CREATE INDEX "outbox_events_status_occurred_at_idx" ON "shared"."outbox_events"("status", "occurred_at");

-- CreateIndex
CREATE INDEX "idempotency_records_expires_at_idx" ON "shared"."idempotency_records"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_records_account_id_idempotency_key_key" ON "shared"."idempotency_records"("account_id", "idempotency_key");
