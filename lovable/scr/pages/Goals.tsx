import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Target, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useFinanceStore } from '@/stores/financeStore';
import { format } from 'date-fns';
import { z } from 'zod';
import { toast } from 'sonner';

const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100, 'Name must be less than 100 characters'),
  targetAmount: z.string()
    .min(1, 'Target amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Target amount must be a positive number'),
  currentAmount: z.string()
    .refine((val) => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), 'Current amount must be a non-negative number'),
  targetDate: z.string()
    .min(1, 'Target date is required')
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date > new Date();
    }, 'Target date must be a valid future date'),
});

const addAmountSchema = z.string()
  .min(1, 'Amount is required')
  .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number');

export default function Goals() {
  const { t } = useTranslation();
  const { goals, addGoal, updateGoal, deleteGoal } = useFinanceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddAmountOpen, setIsAddAmountOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{ id: string; currentAmount: number } | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [addAmountError, setAddAmountError] = useState('');
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreate = () => {
    const result = goalSchema.safeParse(newGoal);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    addGoal({
      name: newGoal.name.trim(),
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      targetDate: new Date(newGoal.targetDate),
      color: '',
    });

    setNewGoal({ name: '', targetAmount: '', currentAmount: '', targetDate: '' });
    setErrors({});
    setIsOpen(false);
    toast.success('Goal created successfully!');
  };

  const handleOpenAddAmount = (id: string, currentAmount: number) => {
    setSelectedGoal({ id, currentAmount });
    setAddAmount('');
    setAddAmountError('');
    setIsAddAmountOpen(true);
  };

  const handleAddToGoal = () => {
    const result = addAmountSchema.safeParse(addAmount);
    
    if (!result.success) {
      setAddAmountError(result.error.errors[0]?.message || 'Invalid amount');
      return;
    }

    if (selectedGoal) {
      updateGoal(selectedGoal.id, { 
        currentAmount: selectedGoal.currentAmount + parseFloat(addAmount) 
      });
      setIsAddAmountOpen(false);
      setSelectedGoal(null);
      setAddAmount('');
      setAddAmountError('');
      toast.success('Savings added successfully!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('goals.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('goals.subtitle')}</p>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setErrors({}); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('goals.create')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('goals.newGoal')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('goals.goalName')}</Label>
                <Input
                  id="name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Emergency Fund"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="target">{t('goals.targetAmount')}</Label>
                  <Input
                    id="target"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal((p) => ({ ...p, targetAmount: e.target.value }))}
                    placeholder="1000"
                    aria-invalid={!!errors.targetAmount}
                  />
                  {errors.targetAmount && <p className="text-sm text-destructive">{errors.targetAmount}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="current">{t('goals.currentAmount')}</Label>
                  <Input
                    id="current"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal((p) => ({ ...p, currentAmount: e.target.value }))}
                    placeholder="0"
                    aria-invalid={!!errors.currentAmount}
                  />
                  {errors.currentAmount && <p className="text-sm text-destructive">{errors.currentAmount}</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">{t('goals.targetDate')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal((p) => ({ ...p, targetDate: e.target.value }))}
                  aria-invalid={!!errors.targetDate}
                />
                {errors.targetDate && <p className="text-sm text-destructive">{errors.targetDate}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                {t('goals.cancel')}
              </Button>
              <Button onClick={handleCreate}>{t('goals.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add Amount Dialog */}
      <Dialog open={isAddAmountOpen} onOpenChange={(open) => { setIsAddAmountOpen(open); if (!open) setAddAmountError(''); }}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Add Savings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="addAmount">Amount to add</Label>
              <Input
                id="addAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={addAmount}
                onChange={(e) => { setAddAmount(e.target.value); setAddAmountError(''); }}
                placeholder="100"
                aria-invalid={!!addAmountError}
              />
              {addAmountError && <p className="text-sm text-destructive">{addAmountError}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsAddAmountOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToGoal}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">{t('goals.noGoals')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

            return (
              <div
                key={goal.id}
                className="group relative rounded-2xl bg-card border border-border/50 p-6 shadow-soft transition-all duration-300 hover:shadow-medium animate-slide-up"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteGoal(goal.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>

                <div
                  className="h-2 w-12 rounded-full mb-4"
                  style={{ background: goal.color }}
                />

                <h3 className="font-semibold text-lg text-foreground mb-2">{goal.name}</h3>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-foreground">
                    ${goal.currentAmount.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    / ${goal.targetAmount.toLocaleString()}
                  </span>
                </div>

                <Progress value={progress} className="h-3 mb-3" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ${remaining.toLocaleString()} {t('goals.remaining')}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => handleOpenAddAmount(goal.id, goal.currentAmount)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Savings
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
