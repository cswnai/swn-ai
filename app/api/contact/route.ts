import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log("Contact form submission:", body);
  // TODO: Wire up email provider (e.g. Resend, SendGrid, Nodemailer)
  // TODO: Forward to conor.sweeney00@gmail.com
  return NextResponse.json({ success: true }, { status: 200 });
}
