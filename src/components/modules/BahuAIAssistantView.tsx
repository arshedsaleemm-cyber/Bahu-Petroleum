import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ReactMarkdown from 'react-markdown';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  HelpCircle,
  Fuel,
  Users,
  Receipt,
  DollarSign,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const BahuAIAssistantView: React.FC = () => {
  const {
    currentUser,
    isAdmin,
    dailySalesEntries,
    tanks,
    deliveries,
    lubricants,
    workers,
    attendance,
    salaries,
    creditCardSales,
    infiniCardSales,
    cashRegister,
    bankAccounts,
    expenses,
    shops,
    rentalAgreements,
    tyreShopServices,
    carWashServices,
    tuckShopItems,
    restaurantSales,
    udhaarCustomers,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello **${currentUser?.name || 'Admin'}**! I am **Bahu AI Assistant**, your intelligent business manager and financial analyst for **Bahu Petroleum**.

I have full access to your live database across all 16 modules. Ask me anything about:
- ⛽ **Fuel Sales & Tank Stock**
- 🚚 **Delivery Shortages & Tanker History**
- 🛢️ **Lubricants & Sub-Business Revenue**
- 👥 **Workers, Pending Salaries & Advances**
- 💳 **Credit Card & Infini Card Collections**
- 🏦 **Cash vs Bank Balances**
- 🧾 **Categorized Expenses (Water, Electricity, Maintenance, etc.)**
- 📊 **Net Profit & Business Performance**

Select a quick question below or type your custom query!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Prepared Prompt Suggestions by Category
  const promptSuggestions = [
    {
      category: 'Fuel & Stock',
      icon: Fuel,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
      questions: [
        'How much fuel was sold today?',
        'Show current tank stock and low fuel alerts.',
        'Was there any shortage in fuel delivery this month?',
        'Compare this month fuel sale with last month.',
      ],
    },
    {
      category: 'Finance & Profit',
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      questions: [
        'What is my net profit this month?',
        'How much cash vs bank balance is available?',
        'How much money came through Credit Card & Infinity Card?',
        'Show complete business financial summary.',
      ],
    },
    {
      category: 'Workers & HR',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      questions: [
        'Who has the highest pending worker salary or advance?',
        'How much total salary expense happened this month?',
        'Show attendance summary & absent workers.',
        'How many employees are working and who took maximum advance?',
      ],
    },
    {
      category: 'Expenses & Sub-Biz',
      icon: Receipt,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
      questions: [
        'How much water, electricity and maintenance expense happened this month?',
        'Show category wise expense breakdown.',
        'How much revenue came from Tyre Shop, Car Wash, Tuck Shop & Restaurant?',
        'What is total lubricant sale this month?',
      ],
    },
  ];

  // Helper to compile total live database context snapshot
  const prepareDatabaseSnapshot = () => {
    // Total income calculations
    const fuelRevenue = (dailySalesEntries || []).reduce((acc, curr) => acc + (curr.totalSales || 0), 0);
    const lubricantRevenue = (lubricants || []).reduce((acc, curr) => acc + ((curr.stockIn - curr.remainingStock) * curr.sellingPrice), 0);
    const carWashRevenue = (carWashServices || []).reduce((acc, curr) => acc + curr.serviceFee, 0);
    const tyreShopRevenue = (tyreShopServices || []).reduce((acc, curr) => acc + curr.serviceCost, 0);
    const tuckShopRevenue = (tuckShopItems || []).reduce((acc, curr) => acc + (curr.stockQty * curr.salePrice), 0);
    const restaurantRevenue = (restaurantSales || []).reduce((acc, curr) => acc + curr.netAmount, 0);
    const rentalRevenue = (rentalAgreements || []).reduce((acc, curr) => acc + curr.amountPaid, 0);

    const totalIncome = fuelRevenue + lubricantRevenue + carWashRevenue + tyreShopRevenue + tuckShopRevenue + restaurantRevenue + rentalRevenue;

    // Total expenses
    const regularExpenses = (expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
    const salaryExpensesPaid = (salaries || []).reduce((acc, curr) => acc + curr.salaryPaid, 0);
    const totalExpenses = regularExpenses + salaryExpensesPaid;

    // Expense categories
    const expenseCategories: Record<string, number> = {};
    (expenses || []).forEach(e => {
      const cat = e.category || 'Other';
      expenseCategories[cat] = (expenseCategories[cat] || 0) + e.amount;
    });

    // Bank & Cash balance
    const totalBankBalance = (bankAccounts || []).reduce((acc, curr) => acc + curr.currentBalance, 0);
    const cashInRegister = cashRegister?.cashBalance || 0;

    // Tank stock sum
    const totalTankCapacity = (tanks || []).reduce((acc, curr) => acc + curr.capacity, 0);
    const totalTankCurrent = (tanks || []).reduce((acc, curr) => acc + curr.currentFuel, 0);

    // Delivery shortage
    const totalShortageLiters = (deliveries || []).reduce((acc, curr) => acc + (curr.shortageLiters || 0), 0);

    // Worker balances
    const pendingSalariesTotal = (salaries || []).reduce((acc, curr) => acc + curr.pendingSalary, 0);
    const advancesTotal = (salaries || []).reduce((acc, curr) => acc + curr.totalAdvance, 0);

    return {
      summary: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        cashInRegister,
        totalBankBalance,
        totalTankCapacity,
        totalTankCurrent,
        totalShortageLiters,
        pendingSalariesTotal,
        advancesTotal,
      },
      tanks: (tanks || []).map(t => ({ tankName: t.tankName, fuelType: t.fuelType, capacity: t.capacity, currentFuel: t.currentFuel, lowAlert: t.lowStockThreshold })),
      deliveries: (deliveries || []).slice(-10),
      dailySalesEntries: (dailySalesEntries || []).slice(-15),
      lubricants: (lubricants || []).map(l => ({ productName: l.productName, category: l.category, remainingStock: l.remainingStock, salePrice: l.sellingPrice })),
      workers: (workers || []).map(w => {
        const sal = (salaries || []).find(s => s.workerId === w.id);
        return {
          name: w.name,
          designation: w.designation,
          pendingSalary: sal?.pendingSalary || 0,
          advanceBalance: sal?.totalAdvance || 0,
          status: w.status,
        };
      }),
      expenses: (expenses || []).slice(-20),
      expenseCategoryTotals: expenseCategories,
      creditCardSales: (creditCardSales || []).slice(-10),
      infiniCardSales: (infiniCardSales || []).slice(-10),
      bankAccounts: (bankAccounts || []).map(b => ({ bankName: b.bankName, accountNumber: b.accountNumber, balance: b.currentBalance })),
      subBusinesses: {
        carWashTotal: carWashRevenue,
        tyreShopTotal: tyreShopRevenue,
        tuckShopTotal: tuckShopRevenue,
        restaurantTotal: restaurantRevenue,
        rentalTotal: rentalRevenue,
      },
      udhaarTotal: (udhaarCustomers || []).reduce((acc, c) => acc + c.remainingBalance, 0),
    };
  };

  const handleSendQuery = async (queryText?: string) => {
    const promptToSend = (queryText || inputQuery).trim();
    if (!promptToSend || isLoading) return;

    if (!isAdmin) {
      alert("Security Notice: Only Admin can access Bahu AI Assistant.");
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const dataSnapshot = prepareDatabaseSnapshot();

      const response = await fetch('/api/bahu-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })),
          dataContext: dataSnapshot,
          currentUserRole: currentUser?.role || 'ADMIN',
        }),
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        throw new Error(resData.error || 'Failed to get AI response.');
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: resData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **AI Service Error**: ${err.message || 'Could not communicate with Bahu AI server.'}\n\nPlease verify that your Gemini API Key is configured in Settings > Secrets.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 max-w-lg mx-auto mt-10 shadow-sm">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-extrabold text-slate-800">Admin Security Restricted</h2>
        <p className="text-slate-600 text-sm mt-2">
          Bahu AI Assistant is exclusively restricted to the Business Owner & System Admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-blue-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-lg shrink-0 border border-red-400/40">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Bahu AI Assistant
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> Live DB Connected
                </span>
              </div>
              <p className="text-xs text-blue-200/90 font-medium mt-1">
                Executive Financial Analyst & Operations Manager for Founder & CEO Mian Rashid Saleem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                if (confirm('Clear chat history?')) {
                  setMessages([messages[0]]);
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
              title="Clear Conversation"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" /> Reset Chat
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat & Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Sidebar: Quick Prompts */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Quick Intelligence
              </h3>
            </div>

            <div className="space-y-3 custom-scrollbar max-h-[600px] overflow-y-auto pr-1">
              {promptSuggestions.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <div className={`p-1 rounded-md border ${section.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{section.category}</span>
                    </div>

                    <div className="space-y-1 pl-1">
                      {section.questions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSendQuery(q)}
                          disabled={isLoading}
                          className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-100 text-[11px] font-medium text-slate-700 hover:text-blue-900 transition-all group flex items-start gap-1.5 cursor-pointer"
                        >
                          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Area: Chat Window */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[600px] h-[650px] overflow-hidden">
          {/* Chat Messages List */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-sm ${
                      isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-red-600 to-red-700'
                    }`}
                  >
                    {isUser ? 'ME' : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`space-y-1 max-w-[85%] sm:max-w-[80%]`}>
                    <div className={`flex items-center gap-2 text-[10px] text-slate-400 font-semibold ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{isUser ? 'Admin' : 'Bahu AI Assistant'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                      ) : (
                        <div className="prose prose-xs sm:prose-sm max-w-none text-slate-800 font-sans leading-relaxed">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      )}

                      {!isUser && (
                        <button
                          onClick={() => handleCopyMessage(msg.text, msg.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-2 shadow-sm">
                  <RefreshCw className="w-4 h-4 text-red-600 animate-spin" />
                  <span className="font-semibold text-slate-700">
                    Analyzing live database records & calculating insights...
                  </span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask Bahu AI Assistant (e.g. 'How much fuel sold today?', 'What is net profit?')..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Ask AI</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
