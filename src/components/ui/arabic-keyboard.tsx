import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Keyboard, X } from "lucide-react";

interface ArabicKeyboardProps {
  onInsert: (char: string) => void;
  onClose?: () => void;
}

// Complete Arabic alphabet (28 letters) + special characters
const arabicKeys = [
  ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج", "د", "ذ"],
  ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط", "ظ"],
  ["ز", "و", "ة", "ى", "ر", "ء", "ئ", "ؤ", "أ", "إ", "آ"],
  ["لا", "لأ", "لإ", "لآ", "ـ", " "],
];

const diacritics = ["َ", "ً", "ُ", "ٌ", "ِ", "ٍ", "ْ", "ّ", "ٰ"];

export const ArabicKeyboard = ({ onInsert, onClose }: ArabicKeyboardProps) => {
  const [showDiacritics, setShowDiacritics] = useState(false);

  return (
    <Card className="p-4 w-full shadow-lg border-2 border-primary/20">
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={showDiacritics ? "default" : "outline"}
            onPointerDownCapture={(e) => e.preventDefault()}
            onClick={() => setShowDiacritics((v) => !v)}
          >
            التشكيل
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onPointerDownCapture={(e) => e.preventDefault()}
            onClick={() => onInsert(" ")}
          >
            مسافة
          </Button>
        </div>
        {onClose && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onPointerDownCapture={(e) => e.preventDefault()}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showDiacritics ? (
        <div className="flex flex-wrap gap-1 justify-center mb-2">
          {diacritics.map((char) => (
            <Button
              key={char}
              type="button"
              variant="outline"
              size="sm"
              className="min-w-[40px] h-10 text-lg"
              onPointerDownCapture={(e) => e.preventDefault()}
              onClick={() => onInsert(char)}
            >
              {char}
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-1 overflow-x-auto">
          {arabicKeys.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center flex-nowrap">
              {row.map((char) => (
                <Button
                  key={char}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-w-[40px] h-10 text-lg flex-shrink-0"
                  onPointerDownCapture={(e) => e.preventDefault()}
                  onClick={() => onInsert(char)}
                >
                  {char}
                </Button>
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

interface ArabicInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ArabicInputWithKeyboard = ({
  value,
  onChange,
  placeholder,
  className,
}: ArabicInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const pendingCaretRef = useRef<number | null>(null);

  const syncSelection = () => {
    const el = inputRef.current;
    if (!el) return;
    selectionRef.current = {
      start: el.selectionStart ?? selectionRef.current.start,
      end: el.selectionEnd ?? selectionRef.current.end,
    };
  };

  const getSelection = () => {
    syncSelection();
    return selectionRef.current;
  };

  useEffect(() => {
    const pos = pendingCaretRef.current;
    if (pos == null) return;

    pendingCaretRef.current = null;
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      try {
        el.setSelectionRange(pos, pos);
      } catch {
        // noop
      }
      selectionRef.current = { start: pos, end: pos };
    });
  }, [value]);

  const handleInsert = (char: string) => {
    const { start, end } = getSelection();
    const newValue = value.slice(0, start) + char + value.slice(end);
    const nextPos = start + char.length;

    pendingCaretRef.current = nextPos;
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    selectionRef.current = {
      start: e.target.selectionStart ?? 0,
      end: e.target.selectionEnd ?? e.target.selectionStart ?? 0,
    };
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onClick={syncSelection}
          onKeyUp={syncSelection}
          onSelect={syncSelection}
          onFocus={syncSelection}
          placeholder={placeholder}
          dir="rtl"
          lang="ar"
          inputMode="text"
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 ${className || ""}`}
        />

        <Popover open={showKeyboard} onOpenChange={setShowKeyboard}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onPointerDownCapture={(e) => e.preventDefault()}
              aria-label="Clavier arabe"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            className="z-[10001] w-[560px] max-w-[calc(100vw-2rem)] p-2"
          >
            <ArabicKeyboard onInsert={handleInsert} onClose={() => setShowKeyboard(false)} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
