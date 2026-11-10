export interface FormState {
  error?: string;
  notice?: string;
}

export const EMPTY_FORM_STATE: FormState = {};

// What a server action called from a TanStack Query mutation returns. The
// error comes back as data because Next.js hides thrown messages in production.
export type ActionResult<T> =
  | { data: T; error?: undefined }
  | { error: string; data?: undefined };
