import { isRedirectError } from "next/dist/client/components/redirect-error";

export function rethrowIfRedirect(error: unknown): never | void {
  if (isRedirectError(error)) {
    throw error;
  }
}
