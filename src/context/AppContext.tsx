import React, { createContext, useContext, useState, useEffect } from 'react';
import { testFirestoreConnection } from '../lib/firebase';
import {
  User,
  FuelDelivery,
  Tank,
  LubricantProduct,
  Worker,
  AttendanceRecord,
  SalaryRecord,
  UdhaarCustomer,
  ExpenseCategory,
  Expense,
  BankAccount,
  BankTransaction,
  CashRegister,
  CreditCardTransaction,
  InfiniCardTransaction,
  ShopModuleData,
  RentalAgreement,
  AppNotification,
  SyncStatus,
  UserRole,
  TyreShopService,
  CarWashService,
  TuckShopItem,
  RestaurantSale,
  RestaurantExpense,
  RestaurantStaff,
  RestaurantAttendance,
  RestaurantSalaryRecord,
  RestaurantSupplier,
  RestaurantKitchenInventory,
  RestaurantPurchase,
  RestaurantDeposit,
  DailySalesEntry,
} from '../types';
import {
  initialUsers,
  initialTanks,
  initialDeliveries,
  initialLubricants,
  initialWorkers,
  initialAttendance,
  initialSalaries,
  initialUdhaarCustomers,
  initialCategories,
  initialExpenses,
  initialBankAccounts,
  initialBankTransactions,
  initialCashRegister,
  initialCreditCardSales,
  initialInfiniCardSales,
  initialShops,
  initialRentalAgreements,
  initialNotifications,
  initialTyreServices,
  initialCarWashServices,
  initialTuckShopItems,
  initialRestaurantSales,
  initialRestaurantExpenses,
  initialRestaurantStaff,
  initialRestaurantAttendance,
  initialRestaurantSalaries,
  initialRestaurantSuppliers,
  initialRestaurantInventory,
  initialRestaurantPurchases,
  initialRestaurantDeposits,
  initialDailySalesEntries,
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  users: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  syncStatus: SyncStatus;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Collections
  tanks: Tank[];
  deliveries: FuelDelivery[];
  lubricants: LubricantProduct[];
  workers: Worker[];
  attendance: AttendanceRecord[];
  salaries: SalaryRecord[];
  udhaarCustomers: UdhaarCustomer[];
  categories: ExpenseCategory[];
  expenses: Expense[];
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  cashRegister: CashRegister;
  creditCardSales: CreditCardTransaction[];
  infiniCardSales: InfiniCardTransaction[];
  shops: ShopModuleData[];
  rentalAgreements: RentalAgreement[];
  notifications: AppNotification[];

  // Sub-business items
  tyreShopServices: TyreShopService[];
  carWashServices: CarWashService[];
  tuckShopItems: TuckShopItem[];

  // Restaurant Collections
  restaurantSales: RestaurantSale[];
  restaurantExpenses: RestaurantExpense[];
  restaurantStaff: RestaurantStaff[];
  restaurantAttendance: RestaurantAttendance[];
  restaurantSalaries: RestaurantSalaryRecord[];
  restaurantSuppliers: RestaurantSupplier[];
  restaurantInventory: RestaurantKitchenInventory[];
  restaurantPurchases: RestaurantPurchase[];
  restaurantDeposits: RestaurantDeposit[];

  // Daily Sales Entry Collection
  dailySalesEntries: DailySalesEntry[];
  addDailySalesEntry: (data: Omit<DailySalesEntry, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateDailySalesEntry: (id: string, updated: Partial<DailySalesEntry>) => void;
  deleteDailySalesEntry: (id: string) => void;

  // Permissions helpers
  isAdmin: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;

  // Actions
  login: (identifier: string, pass: string, role?: UserRole) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateAdminProfile: (data: { name: string; email: string; phonePrimary: string; phoneSecondary: string; password?: string }) => void;
  createEmployee: (data: { name: string; password?: string }) => void;
  resetEmployeePassword: (id: string, newPass: string) => void;
  toggleEmployeeStatus: (id: string) => void;
  deleteEmployee: (id: string) => void;

  addDelivery: (data: Omit<FuelDelivery, 'id' | 'createdAt' | 'createdBy'>) => void;
  deleteDelivery: (id: string) => void;
  addTank: (data: Omit<Tank, 'id'>) => void;
  updateTank: (tank: Tank) => void;
  deleteTank: (id: string) => void;
  addLubricant: (data: Omit<LubricantProduct, 'id'>) => void;
  updateLubricant: (lub: LubricantProduct) => void;
  adjustLubricantStock: (id: string, qty: number, type: 'IN' | 'OUT') => void;
  deleteLubricant: (id: string) => void;
  addWorker: (data: Omit<Worker, 'id'>) => void;
  updateWorker: (worker: Worker) => void;
  deleteWorker: (id: string) => void;
  markAttendance: (workerId: string, status: AttendanceRecord['status'], date: string, notes?: string) => void;
  addSalaryAdvance: (workerId: string, amount: number, notes?: string) => void;
  paySalary: (workerId: string, amount: number) => void;
  addUdhaarCustomer: (data: Omit<UdhaarCustomer, 'id' | 'remainingBalance' | 'transactions'>) => void;
  addUdhaarTransaction: (
    customerId: string,
    type: 'CREDIT_PURCHASE' | 'PAYMENT_RECEIVED',
    amount: number,
    description: string,
    vehicleNumber?: string
  ) => void;
  addExpenseCategory: (name: string) => void;
  addExpense: (data: Omit<Expense, 'id' | 'createdBy'>) => void;
  deleteExpense: (id: string) => void;
  addBankAccount: (data: Omit<BankAccount, 'id' | 'currentBalance'>) => void;
  addBankTransaction: (data: Omit<BankTransaction, 'id' | 'createdBy'>) => void;
  updateCashRegister: (data: Partial<CashRegister>) => void;
  addCreditCardSale: (data: Omit<CreditCardTransaction, 'id'>) => void;
  addInfiniCardSale: (data: Omit<InfiniCardTransaction, 'id'>) => void;
  updateShopData: (data: ShopModuleData) => void;
  addRentalAgreement: (data: Omit<RentalAgreement, 'id' | 'amountPaid' | 'pendingAmount' | 'status' | 'paymentHistory'>) => void;
  receiveRentPayment: (rentalId: string, amount: number, monthPaidFor: string, receiptNo: string) => void;

  // Sub-business actions
  addTyreShopService: (data: Omit<TyreShopService, 'id'>) => void;
  deleteTyreShopService: (id: string) => void;
  addCarWashService: (data: Omit<CarWashService, 'id'>) => void;
  deleteCarWashService: (id: string) => void;
  addTuckShopItem: (data: Omit<TuckShopItem, 'id'>) => void;
  deleteTuckShopItem: (id: string) => void;

  // Restaurant Actions
  addRestaurantSale: (data: Omit<RestaurantSale, 'id' | 'createdBy'>) => void;
  deleteRestaurantSale: (id: string) => void;
  addRestaurantExpense: (data: Omit<RestaurantExpense, 'id' | 'createdBy'>) => void;
  deleteRestaurantExpense: (id: string) => void;
  addRestaurantStaff: (data: Omit<RestaurantStaff, 'id'>) => void;
  updateRestaurantStaff: (staff: RestaurantStaff) => void;
  deleteRestaurantStaff: (id: string) => void;
  markRestaurantAttendance: (staffId: string, staffName: string, status: RestaurantAttendance['status'], date: string, notes?: string) => void;
  payRestaurantSalary: (staffId: string, staffName: string, amountPaid: number, advanceDeducted: number, notes?: string) => void;
  addRestaurantSupplier: (data: Omit<RestaurantSupplier, 'id'>) => void;
  deleteRestaurantSupplier: (id: string) => void;
  addRestaurantInventory: (data: Omit<RestaurantKitchenInventory, 'id' | 'lastUpdated'>) => void;
  updateRestaurantInventory: (inv: RestaurantKitchenInventory) => void;
  deleteRestaurantInventory: (id: string) => void;
  addRestaurantPurchase: (data: Omit<RestaurantPurchase, 'id'>) => void;
  addRestaurantDeposit: (data: Omit<RestaurantDeposit, 'id'>) => void;

  // Misc
  addUser: (data: Omit<User, 'id' | 'createdAt'>) => void;
  updateUserStatus: (userId: string, active: boolean) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => boolean;
  resetDatabaseToDefault: () => void;
  triggerManualSync: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'BAHU_PETROLEUM_ENTERPRISE_DB_V2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_currentUser`);
      return stored ? JSON.parse(stored) : initialUsers[0];
    } catch {
      return initialUsers[0];
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    syncing: false,
  });

  function loadLocal<T>(key: string, fallback: T): T {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${key}`);
      if (!stored || stored === 'undefined' || stored === 'null') return fallback;
      const parsed = JSON.parse(stored);
      if (parsed === null || parsed === undefined) return fallback;
      if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
      return parsed;
    } catch {
      return fallback;
    }
  }

  // State initialization
  const [users, setUsers] = useState<User[]>(() => loadLocal('users', initialUsers) || []);
  const [tanks, setTanks] = useState<Tank[]>(() => loadLocal('tanks', initialTanks) || []);
  const [deliveries, setDeliveries] = useState<FuelDelivery[]>(() => loadLocal('deliveries', initialDeliveries) || []);
  const [lubricants, setLubricants] = useState<LubricantProduct[]>(() => loadLocal('lubricants', initialLubricants) || []);
  const [workers, setWorkers] = useState<Worker[]>(() => loadLocal('workers', initialWorkers) || []);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadLocal('attendance', initialAttendance) || []);
  const [salaries, setSalaries] = useState<SalaryRecord[]>(() => loadLocal('salaries', initialSalaries) || []);
  const [udhaarCustomers, setUdhaarCustomers] = useState<UdhaarCustomer[]>(() => loadLocal('udhaarCustomers', initialUdhaarCustomers) || []);
  const [categories, setCategories] = useState<ExpenseCategory[]>(() => loadLocal('categories', initialCategories) || []);
  const [expenses, setExpenses] = useState<Expense[]>(() => loadLocal('expenses', initialExpenses) || []);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => loadLocal('bankAccounts', initialBankAccounts) || []);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => loadLocal('bankTransactions', initialBankTransactions) || []);
  const [cashRegister, setCashRegister] = useState<CashRegister>(() => loadLocal('cashRegister', initialCashRegister) || initialCashRegister);
  const [creditCardSales, setCreditCardSales] = useState<CreditCardTransaction[]>(() => loadLocal('creditCardSales', initialCreditCardSales) || []);
  const [infiniCardSales, setInfiniCardSales] = useState<InfiniCardTransaction[]>(() => loadLocal('infiniCardSales', initialInfiniCardSales) || []);
  const [shops, setShops] = useState<ShopModuleData[]>(() => loadLocal('shops', initialShops) || []);
  const [rentalAgreements, setRentalAgreements] = useState<RentalAgreement[]>(() => loadLocal('rentalAgreements', initialRentalAgreements) || []);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadLocal('notifications', initialNotifications) || []);

  // Sub-business collections
  const [tyreShopServices, setTyreShopServices] = useState<TyreShopService[]>(() => loadLocal('tyreShopServices', initialTyreServices) || []);
  const [carWashServices, setCarWashServices] = useState<CarWashService[]>(() => loadLocal('carWashServices', initialCarWashServices) || []);
  const [tuckShopItems, setTuckShopItems] = useState<TuckShopItem[]>(() => loadLocal('tuckShopItems', initialTuckShopItems) || []);

  // Restaurant state collections
  const [restaurantSales, setRestaurantSales] = useState<RestaurantSale[]>(() => loadLocal('restaurantSales', initialRestaurantSales) || []);
  const [restaurantExpenses, setRestaurantExpenses] = useState<RestaurantExpense[]>(() => loadLocal('restaurantExpenses', initialRestaurantExpenses) || []);
  const [restaurantStaff, setRestaurantStaff] = useState<RestaurantStaff[]>(() => loadLocal('restaurantStaff', initialRestaurantStaff) || []);
  const [restaurantAttendance, setRestaurantAttendance] = useState<RestaurantAttendance[]>(() => loadLocal('restaurantAttendance', initialRestaurantAttendance) || []);
  const [restaurantSalaries, setRestaurantSalaries] = useState<RestaurantSalaryRecord[]>(() => loadLocal('restaurantSalaries', initialRestaurantSalaries) || []);
  const [restaurantSuppliers, setRestaurantSuppliers] = useState<RestaurantSupplier[]>(() => loadLocal('restaurantSuppliers', initialRestaurantSuppliers) || []);
  const [restaurantInventory, setRestaurantInventory] = useState<RestaurantKitchenInventory[]>(() => loadLocal('restaurantInventory', initialRestaurantInventory) || []);
  const [restaurantPurchases, setRestaurantPurchases] = useState<RestaurantPurchase[]>(() => loadLocal('restaurantPurchases', initialRestaurantPurchases) || []);
  const [restaurantDeposits, setRestaurantDeposits] = useState<RestaurantDeposit[]>(() => loadLocal('restaurantDeposits', initialRestaurantDeposits) || []);

  const [dailySalesEntries, setDailySalesEntries] = useState<DailySalesEntry[]>(() => loadLocal('dailySalesEntries', initialDailySalesEntries) || []);

  function saveLocal<T>(key: string, value: T) {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }

  // Sync to local storage
  useEffect(() => saveLocal('currentUser', currentUser), [currentUser]);
  useEffect(() => saveLocal('users', users), [users]);
  useEffect(() => saveLocal('tanks', tanks), [tanks]);
  useEffect(() => saveLocal('deliveries', deliveries), [deliveries]);
  useEffect(() => saveLocal('lubricants', lubricants), [lubricants]);
  useEffect(() => saveLocal('workers', workers), [workers]);
  useEffect(() => saveLocal('attendance', attendance), [attendance]);
  useEffect(() => saveLocal('salaries', salaries), [salaries]);
  useEffect(() => saveLocal('udhaarCustomers', udhaarCustomers), [udhaarCustomers]);
  useEffect(() => saveLocal('expenses', expenses), [expenses]);
  useEffect(() => saveLocal('bankAccounts', bankAccounts), [bankAccounts]);
  useEffect(() => saveLocal('bankTransactions', bankTransactions), [bankTransactions]);
  useEffect(() => saveLocal('cashRegister', cashRegister), [cashRegister]);
  useEffect(() => saveLocal('creditCardSales', creditCardSales), [creditCardSales]);
  useEffect(() => saveLocal('infiniCardSales', infiniCardSales), [infiniCardSales]);
  useEffect(() => saveLocal('shops', shops), [shops]);
  useEffect(() => saveLocal('rentalAgreements', rentalAgreements), [rentalAgreements]);
  useEffect(() => saveLocal('notifications', notifications), [notifications]);

  useEffect(() => saveLocal('tyreShopServices', tyreShopServices), [tyreShopServices]);
  useEffect(() => saveLocal('carWashServices', carWashServices), [carWashServices]);
  useEffect(() => saveLocal('tuckShopItems', tuckShopItems), [tuckShopItems]);

  useEffect(() => saveLocal('restaurantSales', restaurantSales), [restaurantSales]);
  useEffect(() => saveLocal('restaurantExpenses', restaurantExpenses), [restaurantExpenses]);
  useEffect(() => saveLocal('restaurantStaff', restaurantStaff), [restaurantStaff]);
  useEffect(() => saveLocal('restaurantAttendance', restaurantAttendance), [restaurantAttendance]);
  useEffect(() => saveLocal('restaurantSalaries', restaurantSalaries), [restaurantSalaries]);
  useEffect(() => saveLocal('restaurantSuppliers', restaurantSuppliers), [restaurantSuppliers]);
  useEffect(() => saveLocal('restaurantInventory', restaurantInventory), [restaurantInventory]);
  useEffect(() => saveLocal('dailySalesEntries', dailySalesEntries), [dailySalesEntries]);
  useEffect(() => saveLocal('restaurantPurchases', restaurantPurchases), [restaurantPurchases]);
  useEffect(() => saveLocal('restaurantDeposits', restaurantDeposits), [restaurantDeposits]);

  // Sync activeTab with currentView for navigation
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    setCurrentView(tab);
  };

  const handleSetCurrentView = (view: string) => {
    setCurrentView(view);
    setActiveTab(view);
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const canEdit = isAdmin;
  const canDelete = isAdmin;
  const canManageUsers = isAdmin;
  const isLoggedIn = currentUser !== null;

  // Authentication Logic
  const login = (identifier: string, pass: string, role?: UserRole): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    
    // Find matching user in users array
    const matched = users.find(u => {
      if (!u.active) return false;
      if (role && u.role !== role) return false;

      if (u.role === 'ADMIN') {
        // Admin can match email, primary phone, secondary phone, or name
        return (
          u.email.toLowerCase() === cleanId ||
          (u.phonePrimary && u.phonePrimary.replace(/[- ]/g, '') === cleanId.replace(/[- ]/g, '')) ||
          (u.phoneSecondary && u.phoneSecondary.replace(/[- ]/g, '') === cleanId.replace(/[- ]/g, '')) ||
          u.name.toLowerCase() === cleanId
        );
      } else {
        // Employee matches Employee Name
        return u.name.toLowerCase() === cleanId;
      }
    });

    if (matched) {
      if (matched.password && matched.password !== pass) {
        return false;
      }
      setCurrentUser(matched);
      return true;
    }

    // Default Fallback matching for CEO Admin or Employee
    if (cleanId === '03009654471' || cleanId === '03129654471' || cleanId === 'admin') {
      setCurrentUser(initialUsers[0]);
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRole = (role: UserRole) => {
    const matched = users.find(u => u.role === role);
    if (matched) {
      setCurrentUser(matched);
    } else {
      setCurrentUser(role === 'ADMIN' ? initialUsers[0] : { id: 'u-emp-1', name: 'Employee', email: '', role: 'EMPLOYEE', active: true, createdAt: new Date().toISOString() });
    }
  };

  // Admin Profile Update
  const updateAdminProfile = (data: { name: string; email: string; phonePrimary: string; phoneSecondary: string; password?: string }) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.role === 'ADMIN') {
          return {
            ...u,
            name: data.name,
            email: data.email,
            phonePrimary: data.phonePrimary,
            phoneSecondary: data.phoneSecondary,
            password: data.password || u.password,
          };
        }
        return u;
      })
    );
    if (currentUser?.role === 'ADMIN') {
      setCurrentUser(prev => prev ? {
        ...prev,
        name: data.name,
        email: data.email,
        phonePrimary: data.phonePrimary,
        phoneSecondary: data.phoneSecondary,
        password: data.password || prev.password,
      } : null);
    }
  };

  // Employee Management
  const createEmployee = (data: { name: string; password?: string }) => {
    const newEmp: User = {
      id: `u-emp-${Date.now()}`,
      name: data.name,
      email: '',
      password: data.password || '123456',
      role: 'EMPLOYEE',
      active: true,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newEmp]);
  };

  const resetEmployeePassword = (id: string, newPass: string) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, password: newPass } : u)));
  };

  const toggleEmployeeStatus = (id: string) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const deleteEmployee = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Fuel Delivery Action (with Dip Measurement Verification)
  const addDelivery = (data: Omit<FuelDelivery, 'id' | 'createdAt' | 'createdBy'>) => {
    const newDelivery: FuelDelivery = {
      ...data,
      id: `del-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'System',
    };

    setDeliveries(prev => [newDelivery, ...prev]);

    // Update target tank current stock
    if (data.tankId) {
      setTanks(prevTanks =>
        prevTanks.map(t => {
          if (t.id === data.tankId) {
            const added = data.totalLitersReceived;
            const newFuel = t.currentFuel + added;
            return {
              ...t,
              currentFuel: newFuel,
              closingStock: newFuel,
            };
          }
          return t;
        })
      );
    }
  };

  const deleteDelivery = (id: string) => {
    if (!canDelete) return;
    setDeliveries(prev => prev.filter(d => d.id !== id));
  };

  const addTank = (data: Omit<Tank, 'id'>) => {
    setTanks(prev => [...prev, { ...data, id: `tank-${Date.now()}` }]);
  };

  const updateTank = (tank: Tank) => {
    if (!canEdit) return;
    setTanks(prev => prev.map(t => (t.id === tank.id ? tank : t)));
  };

  const deleteTank = (id: string) => {
    if (!canDelete) return;
    setTanks(prev => prev.filter(t => t.id !== id));
  };

  // Lubricants
  const addLubricant = (data: Omit<LubricantProduct, 'id'>) => {
    setLubricants(prev => [...prev, { ...data, id: `lub-${Date.now()}` }]);
  };

  const updateLubricant = (lub: LubricantProduct) => {
    if (!canEdit) return;
    setLubricants(prev => prev.map(l => (l.id === lub.id ? lub : l)));
  };

  const adjustLubricantStock = (id: string, qty: number, type: 'IN' | 'OUT') => {
    setLubricants(prev =>
      prev.map(l => {
        if (l.id === id) {
          const newStockIn = type === 'IN' ? l.stockIn + qty : l.stockIn;
          const newStockOut = type === 'OUT' ? l.stockOut + qty : l.stockOut;
          const remaining = Math.max(0, newStockIn - newStockOut);
          return { ...l, stockIn: newStockIn, stockOut: newStockOut, remainingStock: remaining };
        }
        return l;
      })
    );
  };

  const deleteLubricant = (id: string) => {
    if (!canDelete) return;
    setLubricants(prev => prev.filter(l => l.id !== id));
  };

  // Workers
  const addWorker = (data: Omit<Worker, 'id'>) => {
    const newId = `w-${Date.now()}`;
    setWorkers(prev => [...prev, { ...data, id: newId }]);
    setSalaries(prev => [
      ...prev,
      {
        id: `sal-${Date.now()}`,
        workerId: newId,
        monthlySalary: data.monthlySalary || 0,
        totalAdvance: 0,
        advanceHistory: [],
        salaryPaid: 0,
        pendingSalary: data.monthlySalary || 0,
        remainingSalary: data.monthlySalary || 0,
      },
    ]);
  };

  const updateWorker = (worker: Worker) => {
    if (!canEdit) return;
    setWorkers(prev => prev.map(w => (w.id === worker.id ? worker : w)));
  };

  const deleteWorker = (id: string) => {
    if (!canDelete) return;
    setWorkers(prev => prev.filter(w => w.id !== id));
  };

  const markAttendance = (workerId: string, status: AttendanceRecord['status'], date: string, notes?: string) => {
    setAttendance(prev => {
      const existing = prev.find(a => a.workerId === workerId && a.date === date);
      if (existing) {
        return prev.map(a => (a.id === existing.id ? { ...a, status, notes } : a));
      }
      return [...prev, { id: `att-${Date.now()}`, workerId, date, status, notes }];
    });
  };

  const addSalaryAdvance = (workerId: string, amount: number, notes?: string) => {
    setSalaries(prev =>
      prev.map(s => {
        if (s.workerId === workerId) {
          const newAdvanceHistory = [
            ...s.advanceHistory,
            { id: `adv-${Date.now()}`, date: new Date().toISOString().slice(0, 10), amount, notes },
          ];
          const newTotalAdvance = s.totalAdvance + amount;
          const remaining = Math.max(0, s.monthlySalary - newTotalAdvance - s.salaryPaid);
          return {
            ...s,
            totalAdvance: newTotalAdvance,
            advanceHistory: newAdvanceHistory,
            remainingSalary: remaining,
            pendingSalary: remaining,
          };
        }
        return s;
      })
    );
  };

  const paySalary = (workerId: string, amount: number) => {
    setSalaries(prev =>
      prev.map(s => {
        if (s.workerId === workerId) {
          const paid = s.salaryPaid + amount;
          const remaining = Math.max(0, s.monthlySalary - s.totalAdvance - paid);
          return {
            ...s,
            salaryPaid: paid,
            remainingSalary: remaining,
            pendingSalary: remaining,
            lastPaymentDate: new Date().toISOString().slice(0, 10),
          };
        }
        return s;
      })
    );
  };

  // Udhaar Customers
  const addUdhaarCustomer = (data: Omit<UdhaarCustomer, 'id' | 'remainingBalance' | 'transactions'>) => {
    setUdhaarCustomers(prev => [
      ...prev,
      {
        ...data,
        id: `udh-${Date.now()}`,
        remainingBalance: (data.totalCredit || 0) - (data.paymentReceived || 0),
        transactions: [],
      },
    ]);
  };

  const addUdhaarTransaction = (
    customerId: string,
    type: 'CREDIT_PURCHASE' | 'PAYMENT_RECEIVED',
    amount: number,
    description: string,
    vehicleNumber?: string
  ) => {
    setUdhaarCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          const newTx = {
            id: `ut-${Date.now()}`,
            date: new Date().toISOString().slice(0, 10),
            type,
            amount,
            description,
            vehicleNumber,
          };
          const totalCredit = type === 'CREDIT_PURCHASE' ? c.totalCredit + amount : c.totalCredit;
          const paymentReceived = type === 'PAYMENT_RECEIVED' ? c.paymentReceived + amount : c.paymentReceived;
          const remaining = totalCredit - paymentReceived;
          return {
            ...c,
            totalCredit,
            paymentReceived,
            remainingBalance: remaining,
            transactions: [newTx, ...c.transactions],
          };
        }
        return c;
      })
    );
  };

  // Expenses
  const addExpenseCategory = (name: string) => {
    if (!name.trim()) return;
    setCategories(prev => [...prev, { id: `cat-${Date.now()}`, name: name.trim(), isCustom: true }]);
  };

  const addExpense = (data: Omit<Expense, 'id' | 'createdBy'>) => {
    setExpenses(prev => [{ ...data, id: `exp-${Date.now()}`, createdBy: currentUser?.name || 'System' }, ...prev]);
  };

  const deleteExpense = (id: string) => {
    if (!canDelete) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Bank
  const addBankAccount = (data: Omit<BankAccount, 'id' | 'currentBalance'>) => {
    setBankAccounts(prev => [...prev, { ...data, id: `bank-${Date.now()}`, currentBalance: 0 }]);
  };

  const addBankTransaction = (data: Omit<BankTransaction, 'id' | 'createdBy'>) => {
    setBankTransactions(prev => [{ ...data, id: `bt-${Date.now()}`, createdBy: currentUser?.name || 'System' }, ...prev]);
    setBankAccounts(prev =>
      prev.map(b => {
        if (b.id === data.bankId) {
          const change = data.type === 'Deposit' ? data.amount : -data.amount;
          return { ...b, currentBalance: b.currentBalance + change };
        }
        return b;
      })
    );
  };

  const updateCashRegister = (data: Partial<CashRegister>) => {
    setCashRegister(prev => ({ ...prev, ...data }));
  };

  const addCreditCardSale = (data: Omit<CreditCardTransaction, 'id'>) => {
    setCreditCardSales(prev => [{ ...data, id: `cc-${Date.now()}` }, ...prev]);
  };

  const addInfiniCardSale = (data: Omit<InfiniCardTransaction, 'id'>) => {
    setInfiniCardSales(prev => [{ ...data, id: `inf-${Date.now()}` }, ...prev]);
  };

  const updateShopData = (data: ShopModuleData) => {
    setShops(prev => prev.map(s => (s.id === data.id ? data : s)));
  };

  const addRentalAgreement = (
    data: Omit<RentalAgreement, 'id' | 'amountPaid' | 'pendingAmount' | 'status' | 'paymentHistory'>
  ) => {
    setRentalAgreements(prev => [
      ...prev,
      {
        ...data,
        id: `rent-${Date.now()}`,
        amountPaid: 0,
        pendingAmount: data.monthlyRent || 0,
        status: 'Pending',
        paymentHistory: [],
      },
    ]);
  };

  const receiveRentPayment = (rentalId: string, amount: number, monthPaidFor: string, receiptNo: string) => {
    setRentalAgreements(prev =>
      prev.map(r => {
        if (r.id === rentalId) {
          const newPaid = r.amountPaid + amount;
          const pending = Math.max(0, r.monthlyRent - newPaid);
          return {
            ...r,
            amountPaid: newPaid,
            pendingAmount: pending,
            status: pending === 0 ? 'Paid' : 'Pending',
            paymentHistory: [
              {
                id: `rph-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                amount,
                monthPaidFor,
                receiptNo,
              },
              ...r.paymentHistory,
            ],
          };
        }
        return r;
      })
    );
  };

  // Sub-business Actions
  const addTyreShopService = (data: Omit<TyreShopService, 'id'>) => {
    setTyreShopServices(prev => [{ ...data, id: `tyre-${Date.now()}` }, ...prev]);
  };

  const deleteTyreShopService = (id: string) => {
    if (!canDelete) return;
    setTyreShopServices(prev => prev.filter(t => t.id !== id));
  };

  const addCarWashService = (data: Omit<CarWashService, 'id'>) => {
    setCarWashServices(prev => [{ ...data, id: `wash-${Date.now()}` }, ...prev]);
  };

  const deleteCarWashService = (id: string) => {
    if (!canDelete) return;
    setCarWashServices(prev => prev.filter(w => w.id !== id));
  };

  const addTuckShopItem = (data: Omit<TuckShopItem, 'id'>) => {
    setTuckShopItems(prev => [{ ...data, id: `tuck-${Date.now()}` }, ...prev]);
  };

  const deleteTuckShopItem = (id: string) => {
    if (!canDelete) return;
    setTuckShopItems(prev => prev.filter(t => t.id !== id));
  };

  // Restaurant Actions
  const addRestaurantSale = (data: Omit<RestaurantSale, 'id' | 'createdBy'>) => {
    setRestaurantSales(prev => [{ ...data, id: `rsale-${Date.now()}`, createdBy: currentUser?.name || 'System' }, ...prev]);
  };

  const deleteRestaurantSale = (id: string) => {
    if (!canDelete) return;
    setRestaurantSales(prev => prev.filter(s => s.id !== id));
  };

  const addRestaurantExpense = (data: Omit<RestaurantExpense, 'id' | 'createdBy'>) => {
    setRestaurantExpenses(prev => [{ ...data, id: `rexp-${Date.now()}`, createdBy: currentUser?.name || 'System' }, ...prev]);
  };

  const deleteRestaurantExpense = (id: string) => {
    if (!canDelete) return;
    setRestaurantExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addRestaurantStaff = (data: Omit<RestaurantStaff, 'id'>) => {
    setRestaurantStaff(prev => [...prev, { ...data, id: `rstaff-${Date.now()}` }]);
  };

  const updateRestaurantStaff = (staff: RestaurantStaff) => {
    if (!canEdit) return;
    setRestaurantStaff(prev => prev.map(s => (s.id === staff.id ? staff : s)));
  };

  const deleteRestaurantStaff = (id: string) => {
    if (!canDelete) return;
    setRestaurantStaff(prev => prev.filter(s => s.id !== id));
  };

  const markRestaurantAttendance = (
    staffId: string,
    staffName: string,
    status: RestaurantAttendance['status'],
    date: string,
    notes?: string
  ) => {
    setRestaurantAttendance(prev => {
      const existing = prev.find(a => a.staffId === staffId && a.date === date);
      if (existing) {
        return prev.map(a => (a.id === existing.id ? { ...a, status, notes } : a));
      }
      return [...prev, { id: `ratt-${Date.now()}`, staffId, staffName, date, status, notes }];
    });
  };

  const payRestaurantSalary = (
    staffId: string,
    staffName: string,
    amountPaid: number,
    advanceDeducted: number,
    notes?: string
  ) => {
    const netPaid = amountPaid - advanceDeducted;
    setRestaurantSalaries(prev => [
      ...prev,
      {
        id: `rsal-${Date.now()}`,
        staffId,
        staffName,
        date: new Date().toISOString().slice(0, 10),
        amountPaid,
        advanceDeducted,
        netPaid,
        notes,
      },
    ]);
  };

  const addRestaurantSupplier = (data: Omit<RestaurantSupplier, 'id'>) => {
    setRestaurantSuppliers(prev => [...prev, { ...data, id: `rsup-${Date.now()}` }]);
  };

  const deleteRestaurantSupplier = (id: string) => {
    if (!canDelete) return;
    setRestaurantSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const addRestaurantInventory = (data: Omit<RestaurantKitchenInventory, 'id' | 'lastUpdated'>) => {
    setRestaurantInventory(prev => [
      ...prev,
      { ...data, id: `rinv-${Date.now()}`, lastUpdated: new Date().toISOString().slice(0, 10) },
    ]);
  };

  const updateRestaurantInventory = (inv: RestaurantKitchenInventory) => {
    if (!canEdit) return;
    setRestaurantInventory(prev => prev.map(i => (i.id === inv.id ? inv : i)));
  };

  const deleteRestaurantInventory = (id: string) => {
    if (!canDelete) return;
    setRestaurantInventory(prev => prev.filter(i => i.id !== id));
  };

  const addRestaurantPurchase = (data: Omit<RestaurantPurchase, 'id'>) => {
    setRestaurantPurchases(prev => [{ ...data, id: `rpur-${Date.now()}` }, ...prev]);
  };

  const addRestaurantDeposit = (data: Omit<RestaurantDeposit, 'id'>) => {
    setRestaurantDeposits(prev => [{ ...data, id: `rdep-${Date.now()}` }, ...prev]);
  };

  // Daily Sales Entry Actions
  const addDailySalesEntry = (data: Omit<DailySalesEntry, 'id' | 'createdAt' | 'createdBy'>) => {
    const newEntry: DailySalesEntry = {
      ...data,
      id: `dse-${Date.now()}`,
      createdBy: currentUser?.name || 'Mian Rashid Saleem',
      createdAt: new Date().toISOString(),
    };
    setDailySalesEntries(prev => [newEntry, ...prev]);
  };

  const updateDailySalesEntry = (id: string, updated: Partial<DailySalesEntry>) => {
    setDailySalesEntries(prev =>
      prev.map(entry => (entry.id === id ? { ...entry, ...updated } : entry))
    );
  };

  const deleteDailySalesEntry = (id: string) => {
    if (!isAdmin) {
      alert('Only Admin users can delete daily sales entries.');
      return;
    }
    setDailySalesEntries(prev => prev.filter(entry => entry.id !== id));
  };

  // Misc
  const addUser = (data: Omit<User, 'id' | 'createdAt'>) => {
    if (!canManageUsers) return;
    setUsers(prev => [...prev, { ...data, id: `u-${Date.now()}`, createdAt: new Date().toISOString() }]);
  };

  const updateUserStatus = (userId: string, active: boolean) => {
    if (!canManageUsers) return;
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, active } : u)));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const exportDatabaseJSON = () => {
    const dbBackup = {
      app: 'Bahu Petroleum Enterprise System',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      users,
      tanks,
      deliveries,
      lubricants,
      workers,
      attendance,
      salaries,
      udhaarCustomers,
      expenses,
      bankAccounts,
      bankTransactions,
      cashRegister,
      creditCardSales,
      infiniCardSales,
      shops,
      rentalAgreements,
      notifications,
      tyreShopServices,
      carWashServices,
      tuckShopItems,
      restaurantSales,
      restaurantExpenses,
      restaurantStaff,
      restaurantAttendance,
      restaurantSalaries,
      restaurantSuppliers,
      restaurantInventory,
      restaurantPurchases,
      restaurantDeposits,
      dailySalesEntries,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dbBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bahu_petroleum_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDatabaseJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.users) setUsers(data.users);
      if (data.tanks) setTanks(data.tanks);
      if (data.deliveries) setDeliveries(data.deliveries);
      if (data.lubricants) setLubricants(data.lubricants);
      if (data.workers) setWorkers(data.workers);
      if (data.attendance) setAttendance(data.attendance);
      if (data.salaries) setSalaries(data.salaries);
      if (data.udhaarCustomers) setUdhaarCustomers(data.udhaarCustomers);
      if (data.expenses) setExpenses(data.expenses);
      if (data.bankAccounts) setBankAccounts(data.bankAccounts);
      if (data.bankTransactions) setBankTransactions(data.bankTransactions);
      if (data.cashRegister) setCashRegister(data.cashRegister);
      if (data.creditCardSales) setCreditCardSales(data.creditCardSales);
      if (data.infiniCardSales) setInfiniCardSales(data.infiniCardSales);
      if (data.shops) setShops(data.shops);
      if (data.rentalAgreements) setRentalAgreements(data.rentalAgreements);
      if (data.notifications) setNotifications(data.notifications);
      if (data.tyreShopServices) setTyreShopServices(data.tyreShopServices);
      if (data.carWashServices) setCarWashServices(data.carWashServices);
      if (data.tuckShopItems) setTuckShopItems(data.tuckShopItems);
      if (data.restaurantSales) setRestaurantSales(data.restaurantSales);
      if (data.restaurantExpenses) setRestaurantExpenses(data.restaurantExpenses);
      if (data.restaurantStaff) setRestaurantStaff(data.restaurantStaff);
      if (data.restaurantAttendance) setRestaurantAttendance(data.restaurantAttendance);
      if (data.restaurantSalaries) setRestaurantSalaries(data.restaurantSalaries);
      if (data.restaurantSuppliers) setRestaurantSuppliers(data.restaurantSuppliers);
      if (data.restaurantInventory) setRestaurantInventory(data.restaurantInventory);
      if (data.restaurantPurchases) setRestaurantPurchases(data.restaurantPurchases);
      if (data.restaurantDeposits) setRestaurantDeposits(data.restaurantDeposits);
      if (data.dailySalesEntries) setDailySalesEntries(data.dailySalesEntries);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const resetDatabaseToDefault = () => {
    if (!canDelete) return;
    setUsers(initialUsers);
    setTanks(initialTanks);
    setDeliveries(initialDeliveries);
    setLubricants(initialLubricants);
    setWorkers(initialWorkers);
    setAttendance(initialAttendance);
    setSalaries(initialSalaries);
    setUdhaarCustomers(initialUdhaarCustomers);
    setCategories(initialCategories);
    setExpenses(initialExpenses);
    setBankAccounts(initialBankAccounts);
    setBankTransactions(initialBankTransactions);
    setCashRegister(initialCashRegister);
    setCreditCardSales(initialCreditCardSales);
    setInfiniCardSales(initialInfiniCardSales);
    setShops(initialShops);
    setRentalAgreements(initialRentalAgreements);
    setNotifications(initialNotifications);
    setTyreShopServices(initialTyreServices);
    setCarWashServices(initialCarWashServices);
    setTuckShopItems(initialTuckShopItems);
    setRestaurantSales(initialRestaurantSales);
    setRestaurantExpenses(initialRestaurantExpenses);
    setRestaurantStaff(initialRestaurantStaff);
    setRestaurantAttendance(initialRestaurantAttendance);
    setRestaurantSalaries(initialRestaurantSalaries);
    setRestaurantSuppliers(initialRestaurantSuppliers);
    setRestaurantInventory(initialRestaurantInventory);
    setRestaurantPurchases(initialRestaurantPurchases);
    setRestaurantDeposits(initialRestaurantDeposits);
    setDailySalesEntries(initialDailySalesEntries);
    localStorage.clear();
  };

  // Test connection to Firestore on boot
  useEffect(() => {
    testFirestoreConnection().catch(err => {
      console.warn('Firestore initial connection test warning:', err);
    });
  }, []);

  const triggerManualSync = () => {
    setSyncStatus(prev => ({ ...prev, syncing: true }));
    testFirestoreConnection()
      .then(() => {
        setSyncStatus({
          online: true,
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          syncing: false,
        });
      })
      .catch(err => {
        console.error('Sync error:', err);
        setSyncStatus({
          online: false,
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          syncing: false,
        });
      });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        users,
        activeTab,
        setActiveTab: handleSetActiveTab,
        currentView,
        setCurrentView: handleSetCurrentView,
        syncStatus,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        tanks,
        deliveries,
        lubricants,
        workers,
        attendance,
        salaries,
        udhaarCustomers,
        categories,
        expenses,
        bankAccounts,
        bankTransactions,
        cashRegister,
        creditCardSales,
        infiniCardSales,
        shops,
        rentalAgreements,
        notifications,
        tyreShopServices,
        carWashServices,
        tuckShopItems,
        restaurantSales,
        restaurantExpenses,
        restaurantStaff,
        restaurantAttendance,
        restaurantSalaries,
        restaurantSuppliers,
        restaurantInventory,
        restaurantPurchases,
        restaurantDeposits,
        dailySalesEntries,
        addDailySalesEntry,
        updateDailySalesEntry,
        deleteDailySalesEntry,
        isAdmin,
        canEdit,
        canDelete,
        canManageUsers,
        login,
        logout,
        switchRole,
        updateAdminProfile,
        createEmployee,
        resetEmployeePassword,
        toggleEmployeeStatus,
        deleteEmployee,
        addDelivery,
        deleteDelivery,
        addTank,
        updateTank,
        deleteTank,
        addLubricant,
        updateLubricant,
        adjustLubricantStock,
        deleteLubricant,
        addWorker,
        updateWorker,
        deleteWorker,
        markAttendance,
        addSalaryAdvance,
        paySalary,
        addUdhaarCustomer,
        addUdhaarTransaction,
        addExpenseCategory,
        addExpense,
        deleteExpense,
        addBankAccount,
        addBankTransaction,
        updateCashRegister,
        addCreditCardSale,
        addInfiniCardSale,
        updateShopData,
        addRentalAgreement,
        receiveRentPayment,
        addTyreShopService,
        deleteTyreShopService,
        addCarWashService,
        deleteCarWashService,
        addTuckShopItem,
        deleteTuckShopItem,
        addRestaurantSale,
        deleteRestaurantSale,
        addRestaurantExpense,
        deleteRestaurantExpense,
        addRestaurantStaff,
        updateRestaurantStaff,
        deleteRestaurantStaff,
        markRestaurantAttendance,
        payRestaurantSalary,
        addRestaurantSupplier,
        deleteRestaurantSupplier,
        addRestaurantInventory,
        updateRestaurantInventory,
        deleteRestaurantInventory,
        addRestaurantPurchase,
        addRestaurantDeposit,
        addUser,
        updateUserStatus,
        markNotificationRead,
        clearAllNotifications,
        exportDatabaseJSON,
        importDatabaseJSON,
        resetDatabaseToDefault,
        triggerManualSync,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
