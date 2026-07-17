-- promo_usages.promo_code_id was originally ON DELETE CASCADE. That means
-- hard-deleting a promo would silently wipe every historical usage row —
-- destroying the audit trail of "which orders used which promo, when, by
-- whom". Flip it to RESTRICT so that used codes can't be hard-deleted at
-- all; the admin surface will block delete on used codes and prompt them
-- to toggle inactive instead (matches the removeProductVariant pattern).
--
-- orders.promo_code_id is intentionally left at SET NULL — the discount
-- amount is snapshotted on the order row, so orders survive a code
-- deletion without losing anything material.

ALTER TABLE promo_usages
  DROP CONSTRAINT promo_usages_promo_code_id_fkey,
  ADD CONSTRAINT promo_usages_promo_code_id_fkey
    FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id) ON DELETE RESTRICT;
