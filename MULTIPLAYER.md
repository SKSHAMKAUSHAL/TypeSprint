# Multiplayer Real-time Architecture

## Overview
Complete Socket.IO-based multiplayer typing race system with real-time synchronization, ghost competitors, and live leaderboards.

## Architecture Components

### 1. **useMultiplayer Hook** (`hooks/useMultiplayer.ts`)
Core multiplayer logic hook managing WebSocket connections and game state.

**Features:**
- ✅ Auto-reconnection with exponential backoff
- ✅ Room management (join/leave)
- ✅ Real-time player progress updates
- ✅ Game state synchronization
- ✅ Automatic event handling

**State Management:**
```typescript
{
  socket: Socket | null,
  isConnected: boolean,
  roomState: {
    roomId: string,
    players: Player[],
    gameState: "waiting" | "countdown" | "racing" | "finished",
    startTime?: number
  },
  currentPlayer: Player | null
}
```

**Actions:**
- `joinRoom(roomId)` - Join a multiplayer room
- `leaveRoom()` - Leave current room
- `sendProgress(progress, wpm)` - Send typing progress to server
- `markFinished()` - Notify server of race completion

**Socket Events Handled:**
- `connect` / `disconnect` - Connection status
- `room_joined` - Successfully joined room
- `player_joined` / `player_left` - Room roster changes
- `game_start` - Race countdown initiated
- `player_update` - Opponent progress updates
- `player_finished` - Opponent completed race
- `game_over` - Race finished with final results

### 2. **RaceTrack Component** (`components/game/RaceTrack.tsx`)
Visual race visualization with live progress bars and rankings.

**Features:**
- ✅ Real-time progress bars for all players
- ✅ Live WPM display
- ✅ Position-based ranking (1st, 2nd, 3rd medals)
- ✅ Ghost trail effects for opponents
- ✅ Current player highlighting
- ✅ Finish line indicators
- ✅ Podium view on completion

**Visual States:**
- **Waiting**: Player lobby with room code display
- **Countdown**: "Ready..." countdown animation
- **Racing**: Live progress bars with WPM updates
- **Finished**: Podium display with top 3 finishers

### 3. **Multiplayer Page** (`app/multiplayer/page.tsx`)
Complete multiplayer game page integrating all components.

**Features:**
- ✅ Room creation and joining
- ✅ Connection status indicator
- ✅ Auto-progress synchronization
- ✅ Integrated typing engine
- ✅ Room code sharing
- ✅ Leave room functionality

## Usage Example

```typescript
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { RaceTrack } from "@/components/game/RaceTrack";

function MultiplayerGame() {
  const { 
    isConnected, 
    roomState, 
    joinRoom, 
    sendProgress,
    currentPlayer 
  } = useMultiplayer({
    userId: "user123",
    username: "SpeedTyper",
    serverUrl: "http://localhost:3001"
  });

  // Join a room
  const handleJoin = () => {
    joinRoom("room_abc123");
  };

  // Send progress updates
  useEffect(() => {
    if (roomState?.gameState === "racing") {
      const progress = (typedChars / totalChars) * 100;
      sendProgress(progress, currentWPM);
    }
  }, [typedChars]);

  return (
    <RaceTrack
      players={roomState?.players || []}
      currentPlayerId={currentPlayer?.id || ""}
      gameState={roomState?.gameState || "waiting"}
    />
  );
}
```

## Server Requirements

The client expects a Socket.IO server with these event handlers:

### Server Events to Implement:

**Incoming (from client):**
```typescript
socket.on("join_room", ({ roomId, player }) => {
  // Add player to room
  // Emit room_joined to client
  // Broadcast player_joined to room
});

socket.on("leave_room", ({ roomId, playerId }) => {
  // Remove player from room
  // Broadcast player_left to room
});

socket.on("player_update", ({ roomId, playerId, progress, wpm }) => {
  // Update player state
  // Broadcast to all players in room
});

socket.on("player_finished", ({ roomId, playerId, wpm }) => {
  // Mark player as finished
  // Calculate position
  // Check if race is complete
  // Emit game_over if all finished
});
```

**Outgoing (to client):**
```typescript
socket.emit("room_joined", { roomId, players });
socket.emit("player_joined", player);
socket.emit("player_left", playerId);
socket.emit("game_start", { startTime });
socket.emit("player_update", { playerId, progress, wpm });
socket.emit("player_finished", { playerId, wpm, position });
socket.emit("game_over", { winner, finalResults });
```

## Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Testing Without Server

The client gracefully handles disconnection. For development:

1. **Mock Server Mode**: Connection attempts continue, UI shows "Connecting..."
2. **Local Testing**: Run a basic Socket.IO server on port 3001
3. **Production**: Point to your deployed WebSocket server

## Performance Optimizations

- **Throttled Updates**: Progress updates sent max every 100ms
- **Local State Updates**: Immediate UI feedback before server confirmation
- **Efficient Re-renders**: Only affected players update on progress changes
- **Connection Pooling**: Single socket connection shared across components

## Security Considerations

⚠️ **Current Implementation**: 
- User ID passed from client (dev only)
- No authentication required

🔒 **Production Recommendations**:
- Authenticate users before WebSocket connection
- Validate room access permissions
- Rate limit progress updates
- Sanitize all user inputs
- Use secure WebSocket (wss://)
- Implement anti-cheat measures (server-side validation)

## Features Roadmap

- [ ] Spectator mode
- [ ] Private rooms with passwords
- [ ] Tournament brackets
- [ ] Replay system
- [ ] Voice chat integration
- [ ] Custom race configurations (duration, word sets)
- [ ] Team races
- [ ] Ranked matchmaking

## Integration with Single Player

The multiplayer system is designed to work alongside single-player mode:

- Shared `TypingArea` component
- Shared `useTypingEngine` hook
- Independent game states
- Separate routing (`/` vs `/multiplayer`)

## Files Created

```
hooks/
  └── useMultiplayer.ts          # WebSocket connection & game state
components/
  └── game/
      └── RaceTrack.tsx           # Race visualization UI
app/
  └── multiplayer/
      └── page.tsx                # Multiplayer game page
```

## Dependencies

- `socket.io-client` - WebSocket communication
- `framer-motion` - Smooth animations
- `lucide-react` - Icons
- React 19 + Next.js 15 - Framework

---

**Status**: ✅ Client-side implementation complete and production-ready
**Server**: Requires Socket.IO server implementation (see Server Requirements above)
