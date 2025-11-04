import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner(user_id, last_read_at),
          messages(id, content, created_at, sender_id)
        `)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      
      // Get last message for each conversation
      return data?.map(conv => ({
        ...conv,
        lastMessage: conv.messages?.[conv.messages.length - 1] || null,
      })) || [];
    },
  });
};

export const useConversation = (conversationId?: string) => {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants(
            user_id,
            last_read_at,
            is_muted,
            profiles:user_id(first_name, last_name)
          )
        `)
        .eq('id', conversationId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });
};

export const useMessages = (conversationId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, email),
          profiles!messages_sender_id_fkey(first_name, last_name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: any[]) => [...(old || []), payload.new]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return query;
};

export const useUnreadCount = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_unread_count');
      if (error) throw error;
      
      // Calculate total
      const total = data?.reduce((sum, item) => sum + Number(item.unread_count), 0) || 0;
      
      return {
        total,
        byConversation: data || [],
      };
    },
  });

  // Subscribe to unread messages changes
  useEffect(() => {
    const channel = supabase
      .channel('unread-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unread_messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useSendMessage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      messageType = 'text',
      attachments,
    }: {
      conversationId: string;
      content: string;
      messageType?: 'text' | 'file' | 'image';
      attachments?: any;
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            content,
            message_type: messageType,
            attachments,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateConversation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      participantIds,
      conversationType = 'direct',
    }: {
      title?: string;
      participantIds: string[];
      conversationType?: 'direct' | 'group' | 'support';
    }) => {
      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert([
          {
            title,
            conversation_type: conversationType,
          },
        ])
        .select()
        .single();

      if (convError) throw convError;

      // Add current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const allParticipants = [user.id, ...participantIds];

      // Add participants
      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(
          allParticipants.map((userId) => ({
            conversation_id: conversation.id,
            user_id: userId,
          }))
        );

      if (partError) throw partError;

      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Succès",
        description: "Conversation créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: conversationId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
