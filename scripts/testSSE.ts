/**
 * Test script to verify SSE real-time updates
 * 
 * This script:
 * 1. Connects to the SSE endpoint
 * 2. Listens for initial data and updates
 * 3. Logs all received events
 * 
 * Usage: npm run dev (in another terminal), then run this script
 */

import { EventSource } from 'eventsource';

const SSE_URL = process.env.API_URL 
  ? `${process.env.API_URL}/store-config/sse`
  : 'http://localhost:5000/api/store-config/sse';

console.log(`🔌 Connecting to SSE endpoint: ${SSE_URL}\n`);

const eventSource = new EventSource(SSE_URL);

eventSource.onopen = () => {
  console.log('✅ SSE Connection established');
  console.log('⏳ Waiting for events...\n');
};

eventSource.onmessage = (event: { data: string }) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`📦 [${timestamp}] Store Config Update received:`);
  
  try {
    const data = JSON.parse(event.data);
    console.log(JSON.stringify(data, null, 2));
    console.log('\n---\n');
  } catch (error) {
    console.log('Raw data:', event.data);
  }
};

eventSource.onerror = (error: unknown) => {
  console.error('❌ SSE Error:', error);
  console.log('🔄 EventSource will automatically reconnect...\n');
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Closing SSE connection...');
  eventSource.close();
  process.exit(0);
});

console.log('💡 Tip: Update the store config from the admin app to see real-time updates!');
console.log('💡 Press Ctrl+C to stop\n');
