# Supabase Test Accounts Setup

This guide will help you set up Supabase for managing test accounts in your Yahoo Mail application.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - Project name: `yahoo-mail-test-accounts` (or your preferred name)
   - Database password: Choose a strong password
   - Region: Select the region closest to you
5. Click "Create new project"

## Step 2: Get Your Supabase Credentials

1. Once your project is created, go to Project Settings > API
2. Copy the following values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Update Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## Step 4: Create the Database Table

1. In your Supabase project dashboard, go to the SQL Editor
2. Open the `supabase-schema.sql` file in your project root
3. Copy the entire SQL content
4. Paste it into the SQL Editor in Supabase
5. Click "Run" to execute the SQL

This will create:
- A `test_accounts` table
- Row Level Security (RLS) policies for secure access
- Sample test accounts (you should update these with real test data)
- Necessary indexes for performance

## Step 5: Add Your Test Accounts

You have two options to add test accounts:

### Option A: Using Supabase Dashboard

1. Go to Table Editor in your Supabase dashboard
2. Select the `test_accounts` table
3. Click "Insert" > "Insert row"
4. Fill in the following fields:
   - **email**: The test account email (e.g., test@yahoo.com)
   - **oauth_token**: The Yahoo OAuth token for this account
   - **is_active**: true (check the box)
5. Click "Save"

### Option B: Using SQL

1. Go to SQL Editor in Supabase
2. Run SQL like this:

```sql
INSERT INTO test_accounts (email, oauth_token, is_active) VALUES
  ('test1@yahoo.com', 'your_actual_oauth_token_1', true),
  ('test2@yahoo.com', 'your_actual_oauth_token_2', true);
```

## Step 6: Test the Integration

1. Restart your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the login page (`http://localhost:3000/login`)

3. You should see a "Or use a test account" section with a "Show" button

4. Click "Show" to reveal your test accounts

5. Click on any test account to automatically log in

## Security Notes

- The `anon` key is safe to use in the browser because Row Level Security (RLS) is enabled
- Only active test accounts (`is_active = true`) are visible through the API
- You can deactivate test accounts by setting `is_active = false` in the Supabase dashboard
- Never commit real OAuth tokens to version control

## Troubleshooting

### Error: "Missing Supabase environment variables"

- Make sure you've added both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your `.env` file
- Restart your development server after updating `.env`

### Test accounts not showing up

- Check that you've run the SQL schema in Supabase
- Verify that test accounts have `is_active = true`
- Check the browser console for any errors
- Verify your Supabase credentials are correct

### RLS (Row Level Security) errors

- Make sure you ran the entire SQL schema, including the RLS policy
- The policy allows public read access to active test accounts only

## Managing Test Accounts

### To add a new test account:

```sql
INSERT INTO test_accounts (email, oauth_token, is_active)
VALUES ('newtest@yahoo.com', 'new_oauth_token_here', true);
```

### To deactivate a test account:

```sql
UPDATE test_accounts
SET is_active = false
WHERE email = 'test@yahoo.com';
```

### To reactivate a test account:

```sql
UPDATE test_accounts
SET is_active = true
WHERE email = 'test@yahoo.com';
```

### To delete a test account:

```sql
DELETE FROM test_accounts
WHERE email = 'test@yahoo.com';
```
