import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InlineSelect } from "@/components/ui/inline-select";
import { SimpleEntitySelect } from "@/components/ui/simple-entity-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { NationalityMultiSelect } from "@/components/ui/nationality-multi-select";
import { Plus, Trash2, User, ChevronDown, ChevronUp } from "lucide-react";
import { moroccanRegions, getCitiesByRegion } from "@/data/moroccanRegions";
import { DynamicFieldRenderer } from "@/components/form-builder/DynamicFieldRenderer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface Author {
  id: string;
  authorType: string;
  authorLastName: string;
  authorFirstName: string;
  authorName: string; // Keep for backward compatibility (will be computed)
  pseudonym: string;
  gender: string;
  nationalities: string[];
  otherNationality: string;
  phoneFixed: string;
  phoneMobile: string;
  email: string;
  region: string;
  city: string;
  representant: string;
  customFields: Record<string, any>;
}

interface MultipleAuthorsSectionProps {
  authors: Author[];
  onAuthorsChange: (authors: Author[]) => void;
  customFields?: any[];
  language: string;
  maxAuthors?: number;
}

const createEmptyAuthor = (): Author => ({
  id: crypto.randomUUID(),
  authorType: "",
  authorLastName: "",
  authorFirstName: "",
  authorName: "",
  pseudonym: "",
  gender: "",
  nationalities: [],
  otherNationality: "",
  phoneFixed: "",
  phoneMobile: "",
  email: "",
  region: "",
  city: "",
  representant: "",
  customFields: {},
});

export function MultipleAuthorsSection({
  authors,
  onAuthorsChange,
  customFields = [],
  language,
  maxAuthors = 10,
}: MultipleAuthorsSectionProps) {
  const [expandedAuthors, setExpandedAuthors] = useState<Record<string, boolean>>(() => {
    // First author is expanded by default
    const initial: Record<string, boolean> = {};
    if (authors.length > 0) {
      initial[authors[0].id] = true;
    }
    return initial;
  });

  const addAuthor = () => {
    if (authors.length >= maxAuthors) return;
    const newAuthor = createEmptyAuthor();
    onAuthorsChange([...authors, newAuthor]);
    setExpandedAuthors(prev => ({ ...prev, [newAuthor.id]: true }));
  };

  const removeAuthor = (authorId: string) => {
    if (authors.length <= 1) return;
    onAuthorsChange(authors.filter(a => a.id !== authorId));
    setExpandedAuthors(prev => {
      const newState = { ...prev };
      delete newState[authorId];
      return newState;
    });
  };

  const updateAuthor = (authorId: string, updates: Partial<Author>) => {
    onAuthorsChange(
      authors.map(a => (a.id === authorId ? { ...a, ...updates } : a))
    );
  };

  const toggleExpanded = (authorId: string) => {
    setExpandedAuthors(prev => ({
      ...prev,
      [authorId]: !prev[authorId],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold">Identification de l'auteur</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAuthor}
          disabled={authors.length >= maxAuthors}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un auteur
        </Button>
      </div>

      <div className="space-y-4">
        {authors.map((author, index) => {
          const isExpanded = expandedAuthors[author.id] ?? false;
          const isPersonnePhysique = 
            author.authorType.toLowerCase().includes("physique") ||
            author.authorType === "physique" ||
            author.authorType === "Personne physique";
          const isPersonneMorale = 
            author.authorType.toLowerCase().includes("morale") ||
            author.authorType === "morale" ||
            author.authorType === "Personne morale";

          return (
            <Card key={author.id} className="border overflow-visible">
              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(author.id)}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium">
                          Auteur {index + 1}
                          {(author.authorLastName || author.authorFirstName || author.authorName) && 
                            ` - ${author.authorLastName || ''} ${author.authorFirstName || author.authorName || ''}`.trim()}
                        </span>
                        {author.authorType && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({author.authorType === "physique" || author.authorType.toLowerCase().includes("physique") 
                              ? "Personne physique" 
                              : "Personne morale"})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {authors.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAuthor(author.id);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-visible">
                  <CardContent className="pt-0 pb-4 overflow-visible">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Type de l'auteur */}
                      <div className="space-y-2">
                        <Label>Type de l'auteur <span className="text-destructive">*</span></Label>
                        <InlineSelect
                          placeholder="Sélectionner le type"
                          value={author.authorType}
                          onChange={(value) => updateAuthor(author.id, { authorType: value })}
                          options={[
                            { value: "physique", label: "Personne physique" },
                            { value: "morale", label: "Personne morale (collectivités)" },
                          ]}
                        />
                      </div>

                      {/* Représentant - only for Personne Morale */}
                      {isPersonneMorale && (
                        <div className="space-y-2">
                          <Label>Représentant <span className="text-destructive">*</span></Label>
                          <Input
                            placeholder="Nom du représentant"
                            value={author.representant}
                            onChange={(e) => updateAuthor(author.id, { representant: e.target.value })}
                          />
                        </div>
                      )}

                      {/* Nom / Nom de la collectivité */}
                      <div className="space-y-2">
                        <Label>
                          {isPersonneMorale ? "Nom de la collectivité" : "Nom"}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder={isPersonneMorale ? "Nom de la collectivité" : "Nom de famille"}
                          value={isPersonneMorale ? author.authorName : author.authorLastName}
                          onChange={(e) => {
                            if (isPersonneMorale) {
                              updateAuthor(author.id, { authorName: e.target.value });
                            } else {
                              updateAuthor(author.id, { 
                                authorLastName: e.target.value,
                                authorName: `${e.target.value} ${author.authorFirstName}`.trim()
                              });
                            }
                          }}
                        />
                      </div>

                      {/* Prénom - only for Personne Physique or when type is not set */}
                      {!isPersonneMorale && (
                        <div className="space-y-2">
                          <Label>Prénom <span className="text-destructive">*</span></Label>
                          <Input
                            placeholder="Prénom de l'auteur"
                            value={author.authorFirstName}
                            onChange={(e) => updateAuthor(author.id, { 
                              authorFirstName: e.target.value,
                              authorName: `${author.authorLastName} ${e.target.value}`.trim()
                            })}
                          />
                        </div>
                      )}

                      {/* Genre - only for Personne Physique */}
                      {isPersonnePhysique && (
                        <div className="space-y-2">
                          <Label>Genre</Label>
                          <SimpleEntitySelect
                            placeholder="Sélectionner le genre"
                            value={author.gender}
                            onChange={(value) => updateAuthor(author.id, { gender: value })}
                            options={[
                              { value: "homme", label: "Homme" },
                              { value: "femme", label: "Femme" },
                            ]}
                          />
                        </div>
                      )}

                      {/* Pseudonyme / Sigle */}
                      <div className="space-y-2">
                        <Label>{isPersonneMorale ? "Sigle" : "Pseudonyme"}</Label>
                        <Input
                          placeholder={isPersonneMorale ? "Sigle de la collectivité" : "Pseudonyme de l'auteur"}
                          value={author.pseudonym}
                          onChange={(e) => updateAuthor(author.id, { pseudonym: e.target.value })}
                        />
                      </div>

                      {/* Nationalité - for Personne Physique (multi-select) */}
                      {!isPersonneMorale && (
                        <div className="space-y-2">
                          <Label>Nationalité(s)</Label>
                          <NationalityMultiSelect
                            value={author.nationalities}
                            onChange={(value) => updateAuthor(author.id, { nationalities: value })}
                            placeholder="Sélectionner nationalité(s)"
                            gender={author.gender as 'homme' | 'femme' | ''}
                            otherValue={author.otherNationality}
                            onOtherValueChange={(value) => updateAuthor(author.id, { otherNationality: value })}
                          />
                        </div>
                      )}

                      {/* Téléphone Fixe */}
                      <div className="space-y-2">
                        <Label>Téléphone Fixe</Label>
                        <PhoneInput
                          value={author.phoneFixed}
                          onChange={(value) => updateAuthor(author.id, { phoneFixed: value })}
                          defaultCountry="MA"
                          placeholder="5 XX XX XX XX"
                        />
                      </div>

                      {/* Téléphone Mobile */}
                      <div className="space-y-2">
                        <Label>Téléphone Mobile <span className="text-destructive">*</span></Label>
                        <PhoneInput
                          value={author.phoneMobile}
                          onChange={(value) => updateAuthor(author.id, { phoneMobile: value })}
                          defaultCountry="MA"
                          placeholder="6 XX XX XX XX"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label>Email <span className="text-destructive">*</span></Label>
                        <Input
                          type="email"
                          placeholder="Adresse email"
                          value={author.email}
                          onChange={(e) => updateAuthor(author.id, { email: e.target.value })}
                        />
                      </div>

                      {/* Région */}
                      <div className="space-y-2">
                        <Label>Région</Label>
                        <InlineSelect
                          placeholder="Sélectionner une région"
                          value={author.region}
                          onChange={(value) => updateAuthor(author.id, { region: value, city: "" })}
                          options={moroccanRegions.map((region) => ({
                            value: region.name,
                            label: region.name,
                          }))}
                        />
                      </div>

                      {/* Ville */}
                      {author.region && (
                        <div className="space-y-2">
                          <Label>Ville</Label>
                          <InlineSelect
                            placeholder="Sélectionner une ville"
                            value={author.city}
                            onChange={(value) => updateAuthor(author.id, { city: value })}
                            options={getCitiesByRegion(author.region).map((city) => ({
                              value: city,
                              label: city,
                            }))}
                          />
                        </div>
                      )}

                      {/* Custom fields from database */}
                      {customFields
                        .filter(
                          (field) =>
                            field.section_key === "identification_auteur" &&
                            !field.field_key.toLowerCase().includes("region") &&
                            !field.field_key.toLowerCase().includes("ville") &&
                            !field.field_key.toLowerCase().includes("city") &&
                            !field.field_key.toLowerCase().includes("type") &&
                            !field.field_key.toLowerCase().includes("name") &&
                            !field.field_key.toLowerCase().includes("nom") &&
                            !field.field_key.toLowerCase().includes("phone") &&
                            !field.field_key.toLowerCase().includes("email") &&
                            !field.field_key.toLowerCase().includes("pseudonym") &&
                            !field.field_key.toLowerCase().includes("nationalit") &&
                            !field.field_key.toLowerCase().includes("nationality") &&
                            !field.field_key.toLowerCase().includes("genre") &&
                            !field.field_key.toLowerCase().includes("gender")
                        )
                        .map((field) => (
                          <DynamicFieldRenderer
                            key={`${author.id}-${field.id}`}
                            field={field}
                            language={language}
                            value={author.customFields[field.field_key]}
                            onChange={(value) =>
                              updateAuthor(author.id, {
                                customFields: {
                                  ...author.customFields,
                                  [field.field_key]: value,
                                },
                              })
                            }
                            gender={author.gender as "homme" | "femme" | ""}
                          />
                        ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

    </div>
  );
}

// Helper to initialize authors array with one empty author
export const initializeAuthors = (): Author[] => [createEmptyAuthor()];
