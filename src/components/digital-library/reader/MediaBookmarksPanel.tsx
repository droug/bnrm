import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Bookmark, BookmarkPlus, ChevronDown, ChevronUp, Play, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useMediaBookmarks, MediaBookmark } from '@/hooks/useMediaBookmarks';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MediaBookmarksPanelProps {
  documentId: string;
  currentTime: number;
  onSeek: (time: number) => void;
}

export function MediaBookmarksPanel({ documentId, currentTime, onSeek }: MediaBookmarksPanelProps) {
  const { user } = useAuth();
  const { bookmarks, loading, addBookmark, updateBookmark, deleteBookmark } = useMediaBookmarks(documentId);
  const [isOpen, setIsOpen] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<MediaBookmark | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [addAtTime, setAddAtTime] = useState(0);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickAdd = async () => {
    await addBookmark(currentTime);
  };

  const handleAddWithLabel = async () => {
    await addBookmark(addAtTime, newLabel || undefined);
    setShowAddDialog(false);
    setNewLabel('');
  };

  const openAddDialog = () => {
    setAddAtTime(currentTime);
    setNewLabel('');
    setShowAddDialog(true);
  };

  const openEditDialog = (bookmark: MediaBookmark) => {
    setEditingBookmark(bookmark);
    setNewLabel(bookmark.label || '');
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    if (editingBookmark) {
      await updateBookmark(editingBookmark.id, newLabel);
      setShowEditDialog(false);
      setEditingBookmark(null);
      setNewLabel('');
    }
  };

  const handleDelete = async (bookmarkId: string) => {
    await deleteBookmark(bookmarkId);
  };

  if (!user) {
    return (
      <Card className="shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Marque-pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Connectez-vous pour enregistrer des points de reprise
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-gold-bn-primary" />
              Marque-pages
              {bookmarks.length > 0 && (
                <Badge variant="secondary" className="text-xs">{bookmarks.length}</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleQuickAdd}
                className="gap-1"
                title="Marquer la position actuelle"
              >
                <BookmarkPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Marquer</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <Collapsible open={isOpen}>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <Bookmark className="h-10 w-10 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Aucun marque-page enregistré
                  </p>
                  <Button variant="outline" size="sm" onClick={openAddDialog}>
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Ajouter un marque-page
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2 pr-4">
                    {bookmarks.map((bookmark) => {
                      const isActive = Math.abs(currentTime - bookmark.timestamp_seconds) < 1;
                      
                      return (
                        <div
                          key={bookmark.id}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all group",
                            isActive 
                              ? "bg-gold-bn-primary/10 border border-gold-bn-primary/30" 
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => onSeek(bookmark.timestamp_seconds)}
                        >
                          <div className="flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSeek(bookmark.timestamp_seconds);
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {bookmark.label || `Position ${formatTime(bookmark.timestamp_seconds)}`}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {formatTime(bookmark.timestamp_seconds)}
                            </p>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card z-50">
                              <DropdownMenuItem onClick={() => openEditDialog(bookmark)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Renommer
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(bookmark.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="z-[10001]">
          <DialogHeader>
            <DialogTitle>Ajouter un marque-page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Position: <span className="font-mono font-medium">{formatTime(addAtTime)}</span>
              </p>
            </div>
            <div>
              <Input
                placeholder="Libellé (optionnel)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddWithLabel();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddWithLabel}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="z-[10001]">
          <DialogHeader>
            <DialogTitle>Renommer le marque-page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingBookmark && (
              <p className="text-sm text-muted-foreground">
                Position: <span className="font-mono font-medium">{formatTime(editingBookmark.timestamp_seconds)}</span>
              </p>
            )}
            <Input
              placeholder="Nouveau libellé"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditSave}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
