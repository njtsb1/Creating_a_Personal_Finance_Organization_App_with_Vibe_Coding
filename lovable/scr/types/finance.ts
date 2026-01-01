export type Category = 'food' | 'transport' | 'leisure' | 'utilities' | 'shopping' | 'health' | 'other';

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: Date;
  type: 'expense' | 'income';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  createdAt: Date;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
