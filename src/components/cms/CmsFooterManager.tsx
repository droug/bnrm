import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Footprints, Save, Plus, Trash2, Loader2, Link as LinkIcon, Facebook, Twitter, Instagram, Linkedin, Youtube, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Json } from "@/integrations/supabase/types";

interface FooterColumn {
  title_fr: string;
  title_ar: string;
  links: {
    label_fr: string;
    label_ar: string;
    url: string;
    is_external: boolean;
  }[];
}

interface SocialLink {
  platform: string;
  url: string;
  is_active: boolean;
}

interface FooterLogo {
  image_url: string;
  alt_fr: string;
  alt_ar: string;
  url?: string;
}

interface FooterData {
  id: string;
  is_active: boolean;
  legal_text_fr: string | null;
  legal_text_ar: string | null;
  columns: FooterColumn[] | null;
  social_links: SocialLink[] | null;
  logos: FooterLogo[] | null;
}

const defaultSocialLinks: SocialLink[] = [
  { platform: "facebook", url: "", is_active: true },
  { platform: "twitter", url: "", is_active: true },
  { platform: "instagram", url: "", is_active: true },
  { platform: "linkedin", url: "", is_active: true },
  { platform: "youtube", url: "", is_active: true },
];

const socialIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
};

export default function CmsFooterManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<{
    is_active: boolean;
    legal_text_fr: string;
    legal_text_ar: string;
    columns: FooterColumn[];
    social_links: SocialLink[];
    logos: FooterLogo[];
  }>({
    is_active: true,
    legal_text_fr: "",
    legal_text_ar: "",
    columns: [],
    social_links: defaultSocialLinks,
    logos: [],
  });

  const { data: footerData, isLoading } = useQuery({
    queryKey: ['cms-footer'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_footer')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        const columns = Array.isArray(data.columns) ? (data.columns as unknown as FooterColumn[]) : [];
        const socialLinks = Array.isArray(data.social_links) ? (data.social_links as unknown as SocialLink[]) : defaultSocialLinks;
        const logos = Array.isArray(data.logos) ? (data.logos as unknown as FooterLogo[]) : [];
        
        setFormData({
          is_active: data.is_active ?? true,
          legal_text_fr: data.legal_text_fr || "",
          legal_text_ar: data.legal_text_ar || "",
          columns,
          social_links: socialLinks,
          logos,
        });
      }
      
      return data as unknown as FooterData | null;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        is_active: formData.is_active,
        legal_text_fr: formData.legal_text_fr || null,
        legal_text_ar: formData.legal_text_ar || null,
        columns: formData.columns as unknown as Json,
        social_links: formData.social_links as unknown as Json,
        logos: formData.logos as unknown as Json,
        updated_at: new Date().toISOString(),
      };

      if (footerData?.id) {
        const { error } = await supabase
          .from('cms_footer')
          .update(payload)
          .eq('id', footerData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cms_footer')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-footer'] });
      toast({ title: "Footer sauvegardé avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const addColumn = () => {
    setFormData(prev => ({
      ...prev,
      columns: [...prev.columns, { title_fr: "", title_ar: "", links: [] }]
    }));
  };

  const removeColumn = (index: number) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index)
    }));
  };

  const updateColumn = (index: number, field: keyof FooterColumn, value: any) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === index ? { ...col, [field]: value } : col
      )
    }));
  };

  const addLinkToColumn = (columnIndex: number) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === columnIndex 
          ? { ...col, links: [...col.links, { label_fr: "", label_ar: "", url: "", is_external: false }] }
          : col
      )
    }));
  };

  const removeLinkFromColumn = (columnIndex: number, linkIndex: number) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === columnIndex 
          ? { ...col, links: col.links.filter((_, li) => li !== linkIndex) }
          : col
      )
    }));
  };

  const updateLink = (columnIndex: number, linkIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map((col, i) => 
        i === columnIndex 
          ? {
              ...col,
              links: col.links.map((link, li) => 
                li === linkIndex ? { ...link, [field]: value } : link
              )
            }
          : col
      )
    }));
  };

  const updateSocialLink = (platform: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      social_links: prev.social_links.map(link =>
        link.platform === platform ? { ...link, [field]: value } : link
      )
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Footprints className="h-5 w-5" />
              Configuration du Footer
            </CardTitle>
            <CardDescription>
              Personnalisez le pied de page du site (bilingue FR/AR)
            </CardDescription>
          </div>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>
        
        {/* Aperçu du logo actuel */}
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex-shrink-0">
            <img 
              src="/bnrm-portal-logo.gif" 
              alt="Logo actuel du portail BNRM" 
              className="h-16 object-contain"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Logo actuel du portail</p>
            <p className="text-xs text-muted-foreground">
              Ce logo est affiché dans le footer du portail BNRM. Pour le modifier, 
              remplacez le fichier <code className="bg-muted px-1 rounded">/bnrm-portal-logo.gif</code>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="footer-active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="footer-active">Footer personnalisé actif</Label>
        </div>

        <Tabs defaultValue="columns" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="columns">Colonnes</TabsTrigger>
            <TabsTrigger value="social">Réseaux sociaux</TabsTrigger>
            <TabsTrigger value="legal">Mentions légales</TabsTrigger>
            <TabsTrigger value="logos">Logos</TabsTrigger>
          </TabsList>

          <TabsContent value="columns" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Colonnes du footer</h3>
              <Button onClick={addColumn} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une colonne
              </Button>
            </div>

            {formData.columns.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune colonne configurée. Cliquez sur "Ajouter une colonne" pour commencer.
              </p>
            ) : (
              <div className="space-y-6">
                {formData.columns.map((column, columnIndex) => (
                  <Card key={columnIndex} className="border-dashed">
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Colonne {columnIndex + 1}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeColumn(columnIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Titre (FR)</Label>
                          <Input
                            value={column.title_fr}
                            onChange={(e) => updateColumn(columnIndex, 'title_fr', e.target.value)}
                            placeholder="Ex: Liens utiles"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Titre (AR)</Label>
                          <Input
                            dir="rtl"
                            value={column.title_ar}
                            onChange={(e) => updateColumn(columnIndex, 'title_ar', e.target.value)}
                            placeholder="روابط مفيدة"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Liens</Label>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => addLinkToColumn(columnIndex)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                        
                        {column.links.map((link, linkIndex) => (
                          <div key={linkIndex} className="grid grid-cols-12 gap-2 p-2 bg-muted/50 rounded">
                            <Input
                              className="col-span-3"
                              placeholder="Label FR"
                              value={link.label_fr}
                              onChange={(e) => updateLink(columnIndex, linkIndex, 'label_fr', e.target.value)}
                            />
                            <Input
                              className="col-span-3"
                              dir="rtl"
                              placeholder="Label AR"
                              value={link.label_ar}
                              onChange={(e) => updateLink(columnIndex, linkIndex, 'label_ar', e.target.value)}
                            />
                            <Input
                              className="col-span-4"
                              placeholder="URL"
                              value={link.url}
                              onChange={(e) => updateLink(columnIndex, linkIndex, 'url', e.target.value)}
                            />
                            <div className="col-span-1 flex items-center justify-center">
                              <Switch
                                checked={link.is_external}
                                onCheckedChange={(checked) => updateLink(columnIndex, linkIndex, 'is_external', checked)}
                                title="Lien externe"
                              />
                            </div>
                            <Button
                              className="col-span-1"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLinkFromColumn(columnIndex, linkIndex)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="social" className="space-y-4 mt-4">
            <h3 className="text-lg font-medium">Réseaux sociaux</h3>
            <div className="space-y-3">
              {formData.social_links.map((social) => (
                <div key={social.platform} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center gap-2 w-32">
                    {socialIcons[social.platform]}
                    <span className="capitalize">{social.platform}</span>
                  </div>
                  <Input
                    className="flex-1"
                    placeholder={`URL ${social.platform}`}
                    value={social.url}
                    onChange={(e) => updateSocialLink(social.platform, 'url', e.target.value)}
                  />
                  <Switch
                    checked={social.is_active}
                    onCheckedChange={(checked) => updateSocialLink(social.platform, 'is_active', checked)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4 mt-4">
            <h3 className="text-lg font-medium">Mentions légales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Texte légal (FR)</Label>
                <Textarea
                  value={formData.legal_text_fr}
                  onChange={(e) => setFormData(prev => ({ ...prev, legal_text_fr: e.target.value }))}
                  placeholder="© 2024 BNRM. Tous droits réservés."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Texte légal (AR)</Label>
                <Textarea
                  dir="rtl"
                  value={formData.legal_text_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, legal_text_ar: e.target.value }))}
                  placeholder="© 2024 المكتبة الوطنية. جميع الحقوق محفوظة."
                  rows={4}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logos" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Logos partenaires</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  logos: [...prev.logos, { image_url: "", alt_fr: "", alt_ar: "", url: "" }]
                }))}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un logo
              </Button>
            </div>
            
            {formData.logos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun logo configuré.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {formData.logos.map((logo, index) => (
                  <Card key={index} className="border-dashed">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between items-start">
                        {logo.image_url && (
                          <img src={logo.image_url} alt={logo.alt_fr} className="h-12 object-contain" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            logos: prev.logos.filter((_, i) => i !== index)
                          }))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <Input
                        placeholder="URL de l'image"
                        value={logo.image_url}
                        onChange={(e) => {
                          const newLogos = [...formData.logos];
                          newLogos[index].image_url = e.target.value;
                          setFormData(prev => ({ ...prev, logos: newLogos }));
                        }}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Alt FR"
                          value={logo.alt_fr}
                          onChange={(e) => {
                            const newLogos = [...formData.logos];
                            newLogos[index].alt_fr = e.target.value;
                            setFormData(prev => ({ ...prev, logos: newLogos }));
                          }}
                        />
                        <Input
                          dir="rtl"
                          placeholder="Alt AR"
                          value={logo.alt_ar}
                          onChange={(e) => {
                            const newLogos = [...formData.logos];
                            newLogos[index].alt_ar = e.target.value;
                            setFormData(prev => ({ ...prev, logos: newLogos }));
                          }}
                        />
                      </div>
                      <Input
                        placeholder="URL du lien (optionnel)"
                        value={logo.url || ""}
                        onChange={(e) => {
                          const newLogos = [...formData.logos];
                          newLogos[index].url = e.target.value;
                          setFormData(prev => ({ ...prev, logos: newLogos }));
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
