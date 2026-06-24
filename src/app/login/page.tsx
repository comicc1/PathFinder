import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const next = params?.next;
  const nextPath = typeof next === "string" && next.length > 0 ? next : "/dashboard";
  const modeParam = params?.mode;
  const initialMode = modeParam === "sign-up" ? "sign-up" : "sign-in";

  return <LoginForm nextPath={nextPath} initialMode={initialMode} />;
}
