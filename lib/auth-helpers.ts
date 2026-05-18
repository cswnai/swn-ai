import { auth } from "./auth";
import { NextResponse } from "next/server";

export async function requireTenantAccess(): Promise<
  { tenantId: string; userId: string } | NextResponse
> {
  const session = await auth();

  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return {
    tenantId: session.user.tenantId,
    userId: session.user.id,
  };
}

export function isAuthError(
  result: { tenantId: string; userId: string } | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
