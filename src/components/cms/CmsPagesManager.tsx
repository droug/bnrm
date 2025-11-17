import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import CmsPageEditor from "./CmsPageEditor";
import CmsPagesTable from "./CmsPagesTable";

export default function CmsPagesManager() {
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: pages, isLoading, refetch } = useQuery({
    queryKey: ['cms-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleCreateNew = () => {
    setSelectedPage(null);
    setIsCreating(true);
  };

  const handleEdit = (page: any) => {
    setSelectedPage(page);
    setIsCreating(false);
  };

  const handleClose = () => {
    setSelectedPage(null);
    setIsCreating(false);
    refetch();
  };

  if (isCreating || selectedPage) {
    return (
      <CmsPageEditor
        page={selectedPage}
        onClose={handleClose}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Pages</h2>
          <p className="text-muted-foreground">
            Créez et gérez les pages de votre site avec sections drag & drop
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Page
        </Button>
      </div>

      <Card className="p-6">
        <CmsPagesTable
          pages={pages || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onRefetch={refetch}
        />
      </Card>
    </div>
  );
}
