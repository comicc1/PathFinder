"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import styles from "./SignOutButton.module.css";

export default function SignOutButton() {
  const router = useRouter();

  async function handleClick() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" className={styles.button} onClick={handleClick}>
      Sign out
    </button>
  );
}
