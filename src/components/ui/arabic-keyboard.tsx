import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Keyboard, X } from "lucide-react";

interface ArabicKeyboardProps {
  onInsert: (char: string) => void;
  onClose?: () => void;
}

const arabicKeys = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
  ['ذ', 'أ', 'إ', 'آ', 'ـ', ' ']
];

const diacritics = ['َ', 'ً', 'ُ', 'ٌ', 'ِ', 'ٍ', 'ْ', 'ّ', 'ٰ'];

export const ArabicKeyboard = ({ onInsert, onClose }: ArabicKeyboardProps) => {
  const [showDiacritics, setShowDiacritics] = useState(false);

  return (
    <Card className="p-4 w-full shadow-lg border-2 border-primary/20">
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showDiacritics ? "default" : "outline"}
            onClick={() => setShowDiacritics(!showDiacritics)}
          >
            التشكيل
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onInsert(' ')}
          >
            مسافة
          </Button>
        </div>
        {onClose && (
          <Button
            size="sm"
            variant="ghost"
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
              variant="outline"
              size="sm"
              className="min-w-[40px] h-10 text-lg"
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
                  variant="outline"
                  size="sm"
                  className="min-w-[40px] h-10 text-lg flex-shrink-0"
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

export const ArabicInputWithKeyboard = ({ value, onChange, placeholder, className }: ArabicInputProps) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleInsert = (char: string) => {
    const newValue = value.slice(0, cursorPosition) + char + value.slice(cursorPosition);
    onChange(newValue);
    setCursorPosition(cursorPosition + char.length);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setCursorPosition(target.selectionStart || 0);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
          dir="rtl"
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10 ${className}`}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="absolute left-2 top-1/2 -translate-y-1/2"
          onClick={() => setShowKeyboard(!showKeyboard)}
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </div>

      {showKeyboard && (
        <ArabicKeyboard
          onInsert={handleInsert}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </div>
  );
};
