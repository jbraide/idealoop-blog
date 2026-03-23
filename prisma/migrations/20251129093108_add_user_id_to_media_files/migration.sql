-- Add userId column as nullable first
ALTER TABLE "media_files" ADD COLUMN     "userId" TEXT;

-- Find an admin user to use as default for existing records
DO $$
DECLARE
    admin_user_id TEXT;
BEGIN
    -- Get the first admin user ID
    SELECT id INTO admin_user_id FROM users WHERE role = 'ADMIN' LIMIT 1;

    -- If no admin user found, get any user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM users LIMIT 1;
    END IF;

    -- Update existing records with the found user ID
    UPDATE "media_files" SET "userId" = admin_user_id WHERE "userId" IS NULL;
END $$;

-- Now make userId required
ALTER TABLE "media_files" ALTER COLUMN "userId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
