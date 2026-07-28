import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  testFirestoreConnection,
  auth,
  firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
} from '../lib/firebase';
import { simpleHashPassword, verifyPassword, generateOTP } from '../utils/security';
import {
  subscribeToCollection,
  subscribeToDoc,
  syncSaveDoc,
  syncDeleteDoc,
  syncSaveSingleton,
} from '../lib/firestoreSync';
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
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
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
  login: (identifier: string, pass: string, role?: UserRole, rememberDevice?: boolean) => boolean;
  sendPasswordResetOTP: (identifier: string) => { success: boolean; message: string; otp?: string; user?: User };
  resetUserPassword: (userId: string, newPass: string) => boolean;
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
const TRUSTED_DEVICE_KEY = 'BAHU_PETROLEUM_TRUSTED_DEVICE_V1';
const TRUSTED_USER_KEY = 'BAHU_PETROLEUM_TRUSTED_USER_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const isTrusted = localStorage.getItem(TRUSTED_DEVICE_KEY) === 'true';
      if (isTrusted) {
        const stored = localStorage.getItem(TRUSTED_USER_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch {
      return null;
    }
    return null; // Require authentication on new devices/sessions
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
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

  // Network & Online Status Listeners for Real-time Cloud Sync
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, online: true, lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
    };
    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, online: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Ensure Firebase Auth session listener is active
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setSyncStatus(prev => ({ ...prev, online: true, lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubAuth();
    };
  }, []);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    testFirestoreConnection();

    const updateSyncTime = () => {
      setSyncStatus(prev => ({
        ...prev,
        online: true,
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));
    };

    const wrapSetter = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => (val: T) => {
      setter(val);
      updateSyncTime();
    };

    const unsubs: (() => void)[] = [];

    unsubs.push(subscribeToCollection<User>('users', wrapSetter(setUsers), initialUsers));
    unsubs.push(subscribeToCollection<Tank>('tanks', wrapSetter(setTanks), initialTanks));
    unsubs.push(subscribeToCollection<FuelDelivery>('deliveries', wrapSetter(setDeliveries), initialDeliveries));
    unsubs.push(subscribeToCollection<LubricantProduct>('lubricants', wrapSetter(setLubricants), initialLubricants));
    unsubs.push(subscribeToCollection<Worker>('workers', wrapSetter(setWorkers), initialWorkers));
    unsubs.push(subscribeToCollection<AttendanceRecord>('attendance', wrapSetter(setAttendance), initialAttendance));
    unsubs.push(subscribeToCollection<SalaryRecord>('salaries', wrapSetter(setSalaries), initialSalaries));
    unsubs.push(subscribeToCollection<UdhaarCustomer>('udhaarCustomers', wrapSetter(setUdhaarCustomers), initialUdhaarCustomers));
    unsubs.push(subscribeToCollection<ExpenseCategory>('categories', wrapSetter(setCategories), initialCategories));
    unsubs.push(subscribeToCollection<Expense>('expenses', wrapSetter(setExpenses), initialExpenses));
    unsubs.push(subscribeToCollection<BankAccount>('bankAccounts', wrapSetter(setBankAccounts), initialBankAccounts));
    unsubs.push(subscribeToCollection<BankTransaction>('bankTransactions', wrapSetter(setBankTransactions), initialBankTransactions));
    unsubs.push(subscribeToDoc<CashRegister>('singletons/cashRegister', wrapSetter(setCashRegister), initialCashRegister));
    unsubs.push(subscribeToCollection<CreditCardTransaction>('creditCardSales', wrapSetter(setCreditCardSales), initialCreditCardSales));
    unsubs.push(subscribeToCollection<InfiniCardTransaction>('infiniCardSales', wrapSetter(setInfiniCardSales), initialInfiniCardSales));
    unsubs.push(subscribeToCollection<ShopModuleData>('shops', wrapSetter(setShops), initialShops));
    unsubs.push(subscribeToCollection<RentalAgreement>('rentalAgreements', wrapSetter(setRentalAgreements), initialRentalAgreements));
    unsubs.push(subscribeToCollection<AppNotification>('notifications', wrapSetter(setNotifications), initialNotifications));

    unsubs.push(subscribeToCollection<TyreShopService>('tyreShopServices', wrapSetter(setTyreShopServices), initialTyreServices));
    unsubs.push(subscribeToCollection<CarWashService>('carWashServices', wrapSetter(setCarWashServices), initialCarWashServices));
    unsubs.push(subscribeToCollection<TuckShopItem>('tuckShopItems', wrapSetter(setTuckShopItems), initialTuckShopItems));

    unsubs.push(subscribeToCollection<RestaurantSale>('restaurantSales', wrapSetter(setRestaurantSales), initialRestaurantSales));
    unsubs.push(subscribeToCollection<RestaurantExpense>('restaurantExpenses', wrapSetter(setRestaurantExpenses), initialRestaurantExpenses));
    unsubs.push(subscribeToCollection<RestaurantStaff>('restaurantStaff', wrapSetter(setRestaurantStaff), initialRestaurantStaff));
    unsubs.push(subscribeToCollection<RestaurantAttendance>('restaurantAttendance', wrapSetter(setRestaurantAttendance), initialRestaurantAttendance));
    unsubs.push(subscribeToCollection<RestaurantSalaryRecord>('restaurantSalaries', wrapSetter(setRestaurantSalaries), initialRestaurantSalaries));
    unsubs.push(subscribeToCollection<RestaurantSupplier>('restaurantSuppliers', wrapSetter(setRestaurantSuppliers), initialRestaurantSuppliers));
    unsubs.push(subscribeToCollection<RestaurantKitchenInventory>('restaurantInventory', wrapSetter(setRestaurantInventory), initialRestaurantInventory));
    unsubs.push(subscribeToCollection<RestaurantPurchase>('restaurantPurchases', wrapSetter(setRestaurantPurchases), initialRestaurantPurchases));
    unsubs.push(subscribeToCollection<RestaurantDeposit>('restaurantDeposits', wrapSetter(setRestaurantDeposits), initialRestaurantDeposits));

    unsubs.push(subscribeToCollection<DailySalesEntry>('dailySalesEntries', wrapSetter(setDailySalesEntries), initialDailySalesEntries));

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  // Sync to local storage for offline fast fallback
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
  const login = (identifier: string, pass: string, role?: UserRole, rememberDevice: boolean = false): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    
    // Find matching user in users array
    const matched = users.find(u => {
      if (!u.active) return false;
      if (role && u.role !== role) return false;

      if (u.role === 'ADMIN') {
        // Admin can match email, primary phone, secondary phone, or name
        return (
          (u.email && u.email.toLowerCase() === cleanId) ||
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
      const isPassValid = verifyPassword(pass, matched.password);
      if (!isPassValid) {
        return false;
      }
      setCurrentUser(matched);

      // Sign in to Firebase Auth in background to establish live Auth token
      if (!auth.currentUser) {
        signInAnonymously(auth).catch((e) => console.warn('Firebase auth session notice:', e));
      }

      if (rememberDevice) {
        localStorage.setItem(TRUSTED_DEVICE_KEY, 'true');
        localStorage.setItem(TRUSTED_USER_KEY, JSON.stringify(matched));
      } else {
        localStorage.removeItem(TRUSTED_DEVICE_KEY);
        localStorage.removeItem(TRUSTED_USER_KEY);
      }
      return true;
    }

    // Default Fallback matching for CEO Admin when user collection is initializing
    if (cleanId === '03009654471' || cleanId === '03129654471' || cleanId === 'admin' || cleanId === 'admin@bahupetroleum.com') {
      const adminUser = users.find(u => u.role === 'ADMIN') || initialUsers[0];
      if (verifyPassword(pass, adminUser.password)) {
        setCurrentUser(adminUser);
        if (!auth.currentUser) {
          signInAnonymously(auth).catch((e) => console.warn('Firebase auth session notice:', e));
        }
        if (rememberDevice) {
          localStorage.setItem(TRUSTED_DEVICE_KEY, 'true');
          localStorage.setItem(TRUSTED_USER_KEY, JSON.stringify(adminUser));
        } else {
          localStorage.removeItem(TRUSTED_DEVICE_KEY);
          localStorage.removeItem(TRUSTED_USER_KEY);
        }
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    firebaseSignOut(auth).catch(e => console.warn('Firebase signOut notice:', e));
    localStorage.removeItem(TRUSTED_DEVICE_KEY);
    localStorage.removeItem(TRUSTED_USER_KEY);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_currentUser`);
  };

  const sendPasswordResetOTP = (identifier: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = cleanId.replace(/[- ]/g, '');

    const matched = users.find(u => {
      if (!u.active) return false;
      return (
        (u.email && u.email.toLowerCase() === cleanId) ||
        (u.phonePrimary && u.phonePrimary.replace(/[- ]/g, '') === cleanPhone) ||
        (u.phoneSecondary && u.phoneSecondary.replace(/[- ]/g, '') === cleanPhone) ||
        u.name.toLowerCase() === cleanId
      );
    });

    if (!matched) {
      return {
        success: false,
        message: 'No active user account found matching this email address or mobile number.',
      };
    }

    const otp = generateOTP();
    return {
      success: true,
      message: `Verification code (OTP) sent to ${matched.email || matched.phonePrimary || matched.name}.`,
      otp,
      user: matched,
    };
  };

  const resetUserPassword = (userId: string, newPass: string): boolean => {
    const hashedPassword = simpleHashPassword(newPass);
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const updated = { ...u, password: hashedPassword };
          syncSaveDoc('users', updated);
          return updated;
        }
        return u;
      })
    );
    return true;
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
    const updatedPassword = data.password ? simpleHashPassword(data.password) : undefined;
    setUsers(prev =>
      prev.map(u => {
        if (u.role === 'ADMIN') {
          const updated = {
            ...u,
            name: data.name,
            email: data.email,
            phonePrimary: data.phonePrimary,
            phoneSecondary: data.phoneSecondary,
            password: updatedPassword || u.password,
          };
          syncSaveDoc('users', updated);
          return updated;
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
        password: updatedPassword || prev.password,
      } : null);
    }
  };

  // Employee Management
  const createEmployee = (data: { name: string; password?: string }) => {
    const newEmp: User = {
      id: `u-emp-${Date.now()}`,
      name: data.name,
      email: '',
      password: simpleHashPassword(data.password || '123456'),
      role: 'EMPLOYEE',
      active: true,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newEmp]);
    syncSaveDoc('users', newEmp);
  };

  const resetEmployeePassword = (id: string, newPass: string) => {
    const hashedPassword = simpleHashPassword(newPass);
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, password: hashedPassword };
        syncSaveDoc('users', updated);
        return updated;
      }
      return u;
    }));
  };

  const toggleEmployeeStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, active: !u.active };
        syncSaveDoc('users', updated);
        return updated;
      }
      return u;
    }));
  };

  const deleteEmployee = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    syncDeleteDoc('users', id);
  };

  // Fuel Delivery Action
  const addDelivery = (data: Omit<FuelDelivery, 'id' | 'createdAt' | 'createdBy'>) => {
    const newDelivery: FuelDelivery = {
      ...data,
      id: `del-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'System',
    };

    setDeliveries(prev => [newDelivery, ...prev]);
    syncSaveDoc('deliveries', newDelivery);

    // Update target tank current stock
    if (data.tankId) {
      setTanks(prevTanks =>
        prevTanks.map(t => {
          if (t.id === data.tankId) {
            const added = data.totalLitersReceived;
            const newFuel = t.currentFuel + added;
            const updatedTank = {
              ...t,
              currentFuel: newFuel,
              closingStock: newFuel,
            };
            syncSaveDoc('tanks', updatedTank);
            return updatedTank;
          }
          return t;
        })
      );
    }
  };

  const deleteDelivery = (id: string) => {
    if (!canDelete) return;
    setDeliveries(prev => prev.filter(d => d.id !== id));
    syncDeleteDoc('deliveries', id);
  };

  const addTank = (data: Omit<Tank, 'id'>) => {
    const newTank: Tank = { ...data, id: `tank-${Date.now()}` };
    setTanks(prev => [...prev, newTank]);
    syncSaveDoc('tanks', newTank);
  };

  const updateTank = (tank: Tank) => {
    if (!canEdit) return;
    setTanks(prev => prev.map(t => (t.id === tank.id ? tank : t)));
    syncSaveDoc('tanks', tank);
  };

  const deleteTank = (id: string) => {
    if (!canDelete) return;
    setTanks(prev => prev.filter(t => t.id !== id));
    syncDeleteDoc('tanks', id);
  };

  // Lubricants
  const addLubricant = (data: Omit<LubricantProduct, 'id'>) => {
    const newLub: LubricantProduct = { ...data, id: `lub-${Date.now()}` };
    setLubricants(prev => [...prev, newLub]);
    syncSaveDoc('lubricants', newLub);
  };

  const updateLubricant = (lub: LubricantProduct) => {
    if (!canEdit) return;
    setLubricants(prev => prev.map(l => (l.id === lub.id ? lub : l)));
    syncSaveDoc('lubricants', lub);
  };

  const adjustLubricantStock = (id: string, qty: number, type: 'IN' | 'OUT') => {
    setLubricants(prev =>
      prev.map(l => {
        if (l.id === id) {
          const newStockIn = type === 'IN' ? l.stockIn + qty : l.stockIn;
          const newStockOut = type === 'OUT' ? l.stockOut + qty : l.stockOut;
          const remaining = Math.max(0, newStockIn - newStockOut);
          const updated = { ...l, stockIn: newStockIn, stockOut: newStockOut, remainingStock: remaining };
          syncSaveDoc('lubricants', updated);
          return updated;
        }
        return l;
      })
    );
  };

  const deleteLubricant = (id: string) => {
    if (!canDelete) return;
    setLubricants(prev => prev.filter(l => l.id !== id));
    syncDeleteDoc('lubricants', id);
  };

  // Workers
  const addWorker = (data: Omit<Worker, 'id'>) => {
    const newId = `w-${Date.now()}`;
    const newWorker: Worker = { ...data, id: newId };
    const newSalary: SalaryRecord = {
      id: `sal-${Date.now()}`,
      workerId: newId,
      monthlySalary: data.monthlySalary || 0,
      totalAdvance: 0,
      advanceHistory: [],
      salaryPaid: 0,
      pendingSalary: data.monthlySalary || 0,
      remainingSalary: data.monthlySalary || 0,
    };
    setWorkers(prev => [...prev, newWorker]);
    setSalaries(prev => [...prev, newSalary]);
    syncSaveDoc('workers', newWorker);
    syncSaveDoc('salaries', newSalary);
  };

  const updateWorker = (worker: Worker) => {
    if (!canEdit) return;
    setWorkers(prev => prev.map(w => (w.id === worker.id ? worker : w)));
    syncSaveDoc('workers', worker);
  };

  const deleteWorker = (id: string) => {
    if (!canDelete) return;
    setWorkers(prev => prev.filter(w => w.id !== id));
    syncDeleteDoc('workers', id);
  };

  const markAttendance = (workerId: string, status: AttendanceRecord['status'], date: string, notes?: string) => {
    setAttendance(prev => {
      const existing = prev.find(a => a.workerId === workerId && a.date === date);
      if (existing) {
        const updated = { ...existing, status, notes };
        syncSaveDoc('attendance', updated);
        return prev.map(a => (a.id === existing.id ? updated : a));
      }
      const newAtt: AttendanceRecord = { id: `att-${Date.now()}`, workerId, date, status, notes };
      syncSaveDoc('attendance', newAtt);
      return [...prev, newAtt];
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
          const updated = {
            ...s,
            totalAdvance: newTotalAdvance,
            advanceHistory: newAdvanceHistory,
            remainingSalary: remaining,
            pendingSalary: remaining,
          };
          syncSaveDoc('salaries', updated);
          return updated;
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
          const updated = {
            ...s,
            salaryPaid: paid,
            remainingSalary: remaining,
            pendingSalary: remaining,
            lastPaymentDate: new Date().toISOString().slice(0, 10),
          };
          syncSaveDoc('salaries', updated);
          return updated;
        }
        return s;
      })
    );
  };

  // Udhaar Customers
  const addUdhaarCustomer = (data: Omit<UdhaarCustomer, 'id' | 'remainingBalance' | 'transactions'>) => {
    const newCust: UdhaarCustomer = {
      ...data,
      id: `udh-${Date.now()}`,
      remainingBalance: (data.totalCredit || 0) - (data.paymentReceived || 0),
      transactions: [],
    };
    setUdhaarCustomers(prev => [...prev, newCust]);
    syncSaveDoc('udhaarCustomers', newCust);
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
          const updated = {
            ...c,
            totalCredit,
            paymentReceived,
            remainingBalance: remaining,
            transactions: [newTx, ...c.transactions],
          };
          syncSaveDoc('udhaarCustomers', updated);
          return updated;
        }
        return c;
      })
    );
  };

  // Expenses
  const addExpenseCategory = (name: string) => {
    if (!name.trim()) return;
    const newCat: ExpenseCategory = { id: `cat-${Date.now()}`, name: name.trim(), isCustom: true };
    setCategories(prev => [...prev, newCat]);
    syncSaveDoc('categories', newCat);
  };

  const addExpense = (data: Omit<Expense, 'id' | 'createdBy'>) => {
    const newExp: Expense = { ...data, id: `exp-${Date.now()}`, createdBy: currentUser?.name || 'System' };
    setExpenses(prev => [newExp, ...prev]);
    syncSaveDoc('expenses', newExp);
  };

  const deleteExpense = (id: string) => {
    if (!canDelete) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    syncDeleteDoc('expenses', id);
  };

  // Bank
  const addBankAccount = (data: Omit<BankAccount, 'id' | 'currentBalance'>) => {
    const newBank: BankAccount = { ...data, id: `bank-${Date.now()}`, currentBalance: 0 };
    setBankAccounts(prev => [...prev, newBank]);
    syncSaveDoc('bankAccounts', newBank);
  };

  const addBankTransaction = (data: Omit<BankTransaction, 'id' | 'createdBy'>) => {
    const newTx: BankTransaction = { ...data, id: `bt-${Date.now()}`, createdBy: currentUser?.name || 'System' };
    setBankTransactions(prev => [newTx, ...prev]);
    syncSaveDoc('bankTransactions', newTx);

    setBankAccounts(prev =>
      prev.map(b => {
        if (b.id === data.bankId) {
          const change = data.type === 'Deposit' ? data.amount : -data.amount;
          const updated = { ...b, currentBalance: b.currentBalance + change };
          syncSaveDoc('bankAccounts', updated);
          return updated;
        }
        return b;
      })
    );
  };

  const updateCashRegister = (data: Partial<CashRegister>) => {
    setCashRegister(prev => {
      const updated = { ...prev, ...data };
      syncSaveSingleton('singletons/cashRegister', updated);
      return updated;
    });
  };

  const addCreditCardSale = (data: Omit<CreditCardTransaction, 'id'>) => {
    const newTx: CreditCardTransaction = { ...data, id: `cc-${Date.now()}` };
    setCreditCardSales(prev => [newTx, ...prev]);
    syncSaveDoc('creditCardSales', newTx);
  };

  const addInfiniCardSale = (data: Omit<InfiniCardTransaction, 'id'>) => {
    const newTx: InfiniCardTransaction = { ...data, id: `inf-${Date.now()}` };
    setInfiniCardSales(prev => [newTx, ...prev]);
    syncSaveDoc('infiniCardSales', newTx);
  };

  const updateShopData = (data: ShopModuleData) => {
    setShops(prev => prev.map(s => (s.id === data.id ? data : s)));
    syncSaveDoc('shops', data);
  };

  const addRentalAgreement = (
    data: Omit<RentalAgreement, 'id' | 'amountPaid' | 'pendingAmount' | 'status' | 'paymentHistory'>
  ) => {
    const newRental: RentalAgreement = {
      ...data,
      id: `rent-${Date.now()}`,
      amountPaid: 0,
      pendingAmount: data.monthlyRent || 0,
      status: 'Pending',
      paymentHistory: [],
    };
    setRentalAgreements(prev => [...prev, newRental]);
    syncSaveDoc('rentalAgreements', newRental);
  };

  const receiveRentPayment = (rentalId: string, amount: number, monthPaidFor: string, receiptNo: string) => {
    setRentalAgreements(prev =>
      prev.map(r => {
        if (r.id === rentalId) {
          const newPaid = r.amountPaid + amount;
          const pending = Math.max(0, r.monthlyRent - newPaid);
          const updated = {
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
          syncSaveDoc('rentalAgreements', updated);
          return updated;
        }
        return r;
      })
    );
  };

  // Sub-business Actions
  const addTyreShopService = (data: Omit<TyreShopService, 'id'>) => {
    const newTyre: TyreShopService = { ...data, id: `tyre-${Date.now()}` };
    setTyreShopServices(prev => [newTyre, ...prev]);
    syncSaveDoc('tyreShopServices', newTyre);
  };

  const deleteTyreShopService = (id: string) => {
    if (!canDelete) return;
    setTyreShopServices(prev => prev.filter(t => t.id !== id));
    syncDeleteDoc('tyreShopServices', id);
  };

  const addCarWashService = (data: Omit<CarWashService, 'id'>) => {
    const newWash: CarWashService = { ...data, id: `wash-${Date.now()}` };
    setCarWashServices(prev => [newWash, ...prev]);
    syncSaveDoc('carWashServices', newWash);
  };

  const deleteCarWashService = (id: string) => {
    if (!canDelete) return;
    setCarWashServices(prev => prev.filter(w => w.id !== id));
    syncDeleteDoc('carWashServices', id);
  };

  const addTuckShopItem = (data: Omit<TuckShopItem, 'id'>) => {
    const newTuck: TuckShopItem = { ...data, id: `tuck-${Date.now()}` };
    setTuckShopItems(prev => [newTuck, ...prev]);
    syncSaveDoc('tuckShopItems', newTuck);
  };

  const deleteTuckShopItem = (id: string) => {
    if (!canDelete) return;
    setTuckShopItems(prev => prev.filter(t => t.id !== id));
    syncDeleteDoc('tuckShopItems', id);
  };

  // Restaurant Actions
  const addRestaurantSale = (data: Omit<RestaurantSale, 'id' | 'createdBy'>) => {
    const newSale: RestaurantSale = { ...data, id: `rsale-${Date.now()}`, createdBy: currentUser?.name || 'System' };
    setRestaurantSales(prev => [newSale, ...prev]);
    syncSaveDoc('restaurantSales', newSale);
  };

  const deleteRestaurantSale = (id: string) => {
    if (!canDelete) return;
    setRestaurantSales(prev => prev.filter(s => s.id !== id));
    syncDeleteDoc('restaurantSales', id);
  };

  const addRestaurantExpense = (data: Omit<RestaurantExpense, 'id' | 'createdBy'>) => {
    const newExp: RestaurantExpense = { ...data, id: `rexp-${Date.now()}`, createdBy: currentUser?.name || 'System' };
    setRestaurantExpenses(prev => [newExp, ...prev]);
    syncSaveDoc('restaurantExpenses', newExp);
  };

  const deleteRestaurantExpense = (id: string) => {
    if (!canDelete) return;
    setRestaurantExpenses(prev => prev.filter(e => e.id !== id));
    syncDeleteDoc('restaurantExpenses', id);
  };

  const addRestaurantStaff = (data: Omit<RestaurantStaff, 'id'>) => {
    const newStaff: RestaurantStaff = { ...data, id: `rstaff-${Date.now()}` };
    setRestaurantStaff(prev => [...prev, newStaff]);
    syncSaveDoc('restaurantStaff', newStaff);
  };

  const updateRestaurantStaff = (staff: RestaurantStaff) => {
    if (!canEdit) return;
    setRestaurantStaff(prev => prev.map(s => (s.id === staff.id ? staff : s)));
    syncSaveDoc('restaurantStaff', staff);
  };

  const deleteRestaurantStaff = (id: string) => {
    if (!canDelete) return;
    setRestaurantStaff(prev => prev.filter(s => s.id !== id));
    syncDeleteDoc('restaurantStaff', id);
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
        const updated = { ...existing, status, notes };
        syncSaveDoc('restaurantAttendance', updated);
        return prev.map(a => (a.id === existing.id ? updated : a));
      }
      const newAtt: RestaurantAttendance = { id: `ratt-${Date.now()}`, staffId, staffName, date, status, notes };
      syncSaveDoc('restaurantAttendance', newAtt);
      return [...prev, newAtt];
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
    const newSal: RestaurantSalaryRecord = {
      id: `rsal-${Date.now()}`,
      staffId,
      staffName,
      date: new Date().toISOString().slice(0, 10),
      amountPaid,
      advanceDeducted,
      netPaid,
      notes,
    };
    setRestaurantSalaries(prev => [...prev, newSal]);
    syncSaveDoc('restaurantSalaries', newSal);
  };

  const addRestaurantSupplier = (data: Omit<RestaurantSupplier, 'id'>) => {
    const newSup: RestaurantSupplier = { ...data, id: `rsup-${Date.now()}` };
    setRestaurantSuppliers(prev => [...prev, newSup]);
    syncSaveDoc('restaurantSuppliers', newSup);
  };

  const deleteRestaurantSupplier = (id: string) => {
    if (!canDelete) return;
    setRestaurantSuppliers(prev => prev.filter(s => s.id !== id));
    syncDeleteDoc('restaurantSuppliers', id);
  };

  const addRestaurantInventory = (data: Omit<RestaurantKitchenInventory, 'id' | 'lastUpdated'>) => {
    const newInv: RestaurantKitchenInventory = {
      ...data,
      id: `rinv-${Date.now()}`,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setRestaurantInventory(prev => [...prev, newInv]);
    syncSaveDoc('restaurantInventory', newInv);
  };

  const updateRestaurantInventory = (inv: RestaurantKitchenInventory) => {
    if (!canEdit) return;
    setRestaurantInventory(prev => prev.map(i => (i.id === inv.id ? inv : i)));
    syncSaveDoc('restaurantInventory', inv);
  };

  const deleteRestaurantInventory = (id: string) => {
    if (!canDelete) return;
    setRestaurantInventory(prev => prev.filter(i => i.id !== id));
    syncDeleteDoc('restaurantInventory', id);
  };

  const addRestaurantPurchase = (data: Omit<RestaurantPurchase, 'id'>) => {
    const newPur: RestaurantPurchase = { ...data, id: `rpur-${Date.now()}` };
    setRestaurantPurchases(prev => [newPur, ...prev]);
    syncSaveDoc('restaurantPurchases', newPur);
  };

  const addRestaurantDeposit = (data: Omit<RestaurantDeposit, 'id'>) => {
    const newDep: RestaurantDeposit = { ...data, id: `rdep-${Date.now()}` };
    setRestaurantDeposits(prev => [newDep, ...prev]);
    syncSaveDoc('restaurantDeposits', newDep);
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
    syncSaveDoc('dailySalesEntries', newEntry);
  };

  const updateDailySalesEntry = (id: string, updated: Partial<DailySalesEntry>) => {
    setDailySalesEntries(prev =>
      prev.map(entry => {
        if (entry.id === id) {
          const merged = { ...entry, ...updated };
          syncSaveDoc('dailySalesEntries', merged);
          return merged;
        }
        return entry;
      })
    );
  };

  const deleteDailySalesEntry = (id: string) => {
    if (!isAdmin) {
      alert('Only Admin users can delete daily sales entries.');
      return;
    }
    setDailySalesEntries(prev => prev.filter(entry => entry.id !== id));
    syncDeleteDoc('dailySalesEntries', id);
  };

  // Misc
  const addUser = (data: Omit<User, 'id' | 'createdAt'>) => {
    if (!canManageUsers) return;
    const newUser: User = { ...data, id: `u-${Date.now()}`, createdAt: new Date().toISOString() };
    setUsers(prev => [...prev, newUser]);
    syncSaveDoc('users', newUser);
  };

  const updateUserStatus = (userId: string, active: boolean) => {
    if (!canManageUsers) return;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, active };
        syncSaveDoc('users', updated);
        return updated;
      }
      return u;
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, read: true };
        syncSaveDoc('notifications', updated);
        return updated;
      }
      return n;
    }));
  };

  const clearAllNotifications = () => {
    notifications.forEach(n => syncDeleteDoc('notifications', n.id));
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
      if (data.users) { setUsers(data.users); data.users.forEach((u: any) => syncSaveDoc('users', u)); }
      if (data.tanks) { setTanks(data.tanks); data.tanks.forEach((t: any) => syncSaveDoc('tanks', t)); }
      if (data.deliveries) { setDeliveries(data.deliveries); data.deliveries.forEach((d: any) => syncSaveDoc('deliveries', d)); }
      if (data.lubricants) { setLubricants(data.lubricants); data.lubricants.forEach((l: any) => syncSaveDoc('lubricants', l)); }
      if (data.workers) { setWorkers(data.workers); data.workers.forEach((w: any) => syncSaveDoc('workers', w)); }
      if (data.attendance) { setAttendance(data.attendance); data.attendance.forEach((a: any) => syncSaveDoc('attendance', a)); }
      if (data.salaries) { setSalaries(data.salaries); data.salaries.forEach((s: any) => syncSaveDoc('salaries', s)); }
      if (data.udhaarCustomers) { setUdhaarCustomers(data.udhaarCustomers); data.udhaarCustomers.forEach((c: any) => syncSaveDoc('udhaarCustomers', c)); }
      if (data.expenses) { setExpenses(data.expenses); data.expenses.forEach((e: any) => syncSaveDoc('expenses', e)); }
      if (data.bankAccounts) { setBankAccounts(data.bankAccounts); data.bankAccounts.forEach((b: any) => syncSaveDoc('bankAccounts', b)); }
      if (data.bankTransactions) { setBankTransactions(data.bankTransactions); data.bankTransactions.forEach((bt: any) => syncSaveDoc('bankTransactions', bt)); }
      if (data.cashRegister) { setCashRegister(data.cashRegister); syncSaveSingleton('singletons/cashRegister', data.cashRegister); }
      if (data.creditCardSales) { setCreditCardSales(data.creditCardSales); data.creditCardSales.forEach((cc: any) => syncSaveDoc('creditCardSales', cc)); }
      if (data.infiniCardSales) { setInfiniCardSales(data.infiniCardSales); data.infiniCardSales.forEach((inf: any) => syncSaveDoc('infiniCardSales', inf)); }
      if (data.shops) { setShops(data.shops); data.shops.forEach((s: any) => syncSaveDoc('shops', s)); }
      if (data.rentalAgreements) { setRentalAgreements(data.rentalAgreements); data.rentalAgreements.forEach((r: any) => syncSaveDoc('rentalAgreements', r)); }
      if (data.notifications) { setNotifications(data.notifications); data.notifications.forEach((n: any) => syncSaveDoc('notifications', n)); }
      if (data.tyreShopServices) { setTyreShopServices(data.tyreShopServices); data.tyreShopServices.forEach((t: any) => syncSaveDoc('tyreShopServices', t)); }
      if (data.carWashServices) { setCarWashServices(data.carWashServices); data.carWashServices.forEach((w: any) => syncSaveDoc('carWashServices', w)); }
      if (data.tuckShopItems) { setTuckShopItems(data.tuckShopItems); data.tuckShopItems.forEach((t: any) => syncSaveDoc('tuckShopItems', t)); }
      if (data.restaurantSales) { setRestaurantSales(data.restaurantSales); data.restaurantSales.forEach((s: any) => syncSaveDoc('restaurantSales', s)); }
      if (data.restaurantExpenses) { setRestaurantExpenses(data.restaurantExpenses); data.restaurantExpenses.forEach((e: any) => syncSaveDoc('restaurantExpenses', e)); }
      if (data.restaurantStaff) { setRestaurantStaff(data.restaurantStaff); data.restaurantStaff.forEach((s: any) => syncSaveDoc('restaurantStaff', s)); }
      if (data.restaurantAttendance) { setRestaurantAttendance(data.restaurantAttendance); data.restaurantAttendance.forEach((a: any) => syncSaveDoc('restaurantAttendance', a)); }
      if (data.restaurantSalaries) { setRestaurantSalaries(data.restaurantSalaries); data.restaurantSalaries.forEach((s: any) => syncSaveDoc('restaurantSalaries', s)); }
      if (data.restaurantSuppliers) { setRestaurantSuppliers(data.restaurantSuppliers); data.restaurantSuppliers.forEach((s: any) => syncSaveDoc('restaurantSuppliers', s)); }
      if (data.restaurantInventory) { setRestaurantInventory(data.restaurantInventory); data.restaurantInventory.forEach((i: any) => syncSaveDoc('restaurantInventory', i)); }
      if (data.restaurantPurchases) { setRestaurantPurchases(data.restaurantPurchases); data.restaurantPurchases.forEach((p: any) => syncSaveDoc('restaurantPurchases', p)); }
      if (data.restaurantDeposits) { setRestaurantDeposits(data.restaurantDeposits); data.restaurantDeposits.forEach((d: any) => syncSaveDoc('restaurantDeposits', d)); }
      if (data.dailySalesEntries) { setDailySalesEntries(data.dailySalesEntries); data.dailySalesEntries.forEach((e: any) => syncSaveDoc('dailySalesEntries', e)); }
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

  const triggerManualSync = () => {
    setSyncStatus(prev => ({ ...prev, syncing: true }));
    testFirestoreConnection()
      .then(isOnline => {
        setSyncStatus({
          online: isOnline,
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          syncing: false,
        });
      })
      .catch(() => {
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
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
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
        sendPasswordResetOTP,
        resetUserPassword,
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
