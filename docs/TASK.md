# Task Management: Supabase Integration

## Current Sprint: Supabase Core Integration

### Main Task: Implement Supabase Authentication & IndexPage Display (Est: 4h)

*   **ID:** SUPA-AUTH-001
*   **Description:** Integrate Supabase for user authentication using Telegram credentials. Display auth status and user data on the main IndexPage. **Includes creating new users in Supabase Auth and `public.users` table if they don't exist, and updating existing user data from Telegram `initData`.**
*   **Status:** 🟡 В процессе
*   **Sub-tasks:**
    *   **SUPA-AUTH-001.1:** 🟢 Verify `users` table in Supabase.
        *   Action: Use Supabase MCP `list_tables`.
    *   **SUPA-AUTH-001.2:** 🟢 Create Supabase client instance.
        *   File: `src/lib/supabase/supabaseClient.ts`
    *   **SUPA-AUTH-001.3:** 🟢 Develop `useSupabaseAuth` hook.
        *   File: `src/lib/supabase/useSupabaseAuth.ts`
        *   Logic:
            *   Accepts `launchParams` (containing `initData`) as a prop.
            *   Retrieves Telegram user data from `initData.user`.
            *   Checks if user exists in Supabase `public.users` table (by `telegram_id`).
            *   **If exists:**
                *   Updates `last_login` in `public.users` table.
                *   Updates `first_name`, `last_name`, `username`, `photo_url` from `initData.user`.
            *   **If not exists:**
                *   Generates email (`<telegram_id>@telegram.user`) and random password.
                *   Calls `supabase.auth.signUp()` with email, password, and TG user details in `options.data`.
                *   If `signUp` is successful, takes new `AuthUser.id` and inserts a record into `public.users` table with all TG user details.
                *   Handles `User already registered` error from `signUp` by attempting `signInWithPassword` and then creating the profile in `public.users`.
            *   Returns Supabase user data (`DbUser`, `AuthUser`), connection/loading/error state, and status messages.
    *   **SUPA-AUTH-001.4:** 🟢 Update `IndexPage.tsx`.
        *   File: `src/pages/IndexPage/IndexPage.tsx`
        *   Logic:
            *   Retrieves `launchParams` using `retrieveLaunchParams()`.
            *   Integrates `useSupabaseAuth` hook, passing `launchParams`.
            *   Displays auth status, Supabase connection status, and status messages from the hook.
            *   Displays current user's details from Supabase (`dbUser`, `sessionUser`).
            *   Fetches and lists all users from `public.users`.
    *   **SUPA-AUTH-001.5:** 🟢 Update `architecture.md`.
    *   **SUPA-AUTH-001.6:** 🟡 Testing & Verification by user.

### Discovered in ходе работы:
*   Linter issues with `@telegram-apps/sdk-react` `useInitData` type, switched to `retrieveLaunchParams()`.
*   Required installation of `uuid` and `@types/uuid`.
*   Careful handling of `launchParams` and `initData` typings needed, simplified with `any` for now to avoid SDK type wrestling.

---
*Date Initialized: 2024-07-19*
*Last Update: $(date +'%Y-%m-%d')* 