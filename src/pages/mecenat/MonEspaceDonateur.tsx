import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { useAuth } from "@/hooks/useAuth";
import { useMyDonorProfile, useDonorDonations, useMyProposals, useMecenatMutations } from "@/hooks/useMecenat";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  BookOpen, 
  FileText, 
  User, 
  Plus, 
  Calendar, 
  Package,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Edit,
  LogIn,
  Save
} from "lucide-react";
import { motion } from "framer-motion";

const statusConfig: Record<string, { label: string; labelAr: string; icon: any; color: string }> = {
  submitted: { label: "Soumise", labelAr: "مقدمة", icon: Clock, color: "bg-blue-surface text-blue-primary-dark border-blue-primary" },
  under_review: { label: "En cours d'examen", labelAr: "قيد المراجعة", icon: Clock, color: "bg-gold-surface text-gold-primary-dark border-gold-primary" },
  accepted: { label: "Acceptée", labelAr: "مقبولة", icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-500" },
  rejected: { label: "Refusée", labelAr: "مرفوضة", icon: XCircle, color: "bg-red-100 text-red-800 border-red-500" },
  converted: { label: "Convertie en donation", labelAr: "تحولت إلى تبرع", icon: CheckCircle, color: "bg-blue-surface text-blue-primary-dark border-blue-primary" },
  pending: { label: "En attente", labelAr: "في الانتظار", icon: Clock, color: "bg-gold-surface text-gold-primary-dark border-gold-primary" },
  cataloged: { label: "Cataloguée", labelAr: "مفهرسة", icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-500" },
  archived: { label: "Archivée", labelAr: "مؤرشفة", icon: Package, color: "bg-slate-light text-slate-text-dark border-slate-border" }
};

const supportTypeLabels: Record<string, { fr: string; ar: string }> = {
  manuscripts: { fr: "Manuscrits", ar: "مخطوطات" },
  books: { fr: "Livres", ar: "كتب" },
  periodicals: { fr: "Périodiques", ar: "دوريات" },
  archives: { fr: "Archives", ar: "أرشيف" },
  photos: { fr: "Photographies", ar: "صور" },
  audiovisual: { fr: "Audiovisuel", ar: "سمعي بصري" },
  other: { fr: "Autre", ar: "أخرى" }
};

export default function MonEspaceDonateur() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const { data: donorProfile, isLoading: profileLoading } = useMyDonorProfile();
  const { data: donations = [] } = useDonorDonations(donorProfile?.id);
  const { data: proposals = [] } = useMyProposals();
  const { updateDonor } = useMecenatMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    biography: donorProfile?.biography || '',
    phone: donorProfile?.phone || '',
    address: donorProfile?.address || ''
  });

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-surface flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-surface">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center bg-white border-slate-border">
            <CardContent className="p-8">
              <div className="inline-flex p-4 rounded-full bg-blue-surface mb-4">
                <LogIn className="h-12 w-12 text-blue-primary-dark" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-blue-primary-dark">
                {language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Connexion requise'}
              </h2>
              <p className="text-slate-text mb-6">
                {language === 'ar' 
                  ? 'يرجى تسجيل الدخول للوصول إلى مساحة المتبرع الخاصة بك'
                  : 'Veuillez vous connecter pour accéder à votre espace donateur'}
              </p>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-blue-primary-dark hover:bg-blue-deep"
              >
                {language === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (donorProfile) {
      await updateDonor.mutateAsync({
        id: donorProfile.id,
        ...editForm
      });
      setIsEditing(false);
    }
  };

  const displayName = donorProfile?.donor_type === 'individual'
    ? `${donorProfile?.first_name} ${donorProfile?.last_name}`
    : donorProfile?.organization_name || user.email;

  const initials = donorProfile?.donor_type === 'individual'
    ? `${donorProfile?.first_name?.[0] || ''}${donorProfile?.last_name?.[0] || ''}`
    : donorProfile?.organization_name?.substring(0, 2) || user.email?.substring(0, 2)?.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-surface">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-slate-text-dark hover:text-blue-primary-dark hover:bg-blue-surface"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'رجوع' : 'Retour'}
        </Button>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8"
        >
          <Avatar className="h-20 w-20 border-2 border-blue-primary/20">
            <AvatarImage src={donorProfile?.photo_url || undefined} />
            <AvatarFallback className="bg-blue-surface text-blue-primary-dark text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-blue-primary-dark">{displayName}</h1>
            <p className="text-slate-text">
              {donorProfile 
                ? `${language === 'ar' ? 'متبرع منذ' : 'Donateur depuis'} ${new Date(donorProfile.created_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', { month: 'long', year: 'numeric' })}`
                : (language === 'ar' ? 'متبرع مستقبلي' : 'Futur donateur')
              }
            </p>
          </div>
          <Button 
            onClick={() => navigate('/offrir-collections')}
            className="bg-blue-primary-dark hover:bg-blue-deep"
          >
            <Plus className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'اقتراح تبرع' : 'Proposer un don'}
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-white border-slate-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-surface">
                <Heart className="h-5 w-5 text-blue-primary-dark" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-primary-dark">{donations.length}</div>
                <div className="text-sm text-slate-text">{language === 'ar' ? 'تبرعات' : 'Donations'}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white border-slate-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold-surface">
                <FileText className="h-5 w-5 text-gold-primary-dark" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gold-primary-dark">{proposals.length}</div>
                <div className="text-sm text-slate-text">{language === 'ar' ? 'مقترحات' : 'Propositions'}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white border-slate-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {donations.reduce((sum, d) => sum + (d.estimated_quantity || 0), 0)}
                </div>
                <div className="text-sm text-slate-text">{language === 'ar' ? 'أعمال متبرع بها' : 'Œuvres données'}</div>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-white border-slate-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-surface">
                <CheckCircle className="h-5 w-5 text-blue-primary-dark" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-primary-dark">
                  {donations.filter(d => d.status === 'cataloged').length}
                </div>
                <div className="text-sm text-slate-text">{language === 'ar' ? 'مفهرسة' : 'Cataloguées'}</div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="donations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-light">
            <TabsTrigger value="donations" className="flex items-center gap-2 data-[state=active]:bg-blue-primary data-[state=active]:text-white">
              <Heart className="h-4 w-4" />
              {language === 'ar' ? 'تبرعاتي' : 'Mes Donations'}
            </TabsTrigger>
            <TabsTrigger value="proposals" className="flex items-center gap-2 data-[state=active]:bg-blue-primary data-[state=active]:text-white">
              <FileText className="h-4 w-4" />
              {language === 'ar' ? 'مقترحاتي' : 'Mes Propositions'}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-blue-primary data-[state=active]:text-white">
              <User className="h-4 w-4" />
              {language === 'ar' ? 'ملفي' : 'Mon Profil'}
            </TabsTrigger>
          </TabsList>

          {/* Donations */}
          <TabsContent value="donations">
            <Card className="bg-white border-slate-border">
              <CardHeader className="border-b border-slate-border">
                <CardTitle className="text-blue-primary-dark">
                  {language === 'ar' ? 'سجل تبرعاتي' : 'Historique de mes donations'}
                </CardTitle>
                <CardDescription className="text-slate-text">
                  {language === 'ar' 
                    ? 'اطلع على جميع مساهماتك في المكتبة الوطنية'
                    : 'Retrouvez l\'ensemble de vos contributions à la BNRM'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {donations.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto text-slate-text/50 mb-4" />
                    <p className="text-slate-text mb-4">
                      {language === 'ar' 
                        ? 'ليس لديك أي تبرعات مسجلة بعد'
                        : 'Vous n\'avez pas encore de donations enregistrées'}
                    </p>
                    <Button 
                      onClick={() => navigate('/offrir-collections')}
                      className="bg-blue-primary-dark hover:bg-blue-deep"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {language === 'ar' ? 'اقتراح تبرع' : 'Proposer un don'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donations.map((donation) => {
                      const status = statusConfig[donation.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      const supportType = supportTypeLabels[donation.support_type] || { fr: donation.support_type, ar: donation.support_type };
                      return (
                        <motion.div
                          key={donation.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Card className="p-4 bg-slate-surface border-slate-border hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-slate-base-dark">{donation.title}</h4>
                                  <Badge variant="outline" className={`border ${status.color}`}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {language === 'ar' ? status.labelAr : status.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-text line-clamp-2 mb-2">
                                  {donation.description}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs text-slate-text">
                                  <span className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {language === 'ar' ? supportType.ar : supportType.fr}
                                  </span>
                                  {donation.estimated_quantity && (
                                    <span>• {donation.estimated_quantity} {language === 'ar' ? 'عمل' : 'œuvres'}</span>
                                  )}
                                  {donation.donation_date && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(donation.donation_date).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge variant="secondary" className="ml-4 bg-blue-surface text-blue-primary-dark">
                                {donation.donation_number}
                              </Badge>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Propositions */}
          <TabsContent value="proposals">
            <Card className="bg-white border-slate-border">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-border">
                <div>
                  <CardTitle className="text-blue-primary-dark">
                    {language === 'ar' ? 'مقترحات التبرع' : 'Mes propositions de dons'}
                  </CardTitle>
                  <CardDescription className="text-slate-text">
                    {language === 'ar' ? 'تابع تقدم مقترحاتك' : 'Suivez l\'avancement de vos propositions'}
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => navigate('/offrir-collections')}
                  className="bg-blue-primary-dark hover:bg-blue-deep"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {language === 'ar' ? 'اقتراح جديد' : 'Nouvelle proposition'}
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {proposals.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-slate-text/50 mb-4" />
                    <p className="text-slate-text mb-4">
                      {language === 'ar' ? 'لا توجد مقترحات قيد التنفيذ' : 'Aucune proposition en cours'}
                    </p>
                    <Button 
                      onClick={() => navigate('/offrir-collections')}
                      className="bg-blue-primary-dark hover:bg-blue-deep"
                    >
                      {language === 'ar' ? 'تقديم مقترح' : 'Soumettre une proposition'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => {
                      const status = statusConfig[proposal.status] || statusConfig.submitted;
                      const StatusIcon = status.icon;
                      const supportType = supportTypeLabels[proposal.support_type] || { fr: proposal.support_type, ar: proposal.support_type };
                      return (
                        <motion.div
                          key={proposal.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <Card className="p-4 bg-slate-surface border-slate-border hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="bg-blue-surface text-blue-primary-dark">
                                    {proposal.proposal_number}
                                  </Badge>
                                  <Badge variant="outline" className={`border ${status.color}`}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {language === 'ar' ? status.labelAr : status.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-text line-clamp-2 mb-2">
                                  {proposal.collection_description}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs text-slate-text">
                                  <span className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {language === 'ar' ? supportType.ar : supportType.fr}
                                  </span>
                                  {proposal.estimated_books_count && (
                                    <span>• ~{proposal.estimated_books_count} {language === 'ar' ? 'كتاب' : 'ouvrages'}</span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(proposal.created_at).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR')}
                                  </span>
                                </div>
                                {proposal.review_notes && (
                                  <div className="mt-2 p-2 bg-gold-surface rounded text-sm border-l-2 border-gold-primary">
                                    <strong className="text-gold-primary-dark">
                                      {language === 'ar' ? 'ملاحظة الفريق:' : 'Note de l\'équipe :'}
                                    </strong>{' '}
                                    <span className="text-slate-text-dark">{proposal.review_notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <Card className="bg-white border-slate-border">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-border">
                <div>
                  <CardTitle className="text-blue-primary-dark">
                    {language === 'ar' ? 'ملفي كمتبرع' : 'Mon profil donateur'}
                  </CardTitle>
                  <CardDescription className="text-slate-text">
                    {language === 'ar' ? 'إدارة معلوماتك الشخصية' : 'Gérez vos informations personnelles'}
                  </CardDescription>
                </div>
                {donorProfile && !isEditing && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    className="border-blue-primary text-blue-primary-dark hover:bg-blue-surface"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {language === 'ar' ? 'تعديل' : 'Modifier'}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {!donorProfile ? (
                  <div className="text-center py-12">
                    <User className="h-16 w-16 mx-auto text-slate-text/50 mb-4" />
                    <p className="text-slate-text mb-4">
                      {language === 'ar' 
                        ? 'ليس لديك ملف متبرع بعد. سيتم إنشاؤه تلقائيًا عند قبول أول مقترح تبرع.'
                        : 'Vous n\'avez pas encore de profil donateur. Celui-ci sera créé automatiquement lorsque votre première proposition de don sera acceptée.'}
                    </p>
                    <Button 
                      onClick={() => navigate('/offrir-collections')}
                      className="bg-blue-primary-dark hover:bg-blue-deep"
                    >
                      {language === 'ar' ? 'اقتراح تبرع' : 'Proposer un don'}
                    </Button>
                  </div>
                ) : isEditing ? (
                  <div className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                      <Label htmlFor="biography" className="text-slate-text-dark">
                        {language === 'ar' ? 'السيرة الذاتية' : 'Biographie'}
                      </Label>
                      <Textarea
                        id="biography"
                        value={editForm.biography}
                        onChange={(e) => setEditForm({ ...editForm, biography: e.target.value })}
                        rows={4}
                        className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-slate-text-dark">
                        {language === 'ar' ? 'الهاتف' : 'Téléphone'}
                      </Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-slate-text-dark">
                        {language === 'ar' ? 'العنوان' : 'Adresse'}
                      </Label>
                      <Textarea
                        id="address"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        rows={2}
                        className="border-slate-border focus:border-blue-primary focus:ring-blue-primary/20"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={handleSaveProfile}
                        className="bg-blue-primary-dark hover:bg-blue-deep"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {language === 'ar' ? 'حفظ' : 'Enregistrer'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="border-slate-border text-slate-text-dark hover:bg-slate-light"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Annuler'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-text">{language === 'ar' ? 'الاسم' : 'Nom'}</Label>
                        <p className="font-medium text-slate-base-dark">{displayName}</p>
                      </div>
                      <div>
                        <Label className="text-slate-text">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                        <p className="font-medium text-slate-base-dark">{donorProfile.email}</p>
                      </div>
                    </div>
                    {donorProfile.phone && (
                      <div>
                        <Label className="text-slate-text">{language === 'ar' ? 'الهاتف' : 'Téléphone'}</Label>
                        <p className="font-medium text-slate-base-dark">{donorProfile.phone}</p>
                      </div>
                    )}
                    {donorProfile.address && (
                      <div>
                        <Label className="text-slate-text">{language === 'ar' ? 'العنوان' : 'Adresse'}</Label>
                        <p className="font-medium text-slate-base-dark">{donorProfile.address}</p>
                      </div>
                    )}
                    {donorProfile.biography && (
                      <div>
                        <Label className="text-slate-text">{language === 'ar' ? 'السيرة الذاتية' : 'Biographie'}</Label>
                        <p className="font-medium text-slate-base-dark whitespace-pre-wrap">{donorProfile.biography}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
