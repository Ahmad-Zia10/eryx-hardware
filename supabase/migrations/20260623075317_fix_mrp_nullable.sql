-- Migration: fix mrp constraint to allow NULL for hardware items
-- without published pricing (e.g. "Contact for specifications" SKUs).
-- Discovered during the catalogue data integration — the original
-- schema assumed every product has a listed price, which doesn't
-- hold for several hardware categories in the real catalogue.

alter table products alter column mrp drop not null;