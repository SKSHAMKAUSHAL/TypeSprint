"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, User, Crown } from "lucide-react";
import { Player } from "@/hooks/useMultiplayer";

interface RaceTrackProps {
  players: Player[];
  currentPlayerId: string;
  gameState: "waiting" | "countdown" | "racing" | "finished";
}

export const RaceTrack: React.FC<RaceTrackProps> = ({
  players,
  currentPlayerId,
  gameState,
}) => {
  // Sort players by progress (descending) for visual ranking
  const sortedPlayers = [...players].sort((a, b) => b.progress - a.progress);

  // Get position for a specific player
  const getPosition = (playerId: string): number => {
    return sortedPlayers.findIndex((p) => p.id === playerId) + 1;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold font-mono">Live Race</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
          <User className="w-4 h-4" />
          <span>{players.length} Racers</span>
        </div>
      </div>

      {/* Game State Indicator */}
      {gameState === "countdown" && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <div className="text-6xl font-bold text-primary font-mono">
            Ready...
          </div>
        </motion.div>
      )}

      {/* Race Tracks */}
      <div className="space-y-3">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => {
            const isCurrentPlayer = player.id === currentPlayerId;
            const position = index + 1;

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-card border rounded-lg overflow-hidden transition-all duration-300 ${
                  isCurrentPlayer
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                {/* Player Info Bar */}
                <div className="flex items-center justify-between px-4 py-2 bg-background/50">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Position Badge */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        position === 1 && player.isFinished
                          ? "bg-yellow-500/20 text-yellow-500"
                          : position === 2 && player.isFinished
                          ? "bg-slate-400/20 text-slate-400"
                          : position === 3 && player.isFinished
                          ? "bg-orange-600/20 text-orange-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {position === 1 && player.isFinished ? (
                        <Crown className="w-4 h-4" />
                      ) : (
                        position
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {player.avatarUrl ? (
                        <img
                          src={player.avatarUrl}
                          alt={player.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Username */}
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`font-mono text-sm truncate ${
                          isCurrentPlayer
                            ? "text-primary font-bold"
                            : "text-foreground"
                        }`}
                      >
                        {player.username}
                        {isCurrentPlayer && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (You)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="font-mono text-sm font-bold tabular-nums">
                        {player.wpm}
                      </span>
                      <span className="text-xs text-muted-foreground">wpm</span>
                    </div>
                    <div className="font-mono text-sm text-muted-foreground tabular-nums min-w-[3rem] text-right">
                      {player.progress.toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-muted/30">
                  <motion.div
                    className={`absolute inset-y-0 left-0 ${
                      isCurrentPlayer
                        ? "bg-gradient-to-r from-primary to-primary/70"
                        : player.isFinished
                        ? "bg-gradient-to-r from-green-500 to-green-600"
                        : "bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/30"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${player.progress}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />

                  {/* Finish Line Indicator */}
                  {player.isFinished && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Trophy className="w-3 h-3 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Ghost Trail Effect */}
                {!isCurrentPlayer && gameState === "racing" && (
                  <motion.div
                    className="absolute inset-y-0 left-0 w-1 bg-primary/30 blur-sm"
                    animate={{
                      left: `${player.progress}%`,
                    }}
                    transition={{ type: "spring", stiffness: 100 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Waiting State */}
      {gameState === "waiting" && players.length < 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground"
        >
          <p className="font-mono text-sm">
            Waiting for more players to join...
          </p>
          <p className="font-mono text-xs mt-2">
            {players.length}/10 players ready
          </p>
        </motion.div>
      )}

      {/* Finished State - Podium */}
      {gameState === "finished" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-card border border-border rounded-lg"
        >
          <h3 className="text-center text-xl font-bold font-mono mb-4">
            🏁 Race Complete!
          </h3>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {sortedPlayers.slice(0, 3).map((player, index) => (
              <div
                key={player.id}
                className={`text-center p-4 rounded-lg ${
                  index === 0
                    ? "bg-yellow-500/10 border-2 border-yellow-500"
                    : index === 1
                    ? "bg-slate-400/10 border border-slate-400"
                    : "bg-orange-600/10 border border-orange-600"
                }`}
              >
                <div className="text-3xl mb-2">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </div>
                <div className="font-mono text-sm font-bold truncate">
                  {player.username}
                </div>
                <div className="font-mono text-xs text-muted-foreground mt-1">
                  {player.wpm} WPM
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
