import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PartnerCollectionsManager } from '@/components/partner/PartnerCollectionsManager';
import { PartnerManuscriptSubmissionForm } from '@/components/partner/PartnerManuscriptSubmissionForm';
import { Building2, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function PartnerDashboard() {
  const { user, profile } = useAuth();

  if (!user || profile?.role !== 'partner') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-moroccan font-bold mb-8">
          Espace Partenaire
        </h1>

        <Tabs defaultValue="collections" className="space-y-6">
          <TabsList>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Soumettre un Manuscrit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collections">
            <PartnerCollectionsManager />
          </TabsContent>

          <TabsContent value="submissions">
            <PartnerManuscriptSubmissionForm onSuccess={() => {}} />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}