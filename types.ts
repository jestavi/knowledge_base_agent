export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  content: string;
  size: number;
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  citations?: string[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

export interface AppConfig {
  modelName: string;
}
