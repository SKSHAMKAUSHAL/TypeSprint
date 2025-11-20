"use client";

import { useEffect, useState } from "react";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { useTypingEngine } from "@/hooks/useTypingGame";
import { RaceTrack } from "@/components/game/RaceTrack";
import { TypingArea } from "@/components/game/TypingBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, LogOut, Radio } from "lucide-react";

// Word generation (same as single player)
const WORD_POOL = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'code', 'type', 'fast', 'speed', 'test', 'game', 'play', 'win', 'race', 'compete',
];

const generateWords = (count: number = 100): string => {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)]);
  }
  return words.join(' ');
};

export default function MultiplayerPage() {
  const [roomId, setRoomId] = useState<string>("");
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [targetText] = useState<string>(() => generateWords());
  const [userId] = useState<string>(() => `user_${Date.now()}`);
  const [username] = useState<string>(() => `Player${Math.floor(Math.random() * 1000)}`);

  // Multiplayer Hook
  const {
    isConnected,
    roomState,
    joinRoom,
    leaveRoom,
    sendProgress,
    markFinished,
    currentPlayer,
  } = useMultiplayer({
    userId,
    username,
    serverUrl: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
  });

  // Typing Engine Hook
  const {
    state,
    stats,
    actions,
  } = useTypingEngine({
    targetText,
    duration: 60, // 60 second multiplayer races
  });

  // Send progress updates to server
  useEffect(() => {
    if (roomState && state.status === "running") {
      const progress = (state.userInput.length / targetText.length) * 100;
      sendProgress(progress, stats.wpm);
    }
  }, [state.userInput, state.status, stats.wpm, roomState, sendProgress, targetText.length]);

  // Mark finished when typing completes
  useEffect(() => {
    if (state.status === "finished" && roomState && !currentPlayer?.isFinished) {
      markFinished();
    }
  }, [state.status, roomState, currentPlayer, markFinished]);

  // Global keydown listener for typing
  useEffect(() => {
    if (!roomState || roomState.gameState !== "racing") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      actions.handleKeyDown(event);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, roomState]);

  // Handlers
  const handleJoinRoom = () => {
    if (inputRoomId.trim()) {
      setRoomId(inputRoomId.trim());
      joinRoom(inputRoomId.trim());
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = `room_${Date.now()}`;
    setRoomId(newRoomId);
    setInputRoomId(newRoomId);
    joinRoom(newRoomId);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setRoomId("");
    actions.resetEngine();
  };

  // Lobby View - Not in a room
  if (!roomState) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">
                Type<span className="text-primary">Sprint</span>
              </h1>
            </div>
            <h2 className="text-xl font-semibold">Multiplayer Race</h2>
            <p className="text-sm text-muted-foreground">
              Compete in real-time with other typists
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-muted-foreground font-mono">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>

          {/* Join Room Form */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium font-mono">Room Code</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter room code..."
                  value={inputRoomId}
                  onChange={(e) => setInputRoomId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  className="font-mono"
                />
                <Button onClick={handleJoinRoom} disabled={!isConnected || !inputRoomId.trim()}>
                  Join
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={!isConnected}
              className="w-full"
              variant="outline"
            >
              <Users className="w-4 h-4 mr-2" />
              Create New Room
            </Button>
          </div>

          {/* Player Info */}
          <div className="text-center text-sm text-muted-foreground font-mono">
            Playing as: <span className="text-primary">{username}</span>
          </div>
        </div>
      </main>
    );
  }

  // Race View - In a room
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-green-500 animate-pulse" />
                <span className="font-mono text-sm text-muted-foreground">
                  Room: <span className="text-primary">{roomState.roomId}</span>
                </span>
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                {roomState.gameState === "waiting" && "Waiting for players..."}
                {roomState.gameState === "countdown" && "Get Ready!"}
                {roomState.gameState === "racing" && `${state.timeLeft}s remaining`}
                {roomState.gameState === "finished" && "Race Complete!"}
              </div>
            </div>

            <Button onClick={handleLeaveRoom} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Leave Room
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Race Track */}
        <RaceTrack
          players={roomState.players}
          currentPlayerId={userId}
          gameState={roomState.gameState}
        />

        {/* Typing Area (only show during racing) */}
        {roomState.gameState === "racing" && (
          <div className="mt-8">
            <TypingArea
              targetText={targetText}
              userInput={state.userInput}
              errors={state.errors}
              status={state.status}
              wpm={stats.wpm}
              accuracy={stats.accuracy}
              timeLeft={state.timeLeft}
            />
          </div>
        )}

        {/* Waiting State Instructions */}
        {roomState.gameState === "waiting" && (
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-lg p-8 text-center space-y-4">
            <h3 className="text-xl font-bold font-mono">Waiting for Players</h3>
            <p className="text-muted-foreground">
              Share the room code with friends to start racing!
            </p>
            <div className="bg-background/50 border border-border rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-2">Room Code</div>
              <div className="text-2xl font-bold font-mono text-primary">{roomState.roomId}</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Race will start automatically when 2+ players are ready
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
