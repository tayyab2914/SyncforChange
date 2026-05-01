"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { generateRawToken, hashToken } from "@/lib/auth/tokens";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/auth/email";

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

// ───────── Password reset ─────────

const requestResetSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = requestResetSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Send the email only if the user actually exists, but always return the
  // same success state so we don't leak which emails are registered.
  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const link = `${baseUrl}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail(email, link);
    } catch (err) {
      console.error("Failed to send password reset email:", err);
      // Still return success to avoid leaking — user can retry from the form
    }
  }

  return { success: "ok", email };
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(10, "Missing reset token."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match.",
    path: ["confirm"],
  });

export type ResetPasswordState = {
  error?: string;
  success?: boolean;
};

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) {
    return { error: "This reset link is invalid. Request a new one." };
  }
  if (record.usedAt) {
    return { error: "This reset link has already been used. Request a new one." };
  }
  if (record.expiresAt < new Date()) {
    return { error: "This reset link has expired. Request a new one." };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate all other reset tokens for this user
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId, id: { not: record.id } },
    }),
  ]);

  return { success: true };
}
