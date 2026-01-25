import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Profile {
  first_name: string | null;
  last_name: string | null;
}

interface Stats {
  readings: number;
  favorites: number;
  bookmarks: number;
  downloads: number;
}

export function MySpaceHeaderBN() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ readings: 0, favorites: 0, bookmarks: 0, downloads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileAndStats();
    }
  }, [user]);

  const loadProfileAndStats = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) setProfile(profileData);

      // Load stats in parallel
      const [readingsRes, favoritesRes, bookmarksRes, downloadsRes] = await Promise.all([
        supabase.from('reading_history').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('media_bookmarks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('reading_history').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('action_type', 'download'),
      ]);

      setStats({
        readings: readingsRes.count || 0,
        favorites: favoritesRes.count || 0,
        bookmarks: bookmarksRes.count || 0,
        downloads: downloadsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading profile and stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile?.first_name 
    ? `${profile.first_name}${profile.last_name ? ' ' + profile.last_name : ''}`
    : 'Utilisateur';

  const initials = profile?.first_name 
    ? `${profile.first_name[0]}${profile.last_name?.[0] || ''}`
    : 'U';

  const statsItems = [
    { label: 'Lectures', value: stats.readings, icon: 'mdi:book-open-page-variant', color: 'text-blue-600' },
    { label: 'Favoris', value: stats.favorites, icon: 'mdi:heart', color: 'text-red-500' },
    { label: 'Marque-pages', value: stats.bookmarks, icon: 'mdi:bookmark', color: 'text-gold-bn-primary' },
    { label: 'Téléchargements', value: stats.downloads, icon: 'mdi:download', color: 'text-green-600' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-bn-blue-primary via-bn-blue-primary/90 to-bn-blue-dark mb-8">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-bn-primary rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-bn-light rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative px-6 py-8 md:px-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gold-bn-primary/20 border-4 border-gold-bn-primary/40 flex items-center justify-center shadow-lg">
              <span className="text-2xl md:text-3xl font-bold text-white">
                {initials}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Bienvenue, {displayName}
            </h1>
            <p className="text-white/70 text-sm md:text-base flex items-center gap-2">
              <Icon icon="mdi:library" className="h-4 w-4" />
              Votre espace personnel dans la Bibliothèque Numérique Marocaine
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {statsItems.map((item) => (
            <div
              key={item.label}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-white/20", item.color)}>
                  <Icon icon={item.icon} className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {loading ? '-' : item.value}
                  </p>
                  <p className="text-xs text-white/60">{item.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
