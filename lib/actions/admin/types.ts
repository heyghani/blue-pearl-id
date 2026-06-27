export type AdminActionState = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
  fieldErrors?: Record<string, string[]>;
};
