import { useState, useEffect, useCallback, useRef } from "react";

export type GameStatus = "idle" | "running" | "finished";

interface UseTypingEngineProps {
  targetText: string;
  duration: number; // In seconds (e.g., 15, 30, 60)
}

interface Stats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  errorChars: number;
}

export const useTypingEngine = ({ targetText, duration }: UseTypingEngineProps) => {
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [status, setStatus] = useState<GameStatus>("idle");
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate stats
  const calculateStats = useCallback((): Stats => {
    const totalTyped = userInput.length;
    const errorCount = errors.size;
    const correctCount = totalTyped - errorCount;
    const timeElapsed = duration - timeLeft;
    const timeInMinutes = timeElapsed > 0 ? timeElapsed / 60 : 0;
    const wpm = timeInMinutes > 0 ? Math.round((totalTyped / 5) / timeInMinutes) : 0;
    const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100;
    return { wpm, accuracy, correctChars: correctCount, errorChars: errorCount };
  }, [userInput, errors, duration, timeLeft]);

  // Start game
  const startGame = useCallback(() => {
    setStatus("running");
    setStartTime(Date.now());
  }, []);

  // Finish game
  const endGame = useCallback(() => {
    setStatus("finished");
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Timer
  useEffect(() => {
    if (status === "running" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, timeLeft, endGame]);

  // Reset
  const resetEngine = useCallback(() => {
    setStatus("idle");
    setUserInput("");
    setErrors(new Set());
    setTimeLeft(duration);
    setStartTime(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [duration]);

  // Key handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (status === "finished") return;
      // Prevent starting before text is ready
      if (!targetText || targetText.length === 0) return;

      // Ignore utility keys (Shift, Alt, etc) but allow Backspace
      if (e.key.length > 1 && e.key !== "Backspace") return;
      
      // Prevent scrolling on Space
      if(e.key === " ") e.preventDefault();

      // 1. Start Game on first valid keypress
      if (status === "idle") {
        startGame();
      }

      // 2. Handle Backspace
      if (e.key === "Backspace") {
        if (userInput.length === 0) return;
        const deleteIndex = userInput.length - 1;
        setUserInput(prev => prev.slice(0, -1));
        setErrors(prev => {
          if (!prev.has(deleteIndex)) return prev;
            const next = new Set(prev);
            next.delete(deleteIndex);
            return next;
        });
        return;
      }

      // 3. Handle Character Input
      // Stop if user has typed everything
      if (userInput.length >= targetText.length) return;

      const char = e.key;
      const currentIndex = userInput.length;
      
      // Add to input state
      setUserInput((prev) => prev + char);

      // Check validity immediately
      const expected = targetText[currentIndex];
      if (expected === undefined) {
        endGame();
        return;
      }
      if (char !== expected) {
        setErrors(prev => {
          const next = new Set(prev);
          next.add(currentIndex);
          return next;
        });
      }
      
      // Check if this was the very last character
      if (currentIndex + 1 === targetText.length) {
        endGame();
      }
    },
    [status, userInput, targetText, startGame, endGame]
  );

  return {
    state: {
      userInput,
      startTime,
      status,
      timeLeft,
      errors,
    },
    stats: calculateStats(),
    actions: {
      handleKeyDown,
      resetEngine,
      setDuration: setTimeLeft, // Allow dynamic duration updates if needed
    },
  };
};
