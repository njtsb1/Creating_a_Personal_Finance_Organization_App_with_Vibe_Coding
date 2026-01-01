import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinanceStore } from '@/stores/financeStore';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/finance';

const categoryKeywords: Record<string, Category> = {
  food: 'food',
  groceries: 'food',
  restaurant: 'food',
  supermercado: 'food',
  mercado: 'food',
  comida: 'food',
  transport: 'transport',
  gas: 'transport',
  uber: 'transport',
  transporte: 'transport',
  gasolina: 'transport',
  leisure: 'leisure',
  movie: 'leisure',
  cinema: 'leisure',
  lazer: 'leisure',
  utilities: 'utilities',
  bill: 'utilities',
  conta: 'utilities',
  shopping: 'shopping',
  clothes: 'shopping',
  roupa: 'shopping',
  compras: 'shopping',
  health: 'health',
  doctor: 'health',
  médico: 'health',
  farmácia: 'health',
};

function parseExpense(message: string): { amount: number; category: Category } | null {
  const amountMatch = message.match(/[\$R\$]?\s*(\d+(?:[.,]\d{2})?)/);
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(',', '.'));
  const lowerMessage = message.toLowerCase();

  let category: Category = 'other';
  for (const [keyword, cat] of Object.entries(categoryKeywords)) {
    if (lowerMessage.includes(keyword)) {
      category = cat;
      break;
    }
  }

  return { amount, category };
}

export default function Chat() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatMessages, addChatMessage, addTransaction, getTotalByCategory } = useFinanceStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (chatMessages.length === 0) {
      addChatMessage({ role: 'assistant', content: t('chat.welcome') });
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMessage });

    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 800));

    const parsed = parseExpense(userMessage);
    if (parsed) {
      addTransaction({
        amount: parsed.amount,
        category: parsed.category,
        description: userMessage,
        date: new Date(),
        type: 'expense',
      });

      const categoryTotals = getTotalByCategory();
      const weeklyBudget = 200;
      const percentage = Math.round((categoryTotals[parsed.category] / weeklyBudget) * 100);

      addChatMessage({
        role: 'assistant',
        content: t('chat.expenseLogged', {
          amount: `$${parsed.amount}`,
          category: t(`categories.${parsed.category}`),
          percentage: Math.min(percentage, 100),
        }),
      });

      if (percentage > 70) {
        await new Promise((r) => setTimeout(r, 500));
        addChatMessage({ role: 'assistant', content: t('chat.tipSaving') });
      }
    } else {
      addChatMessage({
        role: 'assistant',
        content: t('chat.welcome'),
      });
    }

    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t('chat.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('chat.subtitle')}</p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl bg-card shadow-soft border border-border/50 p-4 space-y-4">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 animate-slide-up',
              message.role === 'user' ? 'flex-row-reverse' : ''
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                message.role === 'user'
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              {message.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
            </div>
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-4 py-3',
                message.role === 'user'
                  ? 'gradient-primary text-primary-foreground rounded-tr-md'
                  : 'bg-secondary text-secondary-foreground rounded-tl-md'
              )}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.placeholder')}
          className="flex-1 h-12 rounded-xl bg-card border-border/50 px-4"
        />
        <Button variant="icon" size="icon" className="h-12 w-12" aria-label="Voice input">
          <Mic className="h-5 w-5" />
        </Button>
        <Button onClick={handleSend} className="h-12 px-6" disabled={!input.trim()}>
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
