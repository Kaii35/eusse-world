-- Un esquema de PostgreSQL por contexto acotado (ADR-0006).
-- Impide joins accidentales entre contextos y permite separar bases de datos
-- después sin refactorizar código.
--
-- SIN CLAVES FORÁNEAS ENTRE ESQUEMAS. La referencia cruzada se guarda por ID.

CREATE SCHEMA IF NOT EXISTS shared;      -- outbox, processed_events, idempotency
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS accounts;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS pricing;
CREATE SCHEMA IF NOT EXISTS cart;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS notifications;
CREATE SCHEMA IF NOT EXISTS search;

-- Extensiones necesarias en Fase 1
CREATE EXTENSION IF NOT EXISTS pg_trgm;             -- búsqueda tolerante a erratas (RFC-0005)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;  -- diagnóstico de consultas lentas

-- UUID v7: ordenable en el tiempo, no enumerable, sin filtrar volumen de negocio.
-- PostgreSQL 18 lo trae nativo; en 16 se genera en la aplicación.
-- Esta función existe para seeds y para valores por defecto en migraciones.
CREATE OR REPLACE FUNCTION shared.uuid_generate_v7()
RETURNS uuid
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  unix_ts_ms = substring(int8send((extract(epoch FROM clock_timestamp()) * 1000)::bigint) FROM 3);
  uuid_bytes = unix_ts_ms || gen_random_bytes(10);
  -- versión 7
  uuid_bytes = set_byte(uuid_bytes, 6, (b'0111' || get_byte(uuid_bytes, 6)::bit(4))::bit(8)::int);
  -- variante RFC 4122
  uuid_bytes = set_byte(uuid_bytes, 8, (b'10'   || get_byte(uuid_bytes, 8)::bit(6))::bit(8)::int);
  RETURN encode(uuid_bytes, 'hex')::uuid;
END
$$ LANGUAGE plpgsql VOLATILE;

COMMENT ON FUNCTION shared.uuid_generate_v7() IS
  'UUID v7 — docs/03-conventions.md §5. Ordenable en el tiempo, no enumerable.';
