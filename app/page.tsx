'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, Keyboard, Clock } from 'lucide-react';
import { useTypingEngine } from '@/hooks/useTypingGame';
import { TypingArea } from '@/components/game/TypingBoard';
import { ResultsModal } from '@/components/game/ResultsModal';
import { Button } from '@/components/ui/button';

// Word pool for generating random typing tests
const WORD_POOL = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so',
  'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
  'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
  'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
  'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
  'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'code',
  'type', 'fast', 'speed', 'test', 'game', 'play', 'win', 'score', 'level', 'power',
  'cyber', 'digital', 'system', 'data', 'network', 'interface', 'protocol', 'byte', 'logic', 'algorithm'
];

const WORD_COUNT = 100;
const TIMER_OPTIONS = [
  { label: '30s', value: 30 },
  { label: '1min', value: 60 },
  { label: '1:30', value: 90 },
  { label: '2min', value: 120 },
];

// Generate random words from the pool
const generateWords = (): string => {
  const words: string[] = [];
  for (let i = 0; i < WORD_COUNT; i++) {
    const randomIndex = Math.floor(Math.random() * WORD_POOL.length);
    words.push(WORD_POOL[randomIndex]);
  }
  return words.join(' ');
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [targetText, setTargetText] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  
  const {
    state,
    stats,
    actions,
  } = useTypingEngine({
    targetText,
    duration: selectedDuration,
  });

  // Fix hydration by only rendering after mount
  useEffect(() => {
    setTargetText(generateWords());
    setMounted(true);
  }, []);

  // Global keydown listener
  useEffect(() => {
    if (!mounted || state.status === 'finished') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      actions.handleKeyDown(event);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [actions, mounted, state.status]);

  // Reset handler - generates new text and resets engine
  const handleReset = () => {
    setTargetText(generateWords());
    actions.resetEngine();
  };

  // Change duration handler (single click applies immediately; if same -> regenerate words)
  const handleDurationChange = (duration: number) => {
    // If clicking the already selected duration, just restart with fresh words
    if (selectedDuration === duration) {
      setTargetText(generateWords());
      actions.resetEngine();
      return;
    }
    setSelectedDuration(duration);
    setTargetText(generateWords());
    actions.resetEngine();
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Keyboard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Type<span className="text-primary">Sprint</span>
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  Test your typing speed & accuracy
                </p>
              </div>
            </div>

            {/* Restart Button */}
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-card/80 border border-border rounded-lg transition-all duration-200 hover:border-primary group"
              aria-label="Restart test"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:rotate-180 duration-300" />
              <span className="font-mono text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Restart
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
          <TypingArea
            targetText={targetText}
            userInput={state.userInput}
            errors={state.errors}
            status={state.status}
            wpm={stats.wpm}
            accuracy={stats.accuracy}
            timeLeft={state.timeLeft}
          />

          {/* Instructions and Timer Selection */}
          {state.status === 'idle' && (
            <div className="mt-12 flex flex-col items-center gap-6 max-w-2xl">
              {/* Timer Duration Selection */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Clock className="w-5 h-5 text-muted-foreground" />
                {TIMER_OPTIONS.map((option) => {
                  const active = selectedDuration === option.value;
                  return (
                    <Button
                      key={option.value}
                      onClick={() => handleDurationChange(option.value)}
                      variant={active ? 'default' : 'outline'}
                      size="sm"
                      aria-pressed={active}
                      className={active ? 'shadow-inner' : ''}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <div className="flex flex-col items-center p-4 bg-card/50 border border-border rounded-lg">
                  <div className="text-3xl mb-2">⌨️</div>
                  <h3 className="font-semibold text-sm mb-1">Just Start Typing</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    No need to click anywhere
                  </p>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-card/50 border border-border rounded-lg">
                  <div className="text-3xl mb-2">⏱️</div>
                  <h3 className="font-semibold text-sm mb-1">Timed Test</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    Type as fast as you can
                  </p>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-card/50 border border-border rounded-lg">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-semibold text-sm mb-1">Beat Your Best</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    Track your progress
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground font-mono">
            Powered by Next.js 15 & React 19 • Built with TypeScript & Tailwind CSS
          </p>
        </div>
      </footer>

      {/* Results Modal */}
      <ResultsModal 
        isOpen={state.status === 'finished'} 
        stats={stats} 
        onRestart={handleReset} 
      />
    </main>
  );
}
