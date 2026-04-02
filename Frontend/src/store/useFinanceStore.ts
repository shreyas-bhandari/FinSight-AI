import { create } from 'zustand'

export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  description: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  probability: number 
  deadline: string
  priorityWeight: number // Determines how income is distributed
}

interface Insight {
  id: string
  type: 'warning' | 'success' | 'info'
  message: string
}

interface FinanceState {
  transactions: Transaction[]
  goals: Goal[]
  insights: Insight[]
  addTransaction: (t: Omit<Transaction, 'id'>) => void
  removeTransaction: (id: string) => void
  addGoal: (g: Omit<Goal, 'id'>) => void
  removeGoal: (id: string) => void
  clearData: () => void
}

const mockTransactions: Transaction[] = [
  { id: 't1', amount: 4500, type: 'income', category: 'Salary', date: '2026-04-01', description: 'Monthly Salary' },
  { id: 't2', amount: 120, type: 'expense', category: 'Food', date: '2026-04-02', description: 'Groceries' },
  { id: 't3', amount: 65, type: 'expense', category: 'Transport', date: '2026-04-02', description: 'Uber' },
  { id: 't4', amount: 300, type: 'expense', category: 'Utilities', date: '2026-03-28', description: 'Electricity Bill' },
  { id: 't5', amount: 1500, type: 'income', category: 'Freelance', date: '2026-03-25', description: 'Web Design Project' },
  { id: 't6', amount: 85, type: 'expense', category: 'Entertainment', date: '2026-03-22', description: 'Netflix & Spotify' },
]

const mockGoals: Goal[] = [
  { id: 'g1', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 4500, probability: 85, deadline: '2026-12-31', priorityWeight: 80 },
  { id: 'g2', name: 'New Laptop', targetAmount: 2500, currentAmount: 500, probability: 45, deadline: '2026-08-01', priorityWeight: 20 },
]

const mockInsights: Insight[] = [
  { id: 'i1', type: 'warning', message: 'You are spending 20% more on Food this month compared to last month.' },
  { id: 'i2', type: 'success', message: 'Great job! You saved 35% of your income this month.' },
  { id: 'i3', type: 'info', message: 'Based on your habits, you will reach your Emergency Fund goal by October.' },
]

export const useFinanceStore = create<FinanceState>((set) => ({
  transactions: mockTransactions,
  goals: mockGoals,
  insights: mockInsights,
  addTransaction: (t) => set((state) => {
    const newTransaction = { ...t, id: Math.random().toString() }
    
    // Simulate ML AI Anomaly Detection & Insights
    let newInsights = [...state.insights]
    if (t.type === 'expense' && t.amount > 1000) {
      newInsights = [{ id: Math.random().toString(), type: 'warning', message: `Unusual transaction detected: $${t.amount.toLocaleString()} on ${t.category}.` }, ...newInsights]
    } else if (t.type === 'income' && t.amount > 2000) {
      newInsights = [{ id: Math.random().toString(), type: 'success', message: `Significant income of $${t.amount.toLocaleString()} detected. Consider allocating to your saving goals!` }, ...newInsights]
    }

    // Dynamic Mathematical Priority-Based Income Distribution
    // We auto-allocate 15% of all incomes to the savings pool
    let updatedGoals = [...state.goals]
    if (t.type === 'income' && state.goals.length > 0) {
      const globalSavingsPool = t.amount * 0.15 
      const totalPriorityWeight = state.goals.reduce((acc, g) => acc + g.priorityWeight, 0)
      
      updatedGoals = state.goals.map(g => {
        // Distribute the pool purely based on this goal's percentage of the total active priority weights
        const allocatedShare = totalPriorityWeight > 0 ? (g.priorityWeight / totalPriorityWeight) * globalSavingsPool : 0
        
        return {
          ...g,
          currentAmount: g.currentAmount + allocatedShare,
          // Boost probability slightly if receiving flow
          probability: Math.min(g.probability + 5, 100) 
        }
      })
    } else if (t.type === 'expense') {
       updatedGoals = state.goals.map(g => ({
          ...g,
          probability: Math.max(g.probability - 2, 0) // Lower probability if they are spending money
       }))
    }

    return { 
      transactions: [newTransaction, ...state.transactions],
      insights: newInsights,
      goals: updatedGoals
    }
  }),
  removeTransaction: (id) => set((state) => ({
    transactions: state.transactions.filter(t => t.id !== id)
  })),
  addGoal: (g) => set((state) => ({
    goals: [{ ...g, id: Math.random().toString() }, ...state.goals]
  })),
  removeGoal: (id) => set((state) => ({
    goals: state.goals.filter(g => g.id !== id)
  })),
  clearData: () => set({ transactions: [], goals: [], insights: [] })
}))
