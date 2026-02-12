import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Shield, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';

export default function ProfessionalSignup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    depositNumber: '',
    cndpAccepted: false
  });

  const [documents, setDocuments] = useState<{
    identityCard?: File;
    professionalCertificate?: File;
    businessLicense?: File;
  }>({});

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast({
        title: 'Erreur',
        description: 'Lien d\'invitation invalide',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }

    loadInvitation(token);
  }, [searchParams]);

  const loadInvitation = async (token: string) => {
    const { data, error } = await supabase
      .from('professional_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      toast({
        title: 'Erreur',
        description: 'Invitation non trouvée ou expirée',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }

    setInvitation(data);
    setFormData(prev => ({ ...prev, email: data.email }));
  };

  const verifyDepositNumber = async () => {
    if (!formData.depositNumber) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir le numéro de dépôt',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .rpc('verify_professional_deposit_number', {
        p_email: formData.email,
        p_deposit_number: formData.depositNumber,
        p_professional_type: invitation.professional_type
      });

    setLoading(false);

    const result = data as { valid: boolean; error?: string } | null;

    if (error || !result?.valid) {
      toast({
        title: 'Vérification échouée',
        description: result?.error || 'Numéro de dépôt incorrect',
        variant: 'destructive'
      });
      return;
    }

    setStep(2);
  };

  const handleFileUpload = (type: 'identityCard' | 'professionalCertificate' | 'businessLicense', file: File) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const uploadDocuments = async (userId: string) => {
    const uploads = Object.entries(documents).map(async ([type, file]) => {
      if (!file) return null;

      const fileName = `${userId}/${type}-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('professional-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('professional-documents')
        .getPublicUrl(fileName);

      return {
        document_type: type === 'identityCard' ? 'identity_card' : 
                      type === 'professionalCertificate' ? 'professional_certificate' : 
                      'business_license',
        file_name: file.name,
        file_url: publicUrl,
        file_size_kb: Math.round(file.size / 1024),
        mime_type: file.type
      };
    });

    return Promise.all(uploads);
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive'
      });
      return;
    }

    const { validatePassword } = await import("@/lib/passwordValidation");
    const validation = validatePassword(formData.password);
    if (!validation.valid) {
      toast({
        title: 'Mot de passe invalide',
        description: validation.errors.join(", "),
        variant: 'destructive'
      });
      return;
    }

    if (!formData.cndpAccepted) {
      toast({
        title: 'Erreur',
        description: 'Vous devez accepter les conditions CNDP',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('User ID not found');

      // Uploader les documents
      const uploadedDocs = await uploadDocuments(userId);

      // Enregistrer les documents dans la base
      const docsToInsert = uploadedDocs
        .filter(doc => doc !== null)
        .map(doc => ({
          ...doc,
          user_id: userId,
          invitation_id: invitation.id
        }));

      if (docsToInsert.length > 0) {
        await supabase
          .from('professional_registration_documents')
          .insert(docsToInsert);
      }

      // Créer la demande d'inscription
      await supabase
        .from('professional_registration_requests')
        .insert([{
          invitation_id: invitation.id,
          user_id: userId,
          professional_type: invitation.professional_type,
          verified_deposit_number: formData.depositNumber,
          company_name: formData.companyName,
          cndp_acceptance: formData.cndpAccepted,
          cndp_accepted_at: new Date().toISOString()
        }]);

      setStep(4);
      
      toast({
        title: 'Inscription réussie',
        description: 'Votre demande a été soumise et sera examinée par un administrateur'
      });

    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!invitation) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  const progress = (step / 4) * 100;

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Création de compte professionnel</CardTitle>
          <CardDescription>
            Étape {step} sur 4 - {invitation.professional_type === 'editor' ? 'Éditeur' :
                                  invitation.professional_type === 'printer' ? 'Imprimeur' :
                                  invitation.professional_type === 'producer' ? 'Producteur' : 'Distributeur'}
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
                <p className="text-sm">
                  Vérification d'identité : saisissez votre dernier numéro de dépôt légal (DL) ou ISSN
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="depositNumber">Numéro de dépôt</Label>
                <Input
                  id="depositNumber"
                  placeholder="DL-2024-000123"
                  value={formData.depositNumber}
                  onChange={(e) => setFormData({ ...formData, depositNumber: e.target.value })}
                />
              </div>

              <Button onClick={verifyDepositNumber} disabled={loading} className="w-full">
                Vérifier et continuer
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="companyName">Nom de l'entreprise</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <PasswordStrengthIndicator password={formData.password} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              <Button onClick={() => setStep(3)} className="w-full">
                Continuer
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <Upload className="h-5 w-5 text-primary" />
                <p className="text-sm">
                  Téléchargez les documents requis (formats acceptés: PDF, JPG, PNG)
                </p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="identity">Pièce d'identité *</Label>
                  <Input
                    id="identity"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('identityCard', e.target.files[0])}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="professional">Justificatif professionnel</Label>
                  <Input
                    id="professional"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('professionalCertificate', e.target.files[0])}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="business">Registre de commerce</Label>
                  <Input
                    id="business"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('businessLicense', e.target.files[0])}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                <Checkbox
                  id="cndp"
                  checked={formData.cndpAccepted}
                  onCheckedChange={(checked) => setFormData({ ...formData, cndpAccepted: checked as boolean })}
                />
                <label
                  htmlFor="cndp"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  J'accepte les conditions de la CNDP relatives au traitement des données personnelles
                </label>
              </div>

              <Button onClick={handleSubmit} disabled={loading || !documents.identityCard} className="w-full">
                Soumettre la demande
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold">Demande soumise avec succès !</h3>
              <p className="text-muted-foreground">
                Votre demande de création de compte a été soumise et sera examinée par un administrateur de la BNRM.
                Vous recevrez un email de confirmation une fois votre compte approuvé.
              </p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Retour à l'accueil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
