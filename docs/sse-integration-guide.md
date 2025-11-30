# SSE Integration Guide: React + Zustand

This guide shows how to consume the `/api/store-config/sse` endpoint in your React frontend using Zustand for state management.

---

## 📁 Project Structure

```
src/
  stores/
    useStoreConfigStore.ts    # Zustand store
  hooks/
    useStoreConfigSSE.ts      # SSE connection hook
  components/
    StoreStatus.tsx           # Example component
```

---

## 1️⃣ Zustand Store (`src/stores/useStoreConfigStore.ts`)

```typescript
import { create } from "zustand";

interface StoreConfig {
  isShopOpen: boolean;
  isCooking: boolean;
  isHoliday: boolean;
  holidayMessage: string;
  isNoticeActive: boolean;
  noticeMessage: string;
  description: string;
  currentStatusMsg: string;
}

interface StoreConfigStore {
  config: StoreConfig | null;
  isConnected: boolean;
  error: string | null;

  // Actions
  setConfig: (config: StoreConfig) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  config: null,
  isConnected: false,
  error: null,
};

export const useStoreConfigStore = create<StoreConfigStore>((set) => ({
  ...initialState,

  setConfig: (config) => set({ config, error: null }),
  setConnected: (connected) => set({ isConnected: connected }),
  setError: (error) => set({ error, isConnected: false }),
  reset: () => set(initialState),
}));
```

---

## 2️⃣ SSE Hook (`src/hooks/useStoreConfigSSE.ts`)

```typescript
import { useEffect, useRef } from "react";
import { useStoreConfigStore } from "../stores/useStoreConfigStore";

const SSE_URL = "http://localhost:5001/api/store-config/sse";
const RECONNECT_DELAY = 3000; // 3 seconds

export const useStoreConfigSSE = () => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setConfig, setConnected, setError } = useStoreConfigStore();

  const connect = () => {
    // Prevent multiple connections
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return;
    }

    try {
      const eventSource = new EventSource(SSE_URL);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log("✅ SSE Connected");
        setConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📦 SSE Data received:", data);
          setConfig(data);
        } catch (err) {
          console.error("❌ Failed to parse SSE data:", err);
          setError("Failed to parse server data");
        }
      };

      eventSource.onerror = (error) => {
        console.error("❌ SSE Error:", error);
        setConnected(false);
        setError("Connection lost. Reconnecting...");

        // Close the connection
        eventSource.close();

        // Attempt to reconnect after delay
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Attempting to reconnect...");
          connect();
        }, RECONNECT_DELAY);
      };
    } catch (err) {
      console.error("❌ Failed to create EventSource:", err);
      setError("Failed to connect to server");
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setConnected(false);
      console.log("🔌 SSE Disconnected");
    }
  };

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  return { disconnect };
};
```

---

## 3️⃣ Example Component (`src/components/StoreStatus.tsx`)

```typescript
import React from "react";
import { useStoreConfigStore } from "../stores/useStoreConfigStore";
import { useStoreConfigSSE } from "../hooks/useStoreConfigSSE";

export const StoreStatus: React.FC = () => {
  // Connect to SSE (auto-connects on mount)
  useStoreConfigSSE();

  // Get data from Zustand store
  const { config, isConnected, error } = useStoreConfigStore();

  if (error) {
    return (
      <div className="error">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <div className="store-status">
      <div className="connection-indicator">
        {isConnected ? "🟢 Live" : "🔴 Offline"}
      </div>

      <h2>{config.currentStatusMsg}</h2>

      <div className="status-grid">
        <div className={config.isShopOpen ? "open" : "closed"}>
          Shop: {config.isShopOpen ? "Open" : "Closed"}
        </div>

        <div className={config.isCooking ? "active" : "inactive"}>
          Cooking: {config.isCooking ? "Yes" : "No"}
        </div>
      </div>

      {config.isHoliday && (
        <div className="holiday-banner">🌴 {config.holidayMessage}</div>
      )}

      {config.isNoticeActive && (
        <div className="notice-board">📢 {config.noticeMessage}</div>
      )}

      <p className="description">{config.description}</p>
    </div>
  );
};
```

---

## 4️⃣ Usage in App (`src/App.tsx`)

```typescript
import { StoreStatus } from "./components/StoreStatus";

function App() {
  return (
    <div className="App">
      <StoreStatus />
    </div>
  );
}

export default App;
```

---

## 🔧 Advanced: Manual Control

If you need to manually connect/disconnect:

```typescript
import { useStoreConfigSSE } from "../hooks/useStoreConfigSSE";

function AdminPanel() {
  const { disconnect } = useStoreConfigSSE();

  const handleDisconnect = () => {
    disconnect();
    console.log("Manually disconnected from SSE");
  };

  return <button onClick={handleDisconnect}>Disconnect Live Updates</button>;
}
```

---

## 🎯 Best Practices

### 1. **Environment Variables**

```typescript
// .env
VITE_API_URL=http://localhost:5001

// In hook
const SSE_URL = `${import.meta.env.VITE_API_URL}/api/store-config/sse`;
```

### 2. **Visibility API (Battery Optimization)**

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      disconnect(); // Save battery when tab is hidden
    } else {
      connect(); // Reconnect when tab is visible
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, []);
```

### 3. **TypeScript Types**

```typescript
// src/types/storeConfig.ts
export interface StoreConfig {
  isShopOpen: boolean;
  isCooking: boolean;
  isHoliday: boolean;
  holidayMessage: string;
  isNoticeActive: boolean;
  noticeMessage: string;
  description: string;
  currentStatusMsg: string;
}
```

### 4. **Error Boundaries**

```typescript
import { ErrorBoundary } from "react-error-boundary";

<ErrorBoundary fallback={<div>SSE Connection Failed</div>}>
  <StoreStatus />
</ErrorBoundary>;
```

---

## 🚀 Production Checklist

- ✅ Use environment variables for API URL
- ✅ Implement automatic reconnection (done)
- ✅ Handle visibility changes to save battery
- ✅ Add error boundaries
- ✅ Log errors to monitoring service (Sentry, etc.)
- ✅ Add connection status indicator
- ✅ Clean up on unmount (done)
- ✅ Use TypeScript for type safety

---

## 🐛 Debugging

```typescript
// Add to hook for debugging
console.log("EventSource readyState:", eventSource.readyState);
// 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
```

---

## 📊 Testing

```typescript
// Mock SSE in tests
const mockEventSource = {
  addEventListener: jest.fn(),
  close: jest.fn(),
};

global.EventSource = jest.fn(() => mockEventSource);
```

---

## 🔐 CORS (if needed)

If you get CORS errors, ensure your backend has:

```typescript
// Already configured in your app.ts
app.use(cors());
```

For production, specify allowed origins:

```typescript
app.use(
  cors({
    origin: "https://yourdomain.com",
    credentials: true,
  })
);
```
