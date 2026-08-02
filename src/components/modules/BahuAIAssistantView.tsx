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
  Mic,
  MicOff,
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
    updateTank,
    deliveries,
    lubricants,
    workers,
    salaries,
    markAttendance,
    addSalaryAdvance,
    paySalary,
    creditCardSales,
    addCreditCardSale,
    infiniCardSales,
    addInfiniCardSale,
    cashRegister,
    bankAccounts,
    addBankTransaction,
    expenses,
    addExpense,
    rentalAgreements,
    tyreShopServices,
    addTyreShopService,
    carWashServices,
    addCarWashService,
    tuckShopItems,
    addTuckShopItem,
    restaurantSales,
    addRestaurantSale,
    udhaarCustomers,
    fuelSales,
    addFuelSale,
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello **${currentUser?.name || 'Admin'}**! I am **Bahu AI Assistant**, your business manager and financial analyst for **Bahu Petroleum**.

How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Voice speech recognition setup
  const toggleVoiceInput = () => {
    setVoiceError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser. Please type your command.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ur-PK'; // Supports Urdu & English

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInputQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError('Microphone access is blocked by your browser or iframe permissions. Please grant permission or type your request below.');
        } else if (event.error === 'no-speech') {
          setVoiceError('No speech was detected. Please try speaking again or type your command.');
        } else if (event.error === 'aborted') {
          // Silent abort
        } else {
          setVoiceError(`Voice input error (${event.error}). Please type your command.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Voice input start error:', err);
      setIsListening(false);
      setVoiceError('Could not start microphone. Please check browser permissions or type your command.');
    }
  };

  // Execute database action returned from AI
  const executeDatabaseAction = (action: any) => {
    if (!action || !action.type) return;

    const p = action.payload || {};
    const amount = Number(p.amount) || 0;
    const dateStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      switch (action.type) {
        case 'ADD_EXPENSE': {
          addExpense({
            title: `${p.category || 'Expense'} Entry`,
            category: p.category || 'Other',
            amount: amount,
            date: dateStr,
            time: timeStr,
            description: p.notes || 'Added via Bahu AI Assistant',
            notes: p.notes || 'Added via Bahu AI Assistant',
          });
          break;
        }

        case 'ADD_FUEL_SALE': {
          const targetTank = tanks.find(t => t.id === p.tankId) || tanks.find(t => t.fuelType === (p.fuelType || 'Super Petrol')) || tanks[0];
          if (targetTank) {
            addFuelSale({
              date: p.date || dateStr,
              fuelType: (p.fuelType || targetTank.fuelType || 'Super Petrol') as any,
              tankId: targetTank.id,
              quantityLiters: Number(p.quantityLiters || p.liters) || 100,
              sellingPricePerLiter: Number(p.sellingPrice) || undefined,
              totalSaleAmount: amount || Number(p.totalSaleAmount) || 0,
              notes: p.notes || 'Recorded via Bahu AI Assistant',
            });
          }
          break;
        }

        case 'ADD_TYRE_SHOP_SALE': {
          addTyreShopService({
            serviceType: 'New Tyre Sales',
            customerName: p.customerName || 'Walk-in AI Sale',
            vehicleNumber: 'N/A',
            vehicleType: 'Car',
            serviceCost: amount,
            paymentMethod: 'Cash',
            technicianName: 'General Technician',
            dateTime: `${dateStr} ${timeStr}`,
          });
          break;
        }

        case 'ADD_CAR_WASH_SALE': {
          addCarWashService({
            vehicleCategory: 'Car',
            washPackage: 'Normal Wash',
            customerName: p.customerName || 'Walk-in AI Sale',
            vehicleNumber: 'N/A',
            serviceFee: amount,
            paymentStatus: 'Paid',
            washerWorker: 'General Washer',
            dateTime: `${dateStr} ${timeStr}`,
          });
          break;
        }

        case 'ADD_RESTAURANT_SALE': {
          addRestaurantSale({
            date: dateStr,
            time: timeStr,
            customerName: p.customerName || 'Walk-in Customer',
            orderType: 'Takeaway',
            paymentMethod: 'Cash',
            totalAmount: amount,
            netAmount: amount,
          });
          break;
        }

        case 'ADD_TUCK_SHOP_SALE': {
          addTuckShopItem({
            itemName: p.itemName || 'Quick AI Sale Item',
            category: 'Snacks',
            barcode: 'AI-' + Date.now().toString().slice(-6),
            stockQty: 10,
            purchasePrice: Math.round(amount * 0.8),
            salePrice: amount,
            reorderLevel: 2,
          });
          break;
        }

        case 'ADD_CREDIT_CARD_SALE': {
          addCreditCardSale({
            date: dateStr,
            time: timeStr,
            terminalId: 'POS-01',
            customerName: p.customerName || 'Walk-in',
            amount: amount,
            receiptNo: 'SLIP-' + Date.now().toString().slice(-4),
          });
          break;
        }

        case 'ADD_INFINI_CARD_SALE': {
          addInfiniCardSale({
            date: dateStr,
            time: timeStr,
            cardNumber: 'INF-' + Date.now().toString().slice(-4),
            fleetName: p.customerName || 'Corporate Fleet',
            vehicleNumber: 'N/A',
            amount: amount,
            liters: Math.round(amount / 280),
            fuelType: 'Petrol',
            receiptNo: 'INF-' + Date.now().toString().slice(-4),
          });
          break;
        }

        case 'UPDATE_TANK_FUEL': {
          const targetTank =
            tanks.find((t) => t.tankName.toLowerCase().includes(p.tankName?.toLowerCase() || '')) || tanks[0];
          if (targetTank) {
            const change = Number(p.changeLiters) || 0;
            const updatedFuel = Math.max(0, Math.min(targetTank.capacity, targetTank.currentFuel + change));
            updateTank({ ...targetTank, currentFuel: updatedFuel });
          }
          break;
        }

        case 'MARK_ATTENDANCE': {
          const targetWorker = workers.find((w) =>
            w.name.toLowerCase().includes(p.workerName?.toLowerCase() || '')
          );
          if (targetWorker) {
            markAttendance(targetWorker.id, (p.status || 'Present') as any, dateStr);
          }
          break;
        }

        case 'ADD_SALARY_ADVANCE': {
          const targetWorker = workers.find((w) =>
            w.name.toLowerCase().includes(p.workerName?.toLowerCase() || '')
          );
          if (targetWorker) {
            addSalaryAdvance(targetWorker.id, amount, p.notes || 'Added via Bahu AI');
          }
          break;
        }

        case 'PAY_SALARY': {
          const targetWorker = workers.find((w) =>
            w.name.toLowerCase().includes(p.workerName?.toLowerCase() || '')
          );
          if (targetWorker) {
            paySalary(targetWorker.id, amount);
          }
          break;
        }

        case 'ADD_BANK_TRANSACTION': {
          const targetBank =
            bankAccounts.find((b) => b.bankName.toLowerCase().includes(p.bankName?.toLowerCase() || '')) ||
            bankAccounts[0];
          if (targetBank) {
            addBankTransaction({
              bankId: targetBank.id,
              bankName: targetBank.bankName,
              type: (p.type || 'Deposit') as any,
              amount: amount,
              referenceNumber: `AI-REF-${Date.now().toString().slice(-4)}`,
              date: dateStr,
            });
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Failed to execute AI database action:', err);
    }
  };

  // Helper to compile live database snapshot
  const prepareDatabaseSnapshot = () => {
    const fuelRevenue = (dailySalesEntries || []).reduce((acc, curr) => acc + (curr.totalSales || 0), 0);
    const lubricantRevenue = (lubricants || []).reduce(
      (acc, curr) => acc + (curr.stockIn - curr.remainingStock) * curr.sellingPrice,
      0
    );
    const carWashRevenue = (carWashServices || []).reduce((acc, curr) => acc + curr.serviceFee, 0);
    const tyreShopRevenue = (tyreShopServices || []).reduce((acc, curr) => acc + curr.serviceCost, 0);
    const tuckShopRevenue = (tuckShopItems || []).reduce((acc, curr) => acc + curr.stockQty * curr.salePrice, 0);
    const restaurantRevenue = (restaurantSales || []).reduce((acc, curr) => acc + curr.netAmount, 0);
    const rentalRevenue = (rentalAgreements || []).reduce((acc, curr) => acc + curr.amountPaid, 0);

    const totalIncome =
      fuelRevenue +
      lubricantRevenue +
      carWashRevenue +
      tyreShopRevenue +
      tuckShopRevenue +
      restaurantRevenue +
      rentalRevenue;

    const regularExpenses = (expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
    const salaryExpensesPaid = (salaries || []).reduce((acc, curr) => acc + curr.salaryPaid, 0);
    const totalExpenses = regularExpenses + salaryExpensesPaid;

    const expenseCategories: Record<string, number> = {};
    (expenses || []).forEach((e) => {
      const cat = e.category || 'Other';
      expenseCategories[cat] = (expenseCategories[cat] || 0) + e.amount;
    });

    const totalBankBalance = (bankAccounts || []).reduce((acc, curr) => acc + curr.currentBalance, 0);
    const cashInRegister = cashRegister?.cashBalance || 0;

    const fuelByTypes = {
      'Super Petrol': {
        stockLiters: tanks.filter(t => t.fuelType === 'Super Petrol' || (t.fuelType as string) === 'Petrol').reduce((a, b) => a + b.currentFuel, 0),
        deliveriesLiters: deliveries.filter(d => d.fuelType === 'Super Petrol' || (d.fuelType as string) === 'Petrol').reduce((a, b) => a + (b.totalLitersReceived || b.petrolLiters || 0), 0),
        deliveriesCost: deliveries.filter(d => d.fuelType === 'Super Petrol' || (d.fuelType as string) === 'Petrol').reduce((a, b) => a + (b.totalPurchaseAmount || 0), 0),
      },
      'High-Speed Diesel (HSD)': {
        stockLiters: tanks.filter(t => t.fuelType === 'High-Speed Diesel (HSD)' || (t.fuelType as string) === 'Diesel').reduce((a, b) => a + b.currentFuel, 0),
        deliveriesLiters: deliveries.filter(d => d.fuelType === 'High-Speed Diesel (HSD)' || (d.fuelType as string) === 'Diesel').reduce((a, b) => a + (b.totalLitersReceived || b.dieselLiters || 0), 0),
        deliveriesCost: deliveries.filter(d => d.fuelType === 'High-Speed Diesel (HSD)' || (d.fuelType as string) === 'Diesel').reduce((a, b) => a + (b.totalPurchaseAmount || 0), 0),
      },
      'Excellium High-Octane': {
        stockLiters: tanks.filter(t => t.fuelType === 'Excellium High-Octane').reduce((a, b) => a + b.currentFuel, 0),
        deliveriesLiters: deliveries.filter(d => d.fuelType === 'Excellium High-Octane').reduce((a, b) => a + (b.totalLitersReceived || 0), 0),
        deliveriesCost: deliveries.filter(d => d.fuelType === 'Excellium High-Octane').reduce((a, b) => a + (b.totalPurchaseAmount || 0), 0),
      }
    };

    return {
      summary: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        cashInRegister,
        totalBankBalance,
      },
      fuelBreakdownByFuelType: fuelByTypes,
      tanks: (tanks || []).map((t) => ({
        tankName: t.tankName,
        fuelType: t.fuelType,
        capacity: t.capacity,
        openingStock: t.openingStock,
        totalFuelDelivered: t.totalFuelDelivered || 0,
        totalFuelSold: t.totalFuelSold || 0,
        currentFuel: t.currentFuel,
        ullageRemainingSpace: Math.max(0, t.capacity - t.currentFuel),
      })),
      deliveries: (deliveries || []).slice(-10),
      dailySalesEntries: (dailySalesEntries || []).slice(-15),
      fuelSalesSummary: {
        totalFuelSalesEntries: (fuelSales || []).length,
        totalLitersSold: (fuelSales || []).reduce((a, b) => a + b.quantityLiters, 0),
        totalFuelSalesRevenue: (fuelSales || []).reduce((a, b) => a + b.totalSaleAmount, 0),
        superPetrolSoldLiters: (fuelSales || []).filter(s => s.fuelType === 'Super Petrol').reduce((a, b) => a + b.quantityLiters, 0),
        hsdSoldLiters: (fuelSales || []).filter(s => s.fuelType === 'High-Speed Diesel (HSD)').reduce((a, b) => a + b.quantityLiters, 0),
        highOctaneSoldLiters: (fuelSales || []).filter(s => s.fuelType === 'Excellium High-Octane').reduce((a, b) => a + b.quantityLiters, 0),
      },
      recentFuelSales: (fuelSales || []).slice(-15),
      lubricants: (lubricants || []).map((l) => ({
        productName: l.productName,
        category: l.category,
        remainingStock: l.remainingStock,
        salePrice: l.sellingPrice,
      })),
      workers: (workers || []).map((w) => {
        const sal = (salaries || []).find((s) => s.workerId === w.id);
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
      bankAccounts: (bankAccounts || []).map((b) => ({
        bankName: b.bankName,
        accountNumber: b.accountNumber,
        balance: b.currentBalance,
      })),
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

  const handleSendQuery = async () => {
    const promptToSend = inputQuery.trim();
    if (!promptToSend || isLoading) return;

    if (!isAdmin) {
      alert('Security Notice: Only Admin can access Bahu AI Assistant.');
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const dataSnapshot = prepareDatabaseSnapshot();

      const response = await fetch('/api/bahu-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          history: messages.map((m) => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text })),
          dataContext: dataSnapshot,
          currentUserRole: currentUser?.role || 'ADMIN',
        }),
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        throw new Error(resData.error || 'Failed to get AI response.');
      }

      // Execute DB action if present
      if (resData.action) {
        executeDatabaseAction(resData.action);
      }

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: resData.text || 'Done.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Error: ${err.message || 'Could not communicate with AI server.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
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
    <div className="max-w-4xl mx-auto space-y-4 pb-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-blue-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-md border border-red-400/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white">Bahu AI Assistant</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> Live DB
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Clear chat history?')) {
              setMessages([messages[0]]);
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
          title="Reset Chat"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400" /> Reset
        </button>
      </div>

      {/* Clean Chat Window */}
      <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm h-[620px] overflow-hidden">
        {/* Messages Container */}
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

                <div className="space-y-1 max-w-[85%] sm:max-w-[75%]">
                  <div
                    className={`flex items-center gap-2 text-[10px] text-slate-400 font-semibold ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{isUser ? 'Admin' : 'Bahu AI'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm relative group ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none font-semibold'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="prose prose-xs max-w-none text-slate-800 font-sans leading-relaxed">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}

                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.text, msg.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                        title="Copy"
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
              <div className="p-3.5 rounded-2xl rounded-tl-none bg-white border border-slate-200 text-slate-600 text-xs flex items-center gap-2 shadow-sm font-semibold">
                <RefreshCw className="w-4 h-4 text-red-600 animate-spin" />
                <span>Processing...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar with Text, Send and Voice Microphone Buttons */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2">
          {voiceError && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
              <span>⚠️ {voiceError}</span>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                className="text-amber-700 hover:text-amber-950 underline font-bold text-[11px] ml-2 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
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
              placeholder={isListening ? 'Listening... Speak now' : 'Ask question or speak command...'}
              className={`flex-1 px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all outline-none ${
                isListening
                  ? 'bg-red-50 border-red-400 text-red-900 placeholder-red-400 ring-2 ring-red-300 animate-pulse'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:bg-white'
              }`}
              disabled={isLoading}
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={isLoading}
              className={`p-3 rounded-xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white border-red-700 animate-bounce shadow-md ring-2 ring-red-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
              title={isListening ? 'Stop Listening' : 'Voice Input (English, Urdu, Roman Urdu)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-red-600" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer shrink-0"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
