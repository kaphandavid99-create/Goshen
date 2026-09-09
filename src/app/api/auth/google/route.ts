import { googleLoginRedirect } from "@/server/auth/google";

export function GET(request: Request) {
  return googleLoginRedirect(request);
}
