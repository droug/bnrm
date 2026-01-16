import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SimpleDropdown } from '@/components/ui/simple-dropdown';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MonographDepositFormData } from '@/schemas/legalDepositSchema';
import { NationalityAutocomplete } from '@/components/ui/nationality-autocomplete';
import { moroccanRegions, getCitiesByRegion } from '@/data/moroccanRegions';

interface AuthorIdentificationProps {
  form: UseFormReturn<MonographDepositFormData>;
  selectedRegion?: string;
  setSelectedRegion?: (value: string) => void;
  selectedCity?: string;
  setSelectedCity?: (value: string) => void;
}

export function AuthorIdentification({ 
  form, 
  selectedRegion,
  setSelectedRegion,
  selectedCity,
  setSelectedCity
}: AuthorIdentificationProps) {
  const authorType = form.watch('author.authorType');
  const authorGender = form.watch('author.gender');
  const [otherNationalityValue, setOtherNationalityValue] = useState<string>('');
  
  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Identification de l'auteur</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="author.authorType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de l'auteur *</FormLabel>
              <FormControl>
                <SimpleDropdown
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Sélectionner le type"
                  options={[
                    { value: 'physique', label: 'Personne physique' },
                    { value: 'morale', label: 'Personne morale (collectivités)' },
                  ]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="author.authorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {authorType === 'morale' ? 'Nom de la collectivité' : 'Nom et prénom de l\'auteur'} *
              </FormLabel>
              <FormControl>
                <Input placeholder={authorType === 'morale' ? 'Nom de la collectivité' : 'Nom et prénom de l\'auteur'} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="author.pseudonym"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{authorType === 'morale' ? 'Sigle' : 'Pseudonyme'}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={authorType === 'morale' ? 'Saisir le sigle de la collectivité (le cas échéant)' : 'Saisir le pseudonyme de l\'auteur (le cas échéant)'} 
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {authorType === 'morale' 
                  ? 'À renseigner si la collectivité utilise un sigle.' 
                  : 'À renseigner uniquement si l\'auteur publie sous un autre nom.'}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional fields for morale (personne morale) */}
        {authorType === 'morale' && (
          <>
            <FormField
              control={form.control}
              name="author.status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut *</FormLabel>
                  <FormControl>
                    <SimpleDropdown
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sélectionner le statut"
                      options={[
                        { value: 'etatique', label: 'Étatique' },
                        { value: 'non-etatique', label: 'Non étatique' },
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Conditional fields for physique (personne physique) */}
        {authorType === 'physique' && (
          <>
            <FormField
              control={form.control}
              name="author.gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre *</FormLabel>
                  <FormControl>
                    <SimpleDropdown
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sélectionner le genre"
                      options={[
                        { value: 'homme', label: 'Homme' },
                        { value: 'femme', label: 'Femme' },
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author.birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de naissance *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author.nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationalité *</FormLabel>
                  <FormControl>
                    <NationalityAutocomplete
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sélectionner la nationalité"
                      gender={authorGender as 'homme' | 'femme' | ''}
                      otherValue={otherNationalityValue}
                      onOtherValueChange={setOtherNationalityValue}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author.declarationNature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nature de la déclaration</FormLabel>
                  <FormControl>
                    <SimpleDropdown
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sélectionner la nature"
                      options={[
                        { value: 'depot-initial', label: 'Dépôt initial (ou premier dépôt)' },
                        { value: 'nouvelle-edition', label: 'Nouvelle édition' },
                        { value: 'reimpression', label: 'Réimpression' },
                        { value: 'traduction', label: 'Traduction' },
                        { value: 'depot-rectificatif', label: 'Dépôt rectificatif ou complémentaire' },
                        { value: 'depot-regularisation', label: 'Dépôt de régularisation' },
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="author.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone *</FormLabel>
              <FormControl>
                <Input placeholder="Numéro de téléphone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="author.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Adresse email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2">
          <FormLabel>Région</FormLabel>
          <SimpleDropdown
            value={selectedRegion}
            onChange={(value) => {
              setSelectedRegion?.(value);
              setSelectedCity?.(''); // Reset city when region changes
            }}
            placeholder="Sélectionner une région"
            options={moroccanRegions.map(region => ({
              value: region.name,
              label: region.name
            }))}
          />
        </div>

        {selectedRegion && (
          <div className="md:col-span-2">
            <FormLabel>Ville</FormLabel>
            <SimpleDropdown
              value={selectedCity}
              onChange={(value) => setSelectedCity?.(value)}
              placeholder="Sélectionner une ville"
              options={getCitiesByRegion(selectedRegion).map(city => ({
                value: city,
                label: city
              }))}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="author.address"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Textarea placeholder="Adresse complète" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
