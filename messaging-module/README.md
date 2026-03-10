# LinkedIn-Style Real-Time Messaging Module

This module provides a production-grade messaging architecture with:
- React + TypeScript + Tailwind UI patterns
- Express + Socket.IO backend
- PostgreSQL schema
- Redis presence/cache layer
- JWT-protected APIs and websocket auth

## Folder Structure

```txt
messaging-module/
  backend/
    src/
      api/
        conversations.ts
        messages.ts
        notifications.ts
      config/
        env.ts
      db/
        pool.ts
        schema.sql
      middleware/
        auth.ts
      redis/
        client.ts
      services/
        messageService.ts
      sockets/
        index.ts
      server.ts
    package.json
    tsconfig.json
    .env.example
  frontend/
    src/messaging/
      api/client.ts
      components/
        MessagingLayout.tsx
        ConversationList.tsx
        ConversationItem.tsx
        ChatWindow.tsx
        MessageBubble.tsx
        Composer.tsx
        TypingIndicator.tsx
      hooks/
        useConversations.ts
        useMessages.ts
        useRealtimeMessaging.ts
        useDrafts.ts
      types/index.ts
      index.ts
```

## Backend Setup

1. Install deps
```bash
cd messaging-module/backend
npm install
```

2. Configure env
```bash
cp .env.example .env
```

3. Apply PostgreSQL schema
```bash
psql "$DATABASE_URL" -f src/db/schema.sql
```

4. Run backend
```bash
npm run dev
```

## Frontend Integration

Use inside your React page:

```tsx
import { MessagingLayout } from "../messaging-module/frontend/src/messaging";

export const MessagingPage = () => {
  const myUserId = localStorage.getItem("userId") || "";
  return <MessagingLayout myUserId={myUserId} />;
};
```

Add env in frontend app:

```env
VITE_MESSAGING_API_BASE_URL=http://localhost:4002/api/messaging
VITE_MESSAGING_WS_URL=http://localhost:4002
```

## Implemented Features

- Two-panel LinkedIn-style layout
- Conversation search/filter (all/pinned/archived)
- Realtime message send/receive via Socket.IO
- Typing indicator events
- Seen event broadcast hooks
- Message edit/delete-for-everyone APIs
- Message reactions API
- Draft persistence
- Pagination-ready message APIs
- Presence updates via Redis

## Extension Points (Already Structured)

- GIF / file / voice pipeline: use `type` + `metadata`
- Archive/mute/pin conversation settings: backend routes + member flags
- Browser notifications and sound alerts: wire in `MessagingLayout`
- Infinite conversation/message scroll: add cursor params in hooks
- Group add/remove + system messages: add routes in `conversations.ts`
- Suggested replies / templates / scheduled messages: add services + metadata
