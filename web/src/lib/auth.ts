import path from "node:path";
import Database from "better-sqlite3";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins/magic-link";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

async function sendMagicLink(email: string, url: string) {
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Cat Wine Club <onboarding@resend.dev>",
        to: email,
        subject: "Your Cat Wine Club sign-in link",
        html: `<p>Click below to sign in to Cat Wine Club:</p><p><a href="${url}">${url}</a></p><p>This link expires in 10 minutes. If you didn't request it, you can ignore this email.</p>`,
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to send magic link email: ${res.status} ${await res.text()}`);
    }
    return;
  }

  // Dev fallback: no RESEND_API_KEY configured, so print the link instead
  // of sending an email. Set RESEND_API_KEY + EMAIL_FROM to send for real.
  console.log(`\n[dev magic link] ${email} -> ${url}\n`);
}

export const auth = betterAuth({
  database: new Database(path.join(process.cwd(), "auth.db")),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  session: {
    // Members stay signed in for a year once they follow a magic link.
    expiresIn: ONE_YEAR_IN_SECONDS,
    updateAge: 60 * 60 * 24 * 30,
  },
  plugins: [
    magicLink({
      expiresIn: 60 * 10,
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLink(email, url);
      },
    }),
    nextCookies(),
  ],
});
