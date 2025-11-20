"use client";

import { useEffect, useMemo } from "react";
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
import { RotateCcw, ChevronRight, Trophy, Activity } from "lucide-react";
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
  onRestart: () => void;
}

export function ResultsModal({ isOpen, stats, onRestart }: ResultsModalProps) {
  // Mocking the "History" data for the chart based on final WPM
  // In a real scenario, you would pass a `history` array from the hook
  const chartData = useMemo(() => {
    if (!isOpen) return [];
    const data = [];
    let currentWpm = 0;
    // Generate a realistic looking "warm up" curve
    for (let i = 1; i <= 30; i++) {
      const noise = Math.random() * 5 - 2.5;
      const progress = i / 30; // assuming 30s test
      // Logarithmic growth curve simulation
      currentWpm = stats.wpm * (1 - Math.exp(-3 * progress)) + noise; 
      data.push({ time: i, wpm: Math.max(0, Math.round(currentWpm)) });
    }
    return data;
  }, [isOpen, stats.wpm]);

  // Mock Save Function
  useEffect(() => {
    if (isOpen) {
      const saveResult = async () => {
        console.log("Saving result to DB...", {
          ...stats,
          timestamp: new Date().toISOString(),
        });
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("Result saved!");
      };
      saveResult();
    }
  }, [isOpen, stats]);

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
            <Card className="border-border bg-card shadow-2xl ring-1 ring-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-mono tracking-tight text-muted-foreground">
                  Test Complete
                </CardTitle>
                <Trophy className="h-5 w-5 text-primary" />
              </CardHeader>
              
              <CardContent className="grid gap-6">
                {/* Big Stats Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="col-span-2 flex flex-col justify-center rounded-lg bg-background/50 p-6 border border-border">
                    <span className="text-sm text-muted-foreground font-mono">wpm</span>
                    <span className="text-6xl font-bold tracking-tighter text-primary">
                      {stats.wpm}
                    </span>
                  </div>
                  
                  <div className="flex flex-col justify-center rounded-lg bg-background/50 p-6 border border-border">
                    <span className="text-sm text-muted-foreground font-mono">acc</span>
                    <span className="text-3xl font-bold tracking-tighter text-foreground">
                      {stats.accuracy}%
                    </span>
                  </div>

                  <div className="flex flex-col justify-center rounded-lg bg-background/50 p-6 border border-border">
                    <span className="text-sm text-muted-foreground font-mono">err</span>
                    <span className="text-3xl font-bold tracking-tighter text-destructive">
                      {stats.errorChars}
                    </span>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="h-[200px] w-full rounded-lg border border-border bg-background/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>Raw WPM over time</span>
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

              <CardFooter className="flex justify-between border-t border-border/50 pt-6">
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
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
