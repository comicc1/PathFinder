import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "./server";

export async function requireUserOrRedirect() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getOptionalUser() {
  return getCurrentUser();
}
