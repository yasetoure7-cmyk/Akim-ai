export type Language = 'en' | 'fr';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  language: Language;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export type PromptCategory = 'school' | 'songs' | 'jokes' | 'general' | 'chat';

export interface PromptTemplate {
  category: PromptCategory;
  emoji: string;
  labelEn: string;
  labelFr: string;
  promptEn: string;
  promptFr: string;
}
