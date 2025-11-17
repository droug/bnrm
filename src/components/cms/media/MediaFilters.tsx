import { Button } from "@/components/ui/button";
import { Image, Video, FileText, Music, X } from "lucide-react";

interface MediaFiltersProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
}

export default function MediaFilters({ selectedType, onTypeChange }: MediaFiltersProps) {
  const filters = [
    { type: "image", label: "Images", icon: Image },
    { type: "video", label: "Vidéos", icon: Video },
    { type: "audio", label: "Audio", icon: Music },
    { type: "document", label: "Documents", icon: FileText },
  ];

  return (
    <div className="flex items-center gap-2">
      {filters.map(({ type, label, icon: Icon }) => (
        <Button
          key={type}
          size="sm"
          variant={selectedType === type ? "default" : "outline"}
          onClick={() => onTypeChange(selectedType === type ? null : type)}
        >
          <Icon className="h-4 w-4 mr-1" />
          {label}
        </Button>
      ))}
      {selectedType && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onTypeChange(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
