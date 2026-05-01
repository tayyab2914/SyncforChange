"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/auth/email";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type AuthState = {
  error?: string;
  success?: string;
  email?: string;
};

export async function signupAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: "ORGANIZER",
      emailVerified: false,
    },
  });

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${baseUrl}/auth/verify?token=${rawToken}`;

  try {
    await sendVerificationEmail(normalizedEmail, link);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    return { error: "Account created but we couldn't send the email. Try resending from the verify page." };
  }

  return { success: "ok", email: normalizedEmail };
}

export async function resendVerificationAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  if (!email) return { error: "Email required." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "No account found for that email." };
  if (user.emailVerified) return { error: "Email is already verified. You can sign in." };

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${baseUrl}/auth/verify?token=${rawToken}`;

  try {
    await sendVerificationEmail(email, link);
  } catch (err) {
    console.error("Failed to resend verification email:", err);
    return { error: "Failed to send email. Try again in a moment." };
  }

  return { success: "ok", email };
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const next = String(formData.get("next") ?? "/");
  const email = parsed.data.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  if (!user.emailVerified) {
    return { error: "Please verify your email before signing in. Check your inbox." };
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    profileCompleted: user.profileCompleted,
  });

  // Force profile setup before any organizer activity
  if (user.role === "ORGANIZER" && !user.profileCompleted) {
    redirect(`/profile/setup?next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
