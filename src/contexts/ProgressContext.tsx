import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { createClerkSupabaseClient } from '../lib/supabase';

interface ProgressContextType {
  stats: { xp: number, streak: number };
  completedTopics: string[];
  loading: boolean;
  supabase: any; // Tambahkan ini
  refreshProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const supabase = useMemo(() => createClerkSupabaseClient(getToken), [getToken]);

  const [stats, setStats] = useState({ xp: 0, streak: 0 });
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProgress = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('total_xp, current_streak')
        .maybeSingle();
      
      if (progress) {
        setStats({ xp: progress.total_xp, streak: progress.current_streak });
      }

      const { data: scores } = await supabase
        .from('quiz_scores')
        .select('topic_name');
      
      if (scores) {
        setCompletedTopics(scores.map(s => s.topic_name));
      }
    } catch (err) {
      console.error("Failed to refresh progress:", err);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      refreshProgress();
    } else {
      setLoading(false);
    }
  }, [user, refreshProgress]);

  const value = useMemo(() => ({
    stats,
    completedTopics,
    loading,
    supabase,
    refreshProgress
  }), [stats, completedTopics, loading, supabase, refreshProgress]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
