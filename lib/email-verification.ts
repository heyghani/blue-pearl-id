/** When true, new accounts are active immediately without a verification email. */
export function isEmailVerificationEnabled(): boolean {
  return process.env.SKIP_EMAIL_VERIFICATION !== "true";
}
