# Short Term Plan: Supabase Integration (Initial)

## Goal: Integrate Supabase authentication and display user data on IndexPage.

## Checklist & Steps:

1.  [ ] **File Creation:**
    *   [X] Create `docs/SHORT_PLANNING.md`
    *   [ ] Create `docs/TASK.md`
2.  [ ] **Supabase Setup Verification:**
    *   [ ] Verify `users` table existence via Supabase MCP.
3.  [ ] **Code Implementation:**
    *   [ ] Create `src/lib/supabase/supabaseClient.ts` for Supabase client initialization.
    *   [ ] Create `src/lib/supabase/useSupabaseAuth.ts` custom hook for authentication logic:
        *   Fetch Telegram user data.
        *   Check Supabase for existing user.
        *   Create user in Supabase Auth & `users` table if new.
        *   Update `last_login`.
    *   [ ] Update `src/pages/IndexPage/IndexPage.tsx`:
        *   Use `useSupabaseAuth` hook.
        *   Display Supabase connection status.
        *   Display current user's data from Supabase.
        *   Display list of all users from `public.users` table.
4.  [ ] **Documentation:**
    *   [ ] Update `docs/architecture.md` with Supabase integration details.
5.  [ ] **Review & Testing:**
    *   [ ] Ensure no existing Telegram functionality is broken.
    *   [ ] Test Supabase connection and data display on `IndexPage`.

## Key Considerations:
*   Use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local` for client-side Supabase.
*   RLS is currently disabled on `public.users` table.
*   Do not modify Telegram SDK integrations.
*   Do not modify `ProfilePage`. 