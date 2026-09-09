export type UserRole = "CUSTOMER" | "STAFF" | "ADMIN";

export type WholesaleStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  wholesaleStatus: WholesaleStatus;
  avatarUrl: string | null;
};
