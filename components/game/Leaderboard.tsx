'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeaderboardEntry {
  _id: string;
  username: string;
  wpm: number;
  accuracy: number;
  createdAt: string;
}

interface LeaderboardProps {
  mode?: string;
}

export function Leaderboard({ mode = '30s' }: LeaderboardProps) {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await fetch(`/api/leaderboard?mode=${mode}&limit=10`);
        const data = await response.json();
        
        if (data.success) {
          setScores(data.leaderboard);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [mode]);

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4 border-b border-border/30">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <span>Daily Top 10</span>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full ml-auto">{mode}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-background/50 rounded animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Failed to load leaderboard
          </div>
        )}

        {!loading && !error && scores.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No scores yet today.</p>
            <p className="text-xs mt-1">Be the first!</p>
          </div>
        )}

        {!loading && !error && scores.length > 0 && (
          <ol className="space-y-2.5">
            {scores.map((score, index) => (
              <motion.li
                key={score._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                  index === 0
                    ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/40 shadow-md shadow-primary/10'
                    : index === 1
                    ? 'bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30'
                    : index === 2
                    ? 'bg-gradient-to-r from-primary/10 to-transparent border border-primary/20'
                    : 'bg-background/60 border border-border/50 hover:border-border'
                }`}
              >
                <span
                  className={`font-bold text-lg min-w-[32px] text-center ${
                    index === 0
                      ? 'text-primary scale-110'
                      : index === 1
                      ? 'text-primary/80 scale-105'
                      : index === 2
                      ? 'text-primary/60'
                      : 'text-muted-foreground text-sm'
                  }`}
                >
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                </span>
                
                <span className="flex-1 font-medium text-sm truncate">
                  {score.username}
                </span>
                
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-primary text-lg tabular-nums">
                      {score.wpm}
                    </span>
                    <span className="text-[10px] text-muted-foreground">WPM</span>
                  </div>
                  <div className="h-8 w-px bg-border/50" />
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium tabular-nums">
                      {score.accuracy.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">ACC</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
