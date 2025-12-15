# SSE Integration Guide for React Native Admin App

> Complete guide to implement Server-Sent Events in your React Native admin app for real-time store status control

## Overview

This guide shows you how to integrate SSE in your React Native admin app so that when you update the store configuration, you can see the changes reflected immediately in your app (and on the website).

## Why SSE in Admin App?

While the admin app **sends** updates via REST API (`PUT /api/store-config`), it can also **receive** updates via SSE to:
- Show real-time confirmation of changes
- Sync status if multiple admins are using the app
- Display current status without manual refresh

## Implementation Options

### Option 1: REST Only (Recommended for Admin)

Since the admin app is primarily **sending** updates, you might not need SSE. Just use REST API:

```typescript
// Update store config
const updateStoreConfig = async (config: Partial<StoreConfig>) => {
  const response = await fetch('https://api.swamyshotfoods.in/api/store-config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(config)
  });
  
  const updatedConfig = await response.json();
  setConfig(updatedConfig); // Update local state
};
```

**Pros**: Simple, no additional dependencies  
**Cons**: No real-time sync if multiple admins

### Option 2: SSE for Real-Time Sync (Advanced)

If you want real-time synchronization across multiple admin devices:

#### Step 1: Install Dependencies

```bash
npm install react-native-sse
# or
yarn add react-native-sse
```

#### Step 2: Create SSE Hook

Create `hooks/useStoreConfigSSE.ts`:

```typescript
import { useEffect, useState, useRef } from 'react';
import EventSource from 'react-native-sse';

interface StoreConfig {
  _id: string;
  isShopOpen: boolean;
  isCooking: boolean;
  isHoliday: boolean;
  holidayMessage: string;
  isNoticeActive: boolean;
  noticeMessage: string;
  currentStatusMsg: string;
}

const SSE_URL = 'https://api.swamyshotfoods.in/api/store-config/sse';

export const useStoreConfigSSE = () => {
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create SSE connection
    const eventSource = new EventSource(SSE_URL);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('open', () => {
      console.log('✅ SSE Connected');
      setIsConnected(true);
      setError(null);
    });

    eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📦 Store config update:', data);
        setConfig(data);
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    });

    eventSource.addEventListener('error', (error) => {
      console.error('❌ SSE Error:', error);
      setIsConnected(false);
      setError('Connection lost. Retrying...');
    });

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, []);

  return { config, isConnected, error };
};
```

#### Step 3: Use in Your Component

```typescript
import React from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import { useStoreConfigSSE } from './hooks/useStoreConfigSSE';

const AdminStoreControl = () => {
  const { config, isConnected, error } = useStoreConfigSSE();
  const [authToken, setAuthToken] = useState('YOUR_JWT_TOKEN');

  const updateConfig = async (updates: Partial<StoreConfig>) => {
    try {
      const response = await fetch('https://api.swamyshotfoods.in/api/store-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update config');
      }

      // SSE will automatically update the UI
      Alert.alert('Success', 'Store status updated!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update store status');
      console.error(err);
    }
  };

  if (!config) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Connection Status */}
      <View style={styles.statusBar}>
        <View style={[styles.indicator, { 
          backgroundColor: isConnected ? '#4CAF50' : '#F44336' 
        }]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Shop Open/Closed */}
      <View style={styles.control}>
        <Text style={styles.label}>Shop Status</Text>
        <Switch
          value={config.isShopOpen}
          onValueChange={(value) => updateConfig({ isShopOpen: value })}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
        />
        <Text style={styles.value}>
          {config.isShopOpen ? 'Open' : 'Closed'}
        </Text>
      </View>

      {/* Cooking Status */}
      <View style={styles.control}>
        <Text style={styles.label}>Cooking Status</Text>
        <Switch
          value={config.isCooking}
          onValueChange={(value) => updateConfig({ isCooking: value })}
          trackColor={{ false: '#767577', true: '#FF9800' }}
        />
        <Text style={styles.value}>
          {config.isCooking ? 'Cooking' : 'Not Cooking'}
        </Text>
      </View>

      {/* Holiday Status */}
      <View style={styles.control}>
        <Text style={styles.label}>Holiday</Text>
        <Switch
          value={config.isHoliday}
          onValueChange={(value) => updateConfig({ isHoliday: value })}
          trackColor={{ false: '#767577', true: '#2196F3' }}
        />
        <Text style={styles.value}>
          {config.isHoliday ? 'Holiday' : 'Working Day'}
        </Text>
      </View>

      {/* Current Status Message */}
      <View style={styles.messageBox}>
        <Text style={styles.messageLabel}>Current Status:</Text>
        <Text style={styles.message}>{config.currentStatusMsg}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#F44336',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
  },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  messageBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#1976D2',
  },
  message: {
    fontSize: 16,
    color: '#333',
  },
});

export default AdminStoreControl;
```

## Alternative: Polling (Simpler)

If SSE is too complex, use polling instead:

```typescript
import { useEffect, useState } from 'react';

const useStoreConfigPolling = (intervalMs = 5000) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('https://api.swamyshotfoods.in/api/store-config');
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };

    // Fetch immediately
    fetchConfig();

    // Poll every 5 seconds
    const interval = setInterval(fetchConfig, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return config;
};
```

## Comparison

| Feature | REST Only | SSE | Polling |
|---------|-----------|-----|---------|
| Complexity | ⭐ Simple | ⭐⭐⭐ Complex | ⭐⭐ Moderate |
| Real-time | ❌ No | ✅ Yes | ⚠️ Delayed |
| Battery | ✅ Efficient | ✅ Efficient | ❌ Drains battery |
| Multi-admin sync | ❌ No | ✅ Yes | ⚠️ Delayed |
| Dependencies | None | react-native-sse | None |

## Recommendation

**For Admin App**: Use **REST Only** (Option 1)
- Simpler implementation
- Admin app is primarily for sending updates
- Less battery drain
- Fewer dependencies

**For Customer Website**: Use **SSE** (already implemented)
- Customers need instant updates
- Many concurrent users benefit from SSE

## Testing

### Test REST Updates
```bash
# From your admin app, toggle a switch and verify:
# 1. API returns 200 status
# 2. Local state updates immediately
# 3. Website receives SSE update (if open)
```

### Test SSE (if implemented)
```bash
# 1. Open admin app on Device A
# 2. Open admin app on Device B
# 3. Toggle switch on Device A
# 4. Verify Device B updates automatically
```

## Troubleshooting

### SSE not connecting
- Check network connectivity
- Verify SSE_URL is correct
- Check CORS settings on backend
- Ensure backend SSE endpoint is running

### Updates not syncing
- Verify JWT token is valid
- Check backend logs for errors
- Ensure EventBroadcast is emitting events

### Battery drain
- Reduce polling interval (if using polling)
- Use SSE instead of polling
- Close SSE connection when app is in background

## Summary

For your React Native admin app:

1. **Recommended**: Use REST API only for simplicity
2. **Optional**: Add SSE if you need multi-admin real-time sync
3. **Alternative**: Use polling (5-10s interval) as middle ground

The backend SSE implementation is already complete and working. The choice of whether to use it in the admin app depends on your specific requirements!
