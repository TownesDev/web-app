import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY!;
export const resend = new Resend(apiKey);

export const EMAIL_FROM =
  process.env.EMAIL_FROM || "TownesDev <noreply@townes.dev>"; // use verified domain/sender
