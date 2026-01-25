-- Function to check and delete old records
CREATE OR REPLACE FUNCTION delete_old_transactions() RETURNS trigger AS $$
BEGIN
  DELETE FROM transactions 
  WHERE deleted_at < NOW() - INTERVAL '15 days';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run on DELETE or UPDATE (specifically when deleted_at changes)
-- Actually, a scheduled job is better, but user asked for a trigger.
-- We can make it trigger whenever ANY transaction is "soft deleted" (updated).
-- This ensures that every time we soft delete something, we clean up the house.

DROP TRIGGER IF EXISTS trigger_delete_old_transactions ON transactions;

CREATE TRIGGER trigger_delete_old_transactions
AFTER UPDATE OF deleted_at ON transactions
FOR EACH STATEMENT
EXECUTE FUNCTION delete_old_transactions();
