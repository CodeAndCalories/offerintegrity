/**
 * FieldError — renders a validation error message beneath a form field.
 * Usage: <FieldError message="Please enter your email." />
 */

interface Props {
  message: string;
}

export default function FieldError({ message }: Props) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
      <span aria-hidden>⚠</span>
      {message}
    </p>
  );
}
