import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string;
      email: string;
      name?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tenantId: string;
  }
}
