import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useFinanceStore } from '@/stores/financeStore';
import { format } from 'date-fns';

const COLORS = [
  'hsl(160, 84%, 39%)',
  'hsl(16, 90%, 60%)',
  'hsl(220, 90%, 56%)',
  'hsl(280, 80%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(340, 82%, 52%)',
  'hsl(190, 90%, 50%)',
];

export default function Reports() {
  const { t } = useTranslation();
  const { transactions, getTotalByCategory, getTotalSpent, getTotalSaved } = useFinanceStore();

  const categoryTotals = getTotalByCategory();
  const totalSpent = getTotalSpent();
  const totalSaved = getTotalSaved();

  const pieData = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: t(`categories.${name}`),
      value,
    }));

  const barData = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name: t(`categories.${name}`),
      amount: value,
    }));

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      label: t('reports.totalSpent'),
      value: `$${totalSpent.toLocaleString()}`,
      icon: Wallet,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      trend: 'down' as const,
    },
    {
      label: t('reports.totalSaved'),
      value: `$${totalSaved.toLocaleString()}`,
      icon: PiggyBank,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: 'up' as const,
    },
    {
      label: t('reports.topCategory'),
      value: topCategory ? t(`categories.${topCategory[0]}`) : '-',
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      trend: 'neutral' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('reports.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('reports.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-card border border-border/50 p-6 shadow-soft animate-slide-up"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('reports.categories')}</h2>
          {pieData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [`$${value}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              {t('reports.noData')}
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('reports.thisMonth')}</h2>
          {barData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [`$${value}`, 'Amount']}
                  />
                  <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                    {barData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              {t('reports.noData')}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border/50 p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('reports.transactions')}</h2>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-lg"
                    style={{
                      background: `${COLORS[Object.keys(categoryTotals).indexOf(transaction.category) % COLORS.length]}20`,
                    }}
                  >
                    {transaction.category === 'food' && '🍕'}
                    {transaction.category === 'transport' && '🚗'}
                    {transaction.category === 'leisure' && '🎬'}
                    {transaction.category === 'utilities' && '💡'}
                    {transaction.category === 'shopping' && '🛍️'}
                    {transaction.category === 'health' && '💊'}
                    {transaction.category === 'other' && '📦'}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {t(`categories.${transaction.category}`)} • {format(new Date(transaction.date), 'MMM d')}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${transaction.type === 'expense' ? 'text-destructive' : 'text-primary'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}${transaction.amount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {t('reports.noData')}
          </div>
        )}
      </div>
    </div>
  );
}
