-- Keep reset tokens out of Supabase's REST API even if the event trigger that
-- enables RLS is missing. Prisma connects as the table owner and is unaffected.
ALTER TABLE "PasswordReset" ENABLE ROW LEVEL SECURITY;
