'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Target, Zap } from 'lucide-react';

interface TypingAreaProps {
  targetText: string;
  userInput: string;
  errors: Set<number>;
  status: 'idle' | 'running' | 'finished';
  wpm: number;
  accuracy: number;
  timeLeft: number;
}

interface CaretPosition { x: number; y: number; h: number }

export const TypingArea: React.FC<TypingAreaProps> = ({
  targetText,
  userInput,
  errors,
  status,
  wpm,
  accuracy,
  timeLeft,
}) => {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<HTMLSpanElement[]>([]);
  const [caret, setCaret] = useState<CaretPosition>({ x: 0, y: 0, h: 24 });
  const [blinkEnabled, setBlinkEnabled] = useState(true);
  const inactivityRef = useRef<number | null>(null);
  const lastTypeRef = useRef<number>(performance.now());

  // Auto-focus on mount
  useEffect(() => {
    if (textContainerRef.current) {
      textContainerRef.current.focus();
    }
  }, []);

  // Memoized character array to avoid re-splitting on every render
  const chars = useMemo(() => targetText.split(''), [targetText]);

  // Update caret based on next character leading edge (preferred) or trailing edge of last typed
  useEffect(() => {
    // typing occurred, disable blinking immediately
    if (status === 'running') {
      setBlinkEnabled(false);
      lastTypeRef.current = performance.now();
      if (inactivityRef.current) window.clearTimeout(inactivityRef.current);
      inactivityRef.current = window.setTimeout(() => {
        if (performance.now() - lastTypeRef.current >= 500 && status === 'running') {
          setBlinkEnabled(true);
        }
      }, 500);
    } else if (status === 'idle') {
      setBlinkEnabled(true);
    }
    if (!textContainerRef.current) return;
    const typedLen = userInput.length;
    // Use requestAnimationFrame to wait for layout paint
    const id = requestAnimationFrame(() => {
      const parentRect = textContainerRef.current!.getBoundingClientRect();
      const nextRef = charRefs.current[typedLen];
      if (nextRef) {
        const nextRect = nextRef.getBoundingClientRect();
        setCaret({
          x: nextRect.left - parentRect.left,
          y: nextRect.top - parentRect.top,
          h: nextRect.height,
        });
        return;
      }
      // Fallback to trailing edge of last typed char
      const lastIndex = typedLen - 1;
      const lastRef = lastIndex >= 0 ? charRefs.current[lastIndex] : charRefs.current[0];
      if (!lastRef) return;
      const rect = lastRef.getBoundingClientRect();
      setCaret({ x: rect.right - parentRect.left, y: rect.top - parentRect.top, h: rect.height });
    });
    return () => cancelAnimationFrame(id);
  }, [userInput, chars]);

  // Recalculate on window resize (responsive)
  useEffect(() => {
    const handler = () => {
      const typedLen = userInput.length;
      const targetIndex = typedLen === 0 ? 0 : typedLen - 1;
      const ref = charRefs.current[targetIndex];
      if (!ref || !textContainerRef.current) return;
      const rect = ref.getBoundingClientRect();
      const parent = textContainerRef.current.getBoundingClientRect();
      const x = typedLen === 0 ? rect.left - parent.left : rect.right - parent.left;
      const y = rect.top - parent.top;
      setCaret({ x, y, h: rect.height });
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [userInput]);

  // Determine character status based on typing progress
  const getCharStatus = (index: number): 'correct' | 'incorrect' | 'untyped' => {
    if (index >= userInput.length) return 'untyped';
    return errors.has(index) ? 'incorrect' : 'correct';
  };

  // Get character class based on status
  const getCharClass = (status: 'correct' | 'incorrect' | 'untyped'): string => {
    switch (status) {
      case 'correct':
        return 'text-foreground'; // Bright white
      case 'incorrect':
        return 'text-destructive underline decoration-2'; // Red with underline
      case 'untyped':
        return 'text-muted-foreground'; // Dimmed grey
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-mono">WPM</span>
              <span className="text-2xl font-bold font-mono tabular-nums">{wpm}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-mono">ACC</span>
              <span className="text-2xl font-bold font-mono tabular-nums">{accuracy}%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground font-mono">TIME</span>
          <span className={`text-3xl font-bold font-mono tabular-nums transition-colors ${
            timeLeft <= 5 ? 'text-destructive' : 'text-foreground'
          }`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Typing Area */}
      <div className="relative">
        <div
          ref={textContainerRef}
          tabIndex={0}
          className={`relative bg-card border border-border rounded-lg p-8 min-h-[240px] transition-all duration-300 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 ${
            status === 'finished' ? 'blur-sm' : ''
          }`}
        >
          {/* Text Content */}
          <div className="text-3xl font-mono leading-relaxed select-none whitespace-pre-wrap">
            {chars.map((char, index) => {
              const statusChar = getCharStatus(index);
              return (
                <span
                  key={index}
                  ref={el => { if (el) charRefs.current[index] = el; }}
                  className={`inline-block ${getCharClass(statusChar)} transition-colors duration-75`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>

          {/* Animated Caret */}
          {status !== 'finished' && (
            <motion.div
              className={`caret-base ${blinkEnabled ? 'caret-blinking' : ''}`}
              style={{ height: caret.h || '1.5em' }}
              animate={{ x: caret.x, y: caret.y }}
              transition={{
                x: { type: 'spring', stiffness: 500, damping: 30 },
                y: { type: 'spring', stiffness: 500, damping: 30 }
              }}
            />
          )}
        </div>

        {/* Results Overlay */}
        <AnimatePresence>
          {status === 'finished' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-background/95 backdrop-blur-md border-2 border-primary rounded-xl p-12 shadow-2xl shadow-primary/20 max-w-md w-full">
                <div className="flex flex-col items-center gap-6">
                  {/* Trophy Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  >
                    <Trophy className="w-16 h-16 text-primary" />
                  </motion.div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Test Complete!
                  </h2>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-6 w-full">
                    <div className="flex flex-col items-center p-4 bg-card/50 rounded-lg border border-border">
                      <Zap className="w-6 h-6 text-primary mb-2" />
                      <span className="text-sm text-muted-foreground font-mono">WPM</span>
                      <span className="text-4xl font-bold font-mono tabular-nums mt-1">{wpm}</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-4 bg-card/50 rounded-lg border border-border">
                      <Target className="w-6 h-6 text-primary mb-2" />
                      <span className="text-sm text-muted-foreground font-mono">Accuracy</span>
                      <span className="text-4xl font-bold font-mono tabular-nums mt-1">{accuracy}%</span>
                    </div>
                  </div>

                  {/* Performance Message */}
                  <p className="text-center text-muted-foreground text-sm">
                    {wpm >= 80 && accuracy >= 95
                      ? '🚀 Lightning fast! Exceptional performance!'
                      : wpm >= 60 && accuracy >= 90
                      ? '⚡ Great job! You\'re getting faster!'
                      : wpm >= 40 && accuracy >= 85
                      ? '💪 Good work! Keep practicing!'
                      : '🎯 Nice try! Practice makes perfect!'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle State Hint */}
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-6 text-muted-foreground text-sm font-mono"
          >
            Start typing to begin the test...
          </motion.div>
        )}
      </div>
    </div>
  );
};
