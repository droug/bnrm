import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_title: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  create: { label: 'Création', color: 'bg-green-500' },
  update: { label: 'Modification', color: 'bg-blue-500' },
  delete: { label: 'Suppression', color: 'bg-red-500' },
  submit: { label: 'Soumission', color: 'bg-amber-500' },
  approve: { label: 'Approbation', color: 'bg-emerald-500' },
  reject: { label: 'Rejet', color: 'bg-red-400' },
  publish: { label: 'Publication', color: 'bg-purple-500' },
  archive: { label: 'Archivage', color: 'bg-gray-500' }
};

const entityLabels: Record<string, string> = {
  exhibition: 'Exposition',
  panorama: 'Panorama',
  hotspot: 'Hotspot',
  artwork: 'Œuvre'
};

export default function VExpo360AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const pageSize = 20;

  // Fetch audit logs
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['vexpo360-audit-logs', actionFilter, entityFilter, page],
    queryFn: async () => {
      let query = supabase
        .from('vexpo_audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }
      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }
      
      const { data, error, count } = await query;
      if (error) throw error;
      return { logs: data as AuditLog[], total: count || 0 };
    }
  });

  const filteredLogs = logsData?.logs?.filter(log => 
    log.entity_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil((logsData?.total || 0) / pageSize);

  const getActionBadge = (action: string) => {
    const config = actionLabels[action];
    if (!config) return <Badge variant="secondary">{action}</Badge>;
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Journal d'Audit</CardTitle>
          <CardDescription>
            Historique complet des actions effectuées dans le CMS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toutes les actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {Object.entries(actionLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(entityLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Élément</TableHead>
                    <TableHead className="w-[80px]">Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd/MM/yy HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{log.user_email || 'Système'}</p>
                          {log.user_role && (
                            <p className="text-xs text-muted-foreground capitalize">{log.user_role}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {entityLabels[log.entity_type] || log.entity_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm truncate max-w-[200px]">
                          {log.entity_title || log.entity_id}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {logsData?.total} entrées au total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {page} sur {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune entrée dans le journal</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'action</DialogTitle>
            <DialogDescription>
              {selectedLog && format(new Date(selectedLog.created_at), 'dd MMMM yyyy à HH:mm:ss', { locale: fr })}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilisateur</p>
                  <p>{selectedLog.user_email || 'Système'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rôle</p>
                  <p className="capitalize">{selectedLog.user_role || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Action</p>
                  {getActionBadge(selectedLog.action)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type d'élément</p>
                  <p>{entityLabels[selectedLog.entity_type] || selectedLog.entity_type}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Élément concerné</p>
                <p>{selectedLog.entity_title || selectedLog.entity_id}</p>
              </div>

              {selectedLog.old_values && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Anciennes valeurs</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Nouvelles valeurs</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {(selectedLog.ip_address || selectedLog.user_agent) && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Informations techniques</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {selectedLog.ip_address && <p>IP: {selectedLog.ip_address}</p>}
                    {selectedLog.user_agent && <p className="truncate">User Agent: {selectedLog.user_agent}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
