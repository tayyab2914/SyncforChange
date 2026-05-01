import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export default function FormField({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-bold text-on-surface"
      >
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {hint && (
        <p className="text-xs text-stone-400">{hint}</p>
      )}
      {children}
      {error && (
        <p className="text-xs text-error font-medium mt-1">{error}</p>
      )}
    </div>
  );
}
