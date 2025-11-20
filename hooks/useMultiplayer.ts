"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// Types
export interface Player {
  id: string;
  username: string;
  progress: number; // 0-100
  wpm: number;
  isFinished: boolean;
  avatarUrl?: string;
}

export interface RoomState {
  roomId: string;
  players: Player[];
  gameState: "waiting" | "countdown" | "racing" | "finished";
  startTime?: number;
}

interface UseMultiplayerProps {
  serverUrl?: string;
  userId: string;
  username: string;
  avatarUrl?: string;
}

interface UseMultiplayerReturn {
  socket: Socket | null;
  isConnected: boolean;
  roomState: RoomState | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  sendProgress: (progress: number, wpm: number) => void;
  markFinished: () => void;
  currentPlayer: Player | null;
}

const DEFAULT_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const useMultiplayer = ({
  serverUrl = DEFAULT_SERVER_URL,
  userId,
  username,
  avatarUrl,
}: UseMultiplayerProps): UseMultiplayerReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Initialize Socket Connection
  useEffect(() => {
    const socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection Events
    socket.on("connect", () => {
      console.log("✅ Connected to multiplayer server:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    });

    // Room Events
    socket.on("room_joined", (data: { roomId: string; players: Player[] }) => {
      console.log("🚪 Joined room:", data.roomId);
      setRoomState({
        roomId: data.roomId,
        players: data.players,
        gameState: "waiting",
      });

      // Find current player
      const player = data.players.find((p) => p.id === userId);
      if (player) {
        setCurrentPlayer(player);
      }
    });

    socket.on("room_left", () => {
      console.log("👋 Left room");
      setRoomState(null);
      setCurrentPlayer(null);
    });

    socket.on("player_joined", (player: Player) => {
      console.log("👤 Player joined:", player.username);
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: [...prev.players, player],
        };
      });
    });

    socket.on("player_left", (playerId: string) => {
      console.log("👤 Player left:", playerId);
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.filter((p) => p.id !== playerId),
        };
      });
    });

    // Game Events
    socket.on("game_start", (data: { startTime: number }) => {
      console.log("🏁 Game starting at:", new Date(data.startTime));
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          gameState: "countdown",
          startTime: data.startTime,
        };
      });

      // After countdown, change to racing
      setTimeout(() => {
        setRoomState((prev) => {
          if (!prev) return prev;
          return { ...prev, gameState: "racing" };
        });
      }, 3000); // 3 second countdown
    });

    socket.on("player_update", (data: { playerId: string; progress: number; wpm: number }) => {
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === data.playerId
              ? { ...p, progress: data.progress, wpm: data.wpm }
              : p
          ),
        };
      });
    });

    socket.on("player_finished", (data: { playerId: string; wpm: number; position: number }) => {
      console.log(`🏆 Player finished: ${data.playerId} - Position: ${data.position}`);
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === data.playerId
              ? { ...p, isFinished: true, progress: 100, wpm: data.wpm }
              : p
          ),
        };
      });
    });

    socket.on("game_over", (data: { winner: Player; finalResults: Player[] }) => {
      console.log("🎉 Game over! Winner:", data.winner.username);
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          gameState: "finished",
          players: data.finalResults,
        };
      });
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [serverUrl, userId]);

  // Actions
  const joinRoom = useCallback(
    (roomId: string) => {
      if (!socketRef.current) return;

      socketRef.current.emit("join_room", {
        roomId,
        player: {
          id: userId,
          username,
          avatarUrl,
          progress: 0,
          wpm: 0,
          isFinished: false,
        },
      });
    },
    [userId, username, avatarUrl]
  );

  const leaveRoom = useCallback(() => {
    if (!socketRef.current || !roomState) return;

    socketRef.current.emit("leave_room", {
      roomId: roomState.roomId,
      playerId: userId,
    });
  }, [userId, roomState]);

  const sendProgress = useCallback(
    (progress: number, wpm: number) => {
      if (!socketRef.current || !roomState) return;

      socketRef.current.emit("player_update", {
        roomId: roomState.roomId,
        playerId: userId,
        progress: Math.min(100, Math.max(0, progress)),
        wpm: Math.round(wpm),
      });

      // Update local state immediately for responsiveness
      setCurrentPlayer((prev) => {
        if (!prev) return prev;
        return { ...prev, progress, wpm };
      });
    },
    [userId, roomState]
  );

  const markFinished = useCallback(() => {
    if (!socketRef.current || !roomState || !currentPlayer) return;

    socketRef.current.emit("player_finished", {
      roomId: roomState.roomId,
      playerId: userId,
      wpm: currentPlayer.wpm,
    });

    setCurrentPlayer((prev) => {
      if (!prev) return prev;
      return { ...prev, isFinished: true, progress: 100 };
    });
  }, [userId, roomState, currentPlayer]);

  return {
    socket: socketRef.current,
    isConnected,
    roomState,
    joinRoom,
    leaveRoom,
    sendProgress,
    markFinished,
    currentPlayer,
  };
};
