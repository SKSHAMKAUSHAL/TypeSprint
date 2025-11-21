"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from "recharts";
import { RotateCcw, ChevronRight, Trophy, Activity, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResultsModalProps {
  isOpen: boolean;
  stats: {
    wpm: number;
    accuracy: number;
    correctChars: number;
    errorChars: number;
  };
  duration: number;
  onRestart: () => void;
}

export function ResultsModal({ isOpen, stats, duration, onRestart }: ResultsModalProps) {
  const [username, setUsername] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Mocking the "History" data for the chart based on final WPM
  const chartData = useMemo(() => {
    if (!isOpen) return [];
    const data = [];
    let currentWpm = 0;
    // Generate a realistic looking "warm up" curve
    for (let i = 1; i <= 30; i++) {
      const noise = Math.random() * 5 - 2.5;
      const progress = i / 30;
      // Logarithmic growth curve simulation
      currentWpm = stats.wpm * (1 - Math.exp(-3 * progress)) + noise; 
      data.push({ time: i, wpm: Math.max(0, Math.round(currentWpm)) });
    }
    return data;
  }, [isOpen, stats.wpm]);

  // Reset save status when modal opens
  useEffect(() => {
    if (isOpen) {
      setSaveStatus('idle');
      setUsername('');
    }
  }, [isOpen]);

  // Save to leaderboard
  const handleSaveToLeaderboard = async () => {
    setSaveStatus('saving');
    
    try {
      const mode = `${duration}s`;
      const response = await fetch('/api/save-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim() || 'Anonymous',
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          mode,
          duration,
        }),
      });

      if (response.ok) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save result:', error);
      setSaveStatus('error');
    }
  };

  // Keyboard Shortcuts: Enter to Restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Enter") {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onRestart]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-2xl"
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-card to-card/80 shadow-2xl shadow-primary/10 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/30">
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Test Complete
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              
              <CardContent className="grid gap-6">
                {/* Big Stats Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="col-span-2 flex flex-col justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 border-2 border-primary/30 shadow-lg shadow-primary/10">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Speed</span>
                    <span className="text-7xl font-black tracking-tighter text-primary mt-2">
                      {stats.wpm}
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">words per minute</span>
                  </div>
                  
                  <div className="flex flex-col justify-center rounded-xl bg-gradient-to-br from-background/80 to-background/40 p-6 border border-border/50">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Accuracy</span>
                    <span className="text-4xl font-bold tracking-tighter text-foreground mt-2">
                      {stats.accuracy}%
                    </span>
                  </div>

                  <div className="flex flex-col justify-center rounded-xl bg-gradient-to-br from-background/80 to-background/40 p-6 border border-border/50">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Errors</span>
                    <span className="text-4xl font-bold tracking-tighter text-destructive mt-2">
                      {stats.errorChars}
                    </span>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="h-[200px] w-full rounded-xl border border-border/50 bg-gradient-to-br from-background/80 to-background/40 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="font-medium">Performance Timeline</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        hide 
                      />
                      <YAxis 
                        stroke="#666" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }}
                        itemStyle={{ color: '#00f0ff', fontFamily: 'monospace' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="wpm"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: "var(--primary)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-6">
                {/* Save to Leaderboard Section */}
                {saveStatus === 'idle' && (
                  <div className="w-full space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                    <p className="text-sm text-center font-medium">
                      🏆 Save to Daily Leaderboard
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter your name (optional)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        maxLength={20}
                        className="flex-1 px-4 py-2.5 bg-background border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                      <Button 
                        onClick={handleSaveToLeaderboard}
                        className="gap-2 px-6 shadow-lg shadow-primary/20"
                        size="lg"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                    </div>
                  </div>
                )}

                {saveStatus === 'saving' && (
                  <div className="w-full py-3 text-center">
                    <p className="text-sm text-muted-foreground font-mono animate-pulse">
                      Saving to leaderboard...
                    </p>
                  </div>
                )}

                {saveStatus === 'saved' && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full py-4 bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30 rounded-xl shadow-lg shadow-primary/20"
                  >
                    <p className="text-sm text-primary text-center font-medium flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      Successfully saved to leaderboard!
                    </p>
                  </motion.div>
                )}

                {saveStatus === 'error' && (
                  <div className="w-full py-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive text-center font-mono">
                      Failed to save. Try again?
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center w-full">
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      TAB
                    </kbd>{" "}
                    +{" "}
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      ENTER
                    </kbd>{" "}
                    to restart
                  </div>
                  
                  <div className="flex w-full sm:w-auto gap-3">
                    <Button variant="outline" className="flex-1 sm:flex-none font-mono">
                      Next Test <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={onRestart} 
                      className="flex-1 sm:flex-none font-mono bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restart
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
