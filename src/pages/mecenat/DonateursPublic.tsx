import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { usePublicDonors, useDonorDonations, type Donor } from "@/hooks/useMecenat";
import { useLanguage } from "@/hooks/useLanguage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Users, 
  Building2, 
  User, 
  BookOpen, 
  Calendar, 
  MapPin,
  Award,
  Heart,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";

const supportTypeLabels: Record<string, string> = {
  manuscripts: "Manuscrits",
  books: "Livres",
  periodicals: "Périodiques",
  archives: "Archives",
  photos: "Photographies",
  audiovisual: "Audiovisuel",
  other: "Autre"
};

const donorTypeLabels: Record<string, { fr: string; ar: string }> = {
  individual: { fr: "Particulier", ar: "فرد" },
  institution: { fr: "Institution", ar: "مؤسسة" },
  association: { fr: "Association", ar: "جمعية" }
};

function DonorCard({ donor, onClick }: { donor: Donor; onClick: () => void }) {
  const { language } = useLanguage();
  const displayName = donor.donor_type === 'individual' 
    ? `${donor.first_name} ${donor.last_name}`
    : donor.organization_name;
  
  const initials = donor.donor_type === 'individual'
    ? `${donor.first_name?.[0] || ''}${donor.last_name?.[0] || ''}`
    : donor.organization_name?.substring(0, 2) || 'DN';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`cursor-pointer hover:shadow-lg transition-all border-l-4 bg-white ${
          donor.is_featured 
            ? 'border-l-gold-primary bg-gradient-to-br from-gold-surface/50 to-white' 
            : 'border-l-blue-primary'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-blue-primary/20">
              <AvatarImage src={donor.photo_url || undefined} alt={displayName || ''} />
              <AvatarFallback className="bg-blue-surface text-blue-primary-dark font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg text-slate-base-dark truncate">{displayName}</h3>
                {donor.is_featured && (
                  <Badge className="bg-gold-primary hover:bg-gold-primary-dark text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Mécène d'honneur
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-text mt-1">
                {donor.donor_type === 'individual' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
                <span>{donorTypeLabels[donor.donor_type][language as 'fr' | 'ar'] || donorTypeLabels[donor.donor_type].fr}</span>
              </div>
              {donor.city && (
                <div className="flex items-center gap-1 text-sm text-slate-text mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{donor.city}</span>
                </div>
              )}
              {donor.biography && (
                <p className="text-sm text-slate-text mt-2 line-clamp-2">
                  {language === 'ar' && donor.biography_ar ? donor.biography_ar : donor.biography}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DonorDetailDialog({ donor, open, onClose }: { donor: Donor | null; open: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  const { data: donations = [] } = useDonorDonations(donor?.id);

  if (!donor) return null;

  const displayName = donor.donor_type === 'individual'
    ? `${donor.first_name} ${donor.last_name}`
    : donor.organization_name;

  const initials = donor.donor_type === 'individual'
    ? `${donor.first_name?.[0] || ''}${donor.last_name?.[0] || ''}`
    : donor.organization_name?.substring(0, 2) || 'DN';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] bg-white">
        <DialogHeader className="border-b border-slate-border pb-4">
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-blue-primary/20">
              <AvatarImage src={donor.photo_url || undefined} />
              <AvatarFallback className="bg-blue-surface text-blue-primary-dark">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <span className="text-xl text-blue-primary-dark">{displayName}</span>
              {donor.is_featured && (
                <Badge className="ml-2 bg-gold-primary text-white">Mécène d'honneur</Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="biography" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-slate-light">
            <TabsTrigger value="biography" className="data-[state=active]:bg-blue-primary data-[state=active]:text-white">
              {language === 'ar' ? 'السيرة الذاتية' : 'Biographie'}
            </TabsTrigger>
            <TabsTrigger value="donations" className="data-[state=active]:bg-blue-primary data-[state=active]:text-white">
              {language === 'ar' ? 'التبرعات' : 'Œuvres données'} ({donations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="biography" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-text">
                  {donor.donor_type === 'individual' ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                  <span>{donorTypeLabels[donor.donor_type][language as 'fr' | 'ar'] || donorTypeLabels[donor.donor_type].fr}</span>
                </div>
                
                {donor.city && (
                  <div className="flex items-center gap-2 text-slate-text">
                    <MapPin className="h-4 w-4" />
                    <span>{donor.city}, {donor.country}</span>
                  </div>
                )}

                <div className="mt-6">
                  <h4 className="font-semibold mb-2 text-blue-primary-dark">
                    {language === 'ar' ? 'نبذة' : 'À propos'}
                  </h4>
                  <p className="text-slate-text whitespace-pre-wrap">
                    {language === 'ar' && donor.biography_ar ? donor.biography_ar : donor.biography || 'Aucune biographie disponible.'}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="donations" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {donations.length === 0 ? (
                <div className="text-center py-8 text-slate-text">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune œuvre répertoriée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.map((donation) => (
                    <Card key={donation.id} className="p-4 bg-slate-surface border-slate-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium text-slate-base-dark">{donation.title}</h5>
                          {donation.description && (
                            <p className="text-sm text-slate-text mt-1 line-clamp-2">
                              {donation.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="border-blue-primary text-blue-primary-dark">
                              {supportTypeLabels[donation.support_type] || donation.support_type}
                            </Badge>
                            {donation.estimated_quantity && (
                              <span className="text-xs text-slate-text">
                                {donation.estimated_quantity} œuvres
                              </span>
                            )}
                          </div>
                        </div>
                        {donation.donation_date && (
                          <div className="flex items-center gap-1 text-xs text-slate-text">
                            <Calendar className="h-3 w-3" />
                            {new Date(donation.donation_date).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default function DonateursPublic() {
  const { language } = useLanguage();
  const { data: donors = [], isLoading } = usePublicDonors();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = !search || 
      donor.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      donor.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      donor.organization_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = !filterType || donor.donor_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const featuredDonors = filteredDonors.filter(d => d.is_featured);
  const regularDonors = filteredDonors.filter(d => !d.is_featured);

  return (
    <div className="min-h-screen bg-slate-surface">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-gold-light to-gold-surface mb-4">
            <Heart className="h-10 w-10 text-gold-primary-dark fill-gold-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-blue-primary-dark">
            {language === 'ar' ? 'متبرعونا' : 'Nos Donateurs'}
          </h1>
          <p className="text-lg text-slate-text max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'نحتفي بكرم المتبرعين الذين أثروا مجموعات المكتبة الوطنية للمملكة المغربية'
              : 'La BNRM rend hommage à la générosité de ses mécènes qui enrichissent ses collections patrimoniales'
            }
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-text" />
            <Input
              placeholder={language === 'ar' ? 'البحث عن متبرع...' : 'Rechercher un donateur...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('')}
              className={filterType === '' ? 'bg-blue-primary-dark hover:bg-blue-deep' : 'border-slate-border text-slate-text-dark hover:bg-blue-surface'}
            >
              <Filter className="h-4 w-4 mr-1" />
              {language === 'ar' ? 'الكل' : 'Tous'}
            </Button>
            <Button
              variant={filterType === 'individual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('individual')}
              className={filterType === 'individual' ? 'bg-blue-primary-dark hover:bg-blue-deep' : 'border-slate-border text-slate-text-dark hover:bg-blue-surface'}
            >
              <User className="h-4 w-4 mr-1" />
              {language === 'ar' ? 'أفراد' : 'Particuliers'}
            </Button>
            <Button
              variant={filterType === 'institution' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('institution')}
              className={filterType === 'institution' ? 'bg-blue-primary-dark hover:bg-blue-deep' : 'border-slate-border text-slate-text-dark hover:bg-blue-surface'}
            >
              <Building2 className="h-4 w-4 mr-1" />
              {language === 'ar' ? 'مؤسسات' : 'Institutions'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center bg-white border-slate-border">
            <div className="text-3xl font-bold text-blue-primary-dark">{donors.length}</div>
            <div className="text-sm text-slate-text">{language === 'ar' ? 'متبرعين' : 'Donateurs'}</div>
          </Card>
          <Card className="p-4 text-center bg-white border-slate-border">
            <div className="text-3xl font-bold text-gold-primary-dark">{featuredDonors.length}</div>
            <div className="text-sm text-slate-text">{language === 'ar' ? 'مكرمين' : 'Mécènes d\'honneur'}</div>
          </Card>
          <Card className="p-4 text-center bg-white border-slate-border">
            <div className="text-3xl font-bold text-blue-primary-dark">
              {donors.filter(d => d.donor_type === 'individual').length}
            </div>
            <div className="text-sm text-slate-text">{language === 'ar' ? 'أفراد' : 'Particuliers'}</div>
          </Card>
          <Card className="p-4 text-center bg-white border-slate-border">
            <div className="text-3xl font-bold text-blue-primary-dark">
              {donors.filter(d => d.donor_type !== 'individual').length}
            </div>
            <div className="text-sm text-slate-text">{language === 'ar' ? 'مؤسسات' : 'Institutions'}</div>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-slate-text">{language === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</p>
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-slate-text/50 mb-4" />
            <p className="text-slate-text">{language === 'ar' ? 'لم يتم العثور على متبرعين' : 'Aucun donateur trouvé'}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mécènes d'honneur */}
            {featuredDonors.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-primary-dark">
                  <Award className="h-5 w-5 text-gold-primary" />
                  {language === 'ar' ? 'المتبرعون المميزون' : 'Mécènes d\'honneur'}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {featuredDonors.map((donor) => (
                    <DonorCard 
                      key={donor.id} 
                      donor={donor}
                      onClick={() => setSelectedDonor(donor)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Autres donateurs */}
            {regularDonors.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-primary-dark">
                  <Heart className="h-5 w-5 text-blue-primary" />
                  {language === 'ar' ? 'جميع المتبرعين' : 'Tous nos donateurs'}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {regularDonors.map((donor) => (
                    <DonorCard 
                      key={donor.id} 
                      donor={donor}
                      onClick={() => setSelectedDonor(donor)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <DonorDetailDialog
        donor={selectedDonor}
        open={!!selectedDonor}
        onClose={() => setSelectedDonor(null)}
      />

      <Footer />
      <FloatingButtons />
    </div>
  );
}
