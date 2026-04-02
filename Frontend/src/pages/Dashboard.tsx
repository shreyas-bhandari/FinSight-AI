import { useMemo } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { useFinanceStore } from '@/store/useFinanceStore'
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react'

const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316']

export default function Dashboard() {
  const transactions = useFinanceStore(state => state.transactions)
  const insights = useFinanceStore(state => state.insights)

  const recentTransactions = transactions.slice(0, 5)

  // Dynamically calculate statistics
  const { totalIncome, totalExpense, balance, savingsRate, pieData, lineData } = useMemo(() => {
    let inc = 0
    let exp = 0
    const catMap: Record<string, number> = {}
    const monthMap: Record<string, { name: string; income: number; expense: number }> = {}

    transactions.forEach(t => {
      // Aggregate Totals
      if (t.type === 'income') inc += t.amount
      else exp += t.amount

      // Aggregate Pie Chart Categories (Expenses only)
      if (t.type === 'expense') {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount
      }

      // Aggregate Line Chart Data (by month string e.g., '2026-03')
      const monthStr = t.date.substring(0, 7) 
      if (!monthMap[monthStr]) {
        // Just extract short month name roughly for display
        const dateObj = new Date(t.date)
        const monthName = dateObj.toLocaleString('default', { month: 'short' })
        monthMap[monthStr] = { name: monthName, income: 0, expense: 0 }
      }
      if (t.type === 'income') monthMap[monthStr].income += t.amount
      else monthMap[monthStr].expense += t.amount
    })

    const computedPieData = Object.keys(catMap).map(key => ({
      name: key,
      value: catMap[key]
    }))

    // Sort line data explicitly by month string keys
    const computedLineData = Object.keys(monthMap).sort().map(key => monthMap[key])

    const computedSavings = inc > 0 ? ((inc - exp) / inc) * 100 : 0

    return { 
      totalIncome: inc, 
      totalExpense: exp, 
      balance: inc - exp, 
      savingsRate: computedSavings,
      pieData: computedPieData,
      lineData: computedLineData
    }
  }, [transactions])

  const statsCards = [
    { title: "Total Balance", amount: `$${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: Wallet, trend: "Live", positive: balance >= 0 },
    { title: "Total Income", amount: `$${totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: TrendingUp, trend: "Live", positive: true },
    { title: "Total Expense", amount: `$${totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: TrendingDown, trend: "Live", positive: false },
    { title: "Savings Rate", amount: `${savingsRate.toFixed(1)}%`, icon: DollarSign, trend: "Live", positive: savingsRate > 0 }
  ]

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard overview</h1>
        <p className="text-muted-foreground">Welcome back, here is your financial summary.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => (
          <Card key={i} className="hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.amount}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.positive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Sparkles size={14} className="text-primary mr-1" />
                <span className="text-muted-foreground ml-1">Dynamic from your inputs</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Cash Flow Overview</CardTitle>
            <CardDescription>Income vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData.length ? lineData : [{name: 'No data', income: 0, expense: 0}]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="income" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="expense" stroke="#ec4899" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Visual breakdown of your expenses</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
             {pieData.length > 0 ? (
               <>
                 <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm font-medium">{entry.name}</span>
                    </div>
                  ))}
                </div>
               </>
             ) : (
               <div className="text-muted-foreground flex flex-col items-center">
                 <Sparkles className="mb-2 opacity-50" size={32} />
                 No expense data yet
               </div>
             )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Insights Panel */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2 text-primary">
              <Sparkles size={20} />
              <CardTitle>Smart Insights</CardTitle>
            </div>
            <CardDescription>AI-generated findings based on your activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.length > 0 ? insights.map((insight) => (
              <div 
                key={insight.id} 
                className={`p-4 rounded-xl border ${
                  insight.type === 'warning' ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                  insight.type === 'success' ? 'bg-success/10 border-success/20 text-success' :
                  'bg-primary/10 border-primary/20 text-primary'
                }`}
              >
                <p className="text-sm font-medium">{insight.message}</p>
              </div>
            )) : (
              <div className="p-4 rounded-xl border bg-muted/20 border-white/5 text-muted-foreground text-sm">
                Add more transactions for AI analysis.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${tx.type === 'income' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {tx.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div>
                      <p className="font-semibold">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.category} • {tx.date}</p>
                    </div>
                  </div>
                  <div className={`font-bold ${tx.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No transactions found. Add some from the Transactions tab!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
