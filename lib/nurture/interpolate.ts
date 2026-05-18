import { LeadAnswer } from "@prisma/client";

export function interpolate(template: string, answers: LeadAnswer[]): string {
  const get = (key: string) =>
    answers.find((a) => a.fieldKey === key)?.value ?? "";

  const firstName = get("name").split(" ")[0] || get("name");
  const business = get("business");
  const email = get("email");

  return template
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{\{firstName\}\}/g, firstName)
    .replace(/\{\{business\}\}/g, business)
    .replace(/\{\{businessName\}\}/g, business)
    .replace(/\{\{email\}\}/g, email);
}
