/**
 * FieldError — render inline validation errors with friendly tone.
 * Usage: <FieldError message={errors.offerName} />
 */

interface FieldErrorProps {
  message?: string;
}

export default function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-amber-400/80 flex items-center gap-1">
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}

/**
 * Friendly error message helpers — call these instead of raw field names.
 */
export const friendlyErrors = {
  required: (field: string) => `${field} is required before we can continue.`,
  tooShort: (field: string, min: number) =>
    `${field} needs at least ${min} characters — a little more detail helps the analysis.`,
  tooLong: (field: string, max: number) =>
    `${field} is over the ${max}-character limit. Trim it down a bit.`,
  invalidEmail: () => `That doesn't look like a valid email address.`,
  invalidPrice: () => `Enter a number — e.g. 3000 or 5000. No currency symbols needed.`,
};
