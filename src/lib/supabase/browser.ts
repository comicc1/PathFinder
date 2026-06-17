"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let browserClient: SupabaseClient<Database> | null = null;

function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }
  try {
    const parsed = new URL(value);
    return parsed.pathname.includes("/rest/v1") ? parsed.origin : parsed.origin;
  } catch {
    return value.replace(/\/rest\/v1\/?$/i, "");
  }
}

function getSupabaseAnonKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!value) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return value;
}

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
    );
  }

  return browserClient;
}
