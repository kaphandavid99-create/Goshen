import { googleCallback, googleFailRedirect } from "@/server/auth/google";

export async function GET(request: Request) {
  try {
    return await googleCallback(request);
  } catch (error) {
    console.error("Google callback failed", error);
    return googleFailRedirect("login", "google");
  }
}
