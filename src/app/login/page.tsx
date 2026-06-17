import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const next = params?.next;
  const nextPath = typeof next === "string" && next.length > 0 ? next : "/dashboard";

  return <LoginForm nextPath={nextPath} />;
}
