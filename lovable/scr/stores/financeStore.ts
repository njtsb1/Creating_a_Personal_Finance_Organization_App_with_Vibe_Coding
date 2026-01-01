import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Transaction, Goal, ChatMessage, Category } from '@/types/finance';

interface FinanceState {
  transactions: Transaction[];
  goals: Goal[];
  chatMessages: ChatMessage[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  getTotalByCategory: () => Record<Category, number>;
  getTotalSpent: () => number;
  getTotalSaved: () => number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const goalColors = [
  'hsl(160 84% 39%)',
  'hsl(16 90% 60%)',
  'hsl(220 90% 56%)',
  'hsl(280 80% 60%)',
  'hsl(38 92% 50%)',
];

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [
        { id: '1', amount: 45, category: 'food', description: 'Groceries', date: new Date(), type: 'expense' },
        { id: '2', amount: 25, category: 'transport', description: 'Gas', date: new Date(Date.now() - 86400000), type: 'expense' },
        { id: '3', amount: 120, category: 'utilities', description: 'Electric bill', date: new Date(Date.now() - 172800000), type: 'expense' },
        { id: '4', amount: 35, category: 'leisure', description: 'Movie tickets', date: new Date(Date.now() - 259200000), type: 'expense' },
        { id: '5', amount: 80, category: 'shopping', description: 'Clothes', date: new Date(Date.now() - 345600000), type: 'expense' },
      ],
      goals: [
        {
          id: '1',
          name: 'Emergency Fund',
          targetAmount: 1000,
          currentAmount: 350,
          targetDate: new Date(Date.now() + 90 * 86400000),
          createdAt: new Date(Date.now() - 30 * 86400000),
          color: goalColors[0],
        },
        {
          id: '2',
          name: 'Vacation',
          targetAmount: 2000,
          currentAmount: 800,
          targetDate: new Date(Date.now() + 180 * 86400000),
          createdAt: new Date(Date.now() - 60 * 86400000),
          color: goalColors[1],
        },
      ],
      chatMessages: [],

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            { ...transaction, id: generateId() },
            ...state.transactions,
          ],
        })),

      addGoal: (goal) =>
        set((state) => ({
          goals: [
            {
              ...goal,
              id: generateId(),
              createdAt: new Date(),
              color: goalColors[state.goals.length % goalColors.length],
            },
            ...state.goals,
          ],
        })),

      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            { ...message, id: generateId(), timestamp: new Date() },
          ],
        })),

      getTotalByCategory: () => {
        const { transactions } = get();
        return transactions.reduce(
          (acc, t) => {
            if (t.type === 'expense') {
              acc[t.category] = (acc[t.category] || 0) + t.amount;
            }
            return acc;
          },
          {} as Record<Category, number>
        );
      },

      getTotalSpent: () => {
        const { transactions } = get();
        return transactions
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0);
      },

      getTotalSaved: () => {
        const { goals } = get();
        return goals.reduce((acc, g) => acc + g.currentAmount, 0);
      },
    }),
    {
      name: 'finance-storage',
    }
  )
);
