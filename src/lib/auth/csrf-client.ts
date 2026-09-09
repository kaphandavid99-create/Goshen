export async function readCsrf() {
  const response = await fetch("/api/auth/csrf", { cache: "no-store" });
  const data = (await response.json()) as { token?: string };
  return data.token ?? "";
}
