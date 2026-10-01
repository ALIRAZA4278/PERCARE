-- PART 1 of 2 — read-only. Shows which columns are required.
--
-- Every row marked "required" is a column the old code either omitted or sent
-- NULL for, which is exactly why those creates silently did nothing.
--
-- Already run — this is the file that produced the table with store_type,
-- ban_type, amount and target_id all marked required.

SELECT
  c.table_name,
  c.column_name,
  c.is_nullable,
  CASE WHEN c.is_nullable = 'NO' THEN 'required' ELSE '' END AS note
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND (
    (c.table_name = 'shelter_animals'   AND c.column_name IN ('species','gender','adoption_status','age_years','name'))
 OR (c.table_name = 'stores'            AND c.column_name = 'store_type')
 OR (c.table_name = 'user_bans'         AND c.column_name = 'ban_type')
 OR (c.table_name = 'donation_packages' AND c.column_name = 'amount')
 OR (c.table_name = 'admin_audit_log'   AND c.column_name = 'target_id')
  )
ORDER BY c.table_name, c.column_name;
