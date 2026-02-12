import { validatePassword } from "@/lib/passwordValidation";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const { checks } = validatePassword(password);

  const rules = [
    { key: "minLength", label: "8 caractères minimum", met: checks.minLength },
    { key: "hasUppercase", label: "Une majuscule (A–Z)", met: checks.hasUppercase },
    { key: "hasLowercase", label: "Une minuscule (a–z)", met: checks.hasLowercase },
    { key: "hasDigit", label: "Un chiffre (0–9)", met: checks.hasDigit },
    { key: "hasSymbol", label: "Un symbole (!@#$%…)", met: checks.hasSymbol },
  ];

  return (
    <div className="mt-2 space-y-1">
      {rules.map((rule) => (
        <div key={rule.key} className="flex items-center gap-2 text-xs">
          {rule.met ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <X className="h-3 w-3 text-muted-foreground" />
          )}
          <span className={rule.met ? "text-green-700" : "text-muted-foreground"}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
}
