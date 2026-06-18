import crypto from "crypto";

export function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function verificationExpiry(hours = 24) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export function passwordResetExpiry(hours = 1) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

export const PASSWORD_RESET_PREFIX = "password-reset:";
