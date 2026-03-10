CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT,
  headline TEXT,
  online_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('private', 'group')),
  title TEXT,
  avatar TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT FALSE,
  inbox_type TEXT DEFAULT 'focused' CHECK (inbox_type IN ('focused', 'other')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_message_id UUID,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  edited BOOLEAN DEFAULT FALSE,
  deleted_for_everyone BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE TABLE IF NOT EXISTS message_receipts (
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seen_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY(message_id, user_id)
);

CREATE TABLE IF NOT EXISTS message_drafts (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  draft TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members (user_id);
