import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Footprints, Save, Plus, Trash2, Loader2, Facebook, Twitter, Instagram, Youtube, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/ui/icon";

interface FooterLink {
  title_fr: string;
  title_ar: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  id: string;
  title_fr: string;
  title_ar: string;
  links: FooterLink[];
}

interface SocialLink {
  platform: string;
  url: string;
  is_active: boolean;
}

interface ContactInfo {
  address_fr: string;
  address_ar: string;
  phone: string;
  email: string;
  hours_fr: string;
  hours_ar: string;
}

interface FooterSettings {
  description_fr: string;
  description_ar: string;
  sections: FooterSection[];
  social_links: SocialLink[];
  contact: ContactInfo;
  legal_links: FooterLink[];
  copyright_fr: string;
  copyright_ar: string;
}

const defaultSettings: FooterSettings = {
  description_fr: "Bibliothèque Numérique du Maroc - Ibn Battuta. Plateforme digitale donnant accès au patrimoine écrit marocain : manuscrits, périodiques et documents rares.",
  description_ar: "المكتبة الرقمية للمغرب - ابن بطوطة. منصة رقمية تتيح الوصول إلى التراث المكتوب المغربي من مخطوطات ودوريات ووثائق نادرة.",
  sections: [
    {
      id: "quick-links",
      title_fr: "Liens rapides",
      title_ar: "روابط سريعة",
      links: [
        { title_fr: "Portail BNRM", title_ar: "بوابة المكتبة الوطنية", href: "/" },
        { title_fr: "Plateforme Manuscrits", title_ar: "منصة المخطوطات", href: "/manuscripts" },
        { title_fr: "Plateforme Kitab", title_ar: "منصة كتاب", href: "/kitab" },
        { title_fr: "Plateforme Activités culturelles", title_ar: "منصة الأنشطة الثقافية", href: "/activites-culturelles" },
        { title_fr: "Plateforme CBM", title_ar: "منصة الفهرس البيبليوغرافي", href: "/portail-cbm" }
      ]
    },
    {
      id: "world-reservoirs",
      title_fr: "Réservoirs mondiaux",
      title_ar: "الخزانات العالمية",
      links: [
        { title_fr: "Réseau Francophone Numérique", title_ar: "الشبكة الفرنكوفونية الرقمية", href: "https://rfnum.org", external: true },
        { title_fr: "Patrimoine culturel numérique européen", title_ar: "التراث الثقافي الرقمي الأوروبي", href: "https://www.europeana.eu", external: true },
        { title_fr: "World Digital Library", title_ar: "المكتبة الرقمية العالمية", href: "https://www.loc.gov/collections/world-digital-library", external: true }
      ]
    },
    {
      id: "support",
      title_fr: "Aide et support",
      title_ar: "المساعدة والدعم",
      links: [
        { title_fr: "Aide et FAQ", title_ar: "المساعدة والأسئلة الشائعة", href: "/digital-library/help" },
        { title_fr: "Guide d'utilisation", title_ar: "دليل الاستخدام", href: "/digital-library/help#guide" }
      ]
    }
  ],
  social_links: [
    { platform: "facebook", url: "", is_active: true },
    { platform: "twitter", url: "", is_active: true },
    { platform: "youtube", url: "", is_active: true },
    { platform: "instagram", url: "", is_active: true }
  ],
  contact: {
    address_fr: "Avenue Ibn Battouta, Rabat, Maroc",
    address_ar: "شارع ابن بطوطة، الرباط، المغرب",
    phone: "+212 537 27 16 33",
    email: "bn@bnrm.ma",
    hours_fr: "Lun - Ven: 9h00 - 18h00 | Sam: 9h00 - 13h00",
    hours_ar: "الإثنين - الجمعة: 9:00 - 18:00 | السبت: 9:00 - 13:00"
  },
  legal_links: [
    { title_fr: "Conditions d'utilisation", title_ar: "شروط الاستخدام", href: "#conditions" },
    { title_fr: "Mentions légales", title_ar: "الإشعارات القانونية", href: "#mentions" },
    { title_fr: "Politique de confidentialité", title_ar: "سياسة الخصوصية", href: "#confidentialite" },
    { title_fr: "Accessibilité", title_ar: "إمكانية الوصول", href: "#accessibilite" }
  ],
  copyright_fr: "Bibliothèque Numérique du Maroc - Ibn Battuta",
  copyright_ar: "المكتبة الرقمية للمغرب - ابن بطوطة"
};

const socialIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  instagram: <Instagram className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
};

export default function CmsFooterManagerBN() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FooterSettings>(defaultSettings);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['bn-footer-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_portal_settings')
        .select('*')
        .eq('setting_key', 'bn_footer')
        .maybeSingle();
      
      if (error) throw error;
      return data?.setting_value as unknown as FooterSettings | null;
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: existing } = await supabase
        .from('cms_portal_settings')
        .select('id')
        .eq('setting_key', 'bn_footer')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('cms_portal_settings')
          .update({ 
            setting_value: formData as any,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'bn_footer');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cms_portal_settings')
          .insert({ 
            setting_key: 'bn_footer',
            setting_value: formData as any
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bn-footer-settings'] });
      toast({ title: "Footer BN sauvegardé avec succès" });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const updateSection = (sectionId: string, field: keyof FooterSection, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    }));
  };

  const addLinkToSection = (sectionId: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, links: [...s.links, { title_fr: "", title_ar: "", href: "", external: false }] }
          : s
      )
    }));
  };

  const removeLinkFromSection = (sectionId: string, linkIndex: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? { ...s, links: s.links.filter((_, i) => i !== linkIndex) }
          : s
      )
    }));
  };

  const updateLink = (sectionId: string, linkIndex: number, field: keyof FooterLink, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId 
          ? {
              ...s,
              links: s.links.map((link, i) => 
                i === linkIndex ? { ...link, [field]: value } : link
              )
            }
          : s
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

  const updateLegalLink = (index: number, field: keyof FooterLink, value: any) => {
    setFormData(prev => ({
      ...prev,
      legal_links: prev.legal_links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const addLegalLink = () => {
    setFormData(prev => ({
      ...prev,
      legal_links: [...prev.legal_links, { title_fr: "", title_ar: "", href: "" }]
    }));
  };

  const removeLegalLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      legal_links: prev.legal_links.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-bn-blue-primary" />
      </div>
    );
  }

  return (
    <Card className="border-gold-bn-primary/20">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-bn-blue-primary/5 to-gold-bn-primary/5">
        <div>
          <CardTitle className="flex items-center gap-2 text-bn-blue-primary">
            <Footprints className="h-5 w-5" />
            Configuration du Footer BN
          </CardTitle>
          <CardDescription>
            Personnalisez le pied de page de la Bibliothèque Numérique (bilingue FR/AR)
          </CardDescription>
        </div>
        <Button 
          onClick={() => saveMutation.mutate()} 
          disabled={saveMutation.isPending}
          className="bg-gold-bn-primary hover:bg-gold-bn-primary-dark text-white"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Sauvegarder
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Réseaux sociaux</TabsTrigger>
            <TabsTrigger value="legal">Mentions légales</TabsTrigger>
          </TabsList>

          {/* Description */}
          <TabsContent value="description" className="space-y-4 mt-4">
            <h3 className="text-lg font-medium text-bn-blue-primary">Description de la plateforme</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Description (FR)</Label>
                <Textarea
                  value={formData.description_fr}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_fr: e.target.value }))}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (AR)</Label>
                <Textarea
                  dir="rtl"
                  value={formData.description_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                  rows={4}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Copyright (FR)</Label>
                <Input
                  value={formData.copyright_fr}
                  onChange={(e) => setFormData(prev => ({ ...prev, copyright_fr: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Copyright (AR)</Label>
                <Input
                  dir="rtl"
                  value={formData.copyright_ar}
                  onChange={(e) => setFormData(prev => ({ ...prev, copyright_ar: e.target.value }))}
                />
              </div>
            </div>
          </TabsContent>

          {/* Sections */}
          <TabsContent value="sections" className="space-y-4 mt-4">
            <h3 className="text-lg font-medium text-bn-blue-primary">Sections du footer</h3>
            
            {formData.sections.map((section) => (
              <Card key={section.id} className="border-dashed border-gold-bn-primary/30">
                <CardHeader className="py-3 bg-gold-bn-primary/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Titre section (FR)</Label>
                      <Input
                        value={section.title_fr}
                        onChange={(e) => updateSection(section.id, 'title_fr', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Titre section (AR)</Label>
                      <Input
                        dir="rtl"
                        value={section.title_ar}
                        onChange={(e) => updateSection(section.id, 'title_ar', e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Liens</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addLinkToSection(section.id)}
                      className="border-gold-bn-primary/30 text-gold-bn-primary hover:bg-gold-bn-primary/10"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  
                  {section.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="grid grid-cols-12 gap-2 p-2 bg-muted/50 rounded items-center">
                      <Input
                        className="col-span-3"
                        placeholder="Titre FR"
                        value={link.title_fr}
                        onChange={(e) => updateLink(section.id, linkIndex, 'title_fr', e.target.value)}
                      />
                      <Input
                        className="col-span-3"
                        dir="rtl"
                        placeholder="Titre AR"
                        value={link.title_ar}
                        onChange={(e) => updateLink(section.id, linkIndex, 'title_ar', e.target.value)}
                      />
                      <Input
                        className="col-span-4"
                        placeholder="URL"
                        value={link.href}
                        onChange={(e) => updateLink(section.id, linkIndex, 'href', e.target.value)}
                      />
                      <div className="col-span-1 flex items-center justify-center gap-1">
                        <Switch
                          checked={link.external || false}
                          onCheckedChange={(checked) => updateLink(section.id, linkIndex, 'external', checked)}
                        />
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <Button
                        className="col-span-1"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLinkFromSection(section.id, linkIndex)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Contact */}
          <TabsContent value="contact" className="space-y-4 mt-4">
            <h3 className="text-lg font-medium text-bn-blue-primary">Informations de contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adresse (FR)</Label>
                <Input
                  value={formData.contact.address_fr}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, address_fr: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Adresse (AR)</Label>
                <Input
                  dir="rtl"
                  value={formData.contact.address_ar}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, address_ar: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input
                  value={formData.contact.phone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={formData.contact.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Horaires (FR)</Label>
                <Input
                  value={formData.contact.hours_fr}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, hours_fr: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Horaires (AR)</Label>
                <Input
                  dir="rtl"
                  value={formData.contact.hours_ar}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, hours_ar: e.target.value }
                  }))}
                />
              </div>
            </div>
          </TabsContent>

          {/* Social */}
          <TabsContent value="social" className="space-y-4 mt-4">
            <h3 className="text-lg font-medium text-bn-blue-primary">Réseaux sociaux</h3>
            <div className="space-y-3">
              {formData.social_links.map((social) => (
                <div key={social.platform} className="flex items-center gap-4 p-3 border rounded-lg border-gold-bn-primary/20">
                  <div className="flex items-center gap-2 w-32">
                    {socialIcons[social.platform]}
                    <span className="capitalize font-medium">{social.platform}</span>
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

          {/* Legal */}
          <TabsContent value="legal" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-bn-blue-primary">Liens légaux</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={addLegalLink}
                className="border-gold-bn-primary/30 text-gold-bn-primary hover:bg-gold-bn-primary/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un lien
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.legal_links.map((link, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-2 bg-muted/50 rounded items-center">
                  <Input
                    className="col-span-4"
                    placeholder="Titre FR"
                    value={link.title_fr}
                    onChange={(e) => updateLegalLink(index, 'title_fr', e.target.value)}
                  />
                  <Input
                    className="col-span-4"
                    dir="rtl"
                    placeholder="Titre AR"
                    value={link.title_ar}
                    onChange={(e) => updateLegalLink(index, 'title_ar', e.target.value)}
                  />
                  <Input
                    className="col-span-3"
                    placeholder="URL"
                    value={link.href}
                    onChange={(e) => updateLegalLink(index, 'href', e.target.value)}
                  />
                  <Button
                    className="col-span-1"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLegalLink(index)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
