import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
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
  ensureDatabaseInitialized,
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
  UdhaarTransaction,
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
  FuelSale,
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
  initialFuelSales,
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

  // Fuel Sales Collection
  fuelSales: FuelSale[];
  addFuelSale: (data: Omit<FuelSale, 'id' | 'createdAt' | 'createdBy'>) => { success: boolean; message?: string };
  updateFuelSale: (id: string, updated: Partial<FuelSale>) => { success: boolean; message?: string };
  deleteFuelSale: (id: string) => void;

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
  updateDelivery: (id: string, data: Partial<FuelDelivery>) => void;
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
  deleteAttendance: (id: string) => void;
  addSalaryAdvance: (workerId: string, amount: number, notes?: string) => void;
  deleteAdvanceRecord: (workerId: string, advanceId: string) => void;
  paySalary: (workerId: string, amount: number) => void;
  deleteSalaryRecord: (id: string) => void;
  addUdhaarCustomer: (data: Omit<UdhaarCustomer, 'id' | 'remainingBalance' | 'transactions'>) => void;
  updateUdhaarCustomer: (id: string, data: Partial<UdhaarCustomer>) => void;
  deleteUdhaarCustomer: (id: string) => void;
  addUdhaarTransaction: (
    customerId: string,
    type: 'CREDIT_PURCHASE' | 'PAYMENT_RECEIVED',
    amount: number,
    description: string,
    vehicleNumber?: string,
    date?: string,
    time?: string
  ) => void;
  editUdhaarTransaction: (customerId: string, transactionId: string, updatedTx: Partial<UdhaarTransaction>) => void;
  deleteUdhaarTransaction: (customerId: string, transactionId: string) => void;
  addExpenseCategory: (name: string) => void;
  addExpense: (data: Omit<Expense, 'id' | 'createdBy'>) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addBankAccount: (data: Omit<BankAccount, 'id'>) => void;
  deleteBankAccount: (id: string) => void;
  addBankTransaction: (data: Omit<BankTransaction, 'id' | 'createdBy'>) => void;
  deleteBankTransaction: (id: string) => void;
  updateCashRegister: (data: Partial<CashRegister>) => void;
  addCreditCardSale: (data: Omit<CreditCardTransaction, 'id'>) => void;
  deleteCreditCardSale: (id: string) => void;
  addInfiniCardSale: (data: Omit<InfiniCardTransaction, 'id'>) => void;
  deleteInfiniCardSale: (id: string) => void;
  updateShopData: (data: ShopModuleData) => void;
  addRentalAgreement: (data: Omit<RentalAgreement, 'id' | 'amountPaid' | 'pendingAmount' | 'status' | 'paymentHistory'>) => void;
  deleteRentalAgreement: (id: string) => void;
  receiveRentPayment: (rentalId: string, amount: number, monthPaidFor: string, receiptNo: string) => void;
  clearModuleData: (moduleKey: string) => void;

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
  deleteRestaurantPurchase: (id: string) => void;
  addRestaurantDeposit: (data: Omit<RestaurantDeposit, 'id'>) => void;
  deleteRestaurantDeposit: (id: string) => void;
  deleteRestaurantAttendance: (id: string) => void;
  deleteRestaurantSalary: (id: string) => void;

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
  const [fuelSales, setFuelSales] = useState<FuelSale[]>(() => loadLocal('fuelSales', initialFuelSales) || []);

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

    const seedDataMap = {
      users: initialUsers,
      tanks: initialTanks,
      deliveries: initialDeliveries,
      lubricants: initialLubricants,
      workers: initialWorkers,
      attendance: initialAttendance,
      salaries: initialSalaries,
      udhaarCustomers: initialUdhaarCustomers,
      categories: initialCategories,
      expenses: initialExpenses,
      bankAccounts: initialBankAccounts,
      bankTransactions: initialBankTransactions,
      creditCardSales: initialCreditCardSales,
      infiniCardSales: initialInfiniCardSales,
      shops: initialShops,
      rentalAgreements: initialRentalAgreements,
      notifications: initialNotifications,
      tyreShopServices: initialTyreServices,
      carWashServices: initialCarWashServices,
      tuckShopItems: initialTuckShopItems,
      restaurantSales: initialRestaurantSales,
      restaurantExpenses: initialRestaurantExpenses,
      restaurantStaff: initialRestaurantStaff,
      restaurantAttendance: initialRestaurantAttendance,
      restaurantSalaries: initialRestaurantSalaries,
      restaurantSuppliers: initialRestaurantSuppliers,
      restaurantInventory: initialRestaurantInventory,
      restaurantPurchases: initialRestaurantPurchases,
      restaurantDeposits: initialRestaurantDeposits,
      dailySalesEntries: initialDailySalesEntries,
      fuelSales: initialFuelSales,
    };

    const singletonDataMap = {
      'singletons/cashRegister': initialCashRegister,
    };

    // Ensure first time seeding runs if cloud DB is blank
    ensureDatabaseInitialized(seedDataMap, singletonDataMap);

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

    unsubs.push(subscribeToCollection<User>('users', wrapSetter(setUsers)));
    unsubs.push(subscribeToCollection<Tank>('tanks', wrapSetter(setTanks)));
    unsubs.push(subscribeToCollection<FuelDelivery>('deliveries', wrapSetter(setDeliveries)));
    unsubs.push(subscribeToCollection<LubricantProduct>('lubricants', wrapSetter(setLubricants)));
    unsubs.push(subscribeToCollection<Worker>('workers', wrapSetter(setWorkers)));
    unsubs.push(subscribeToCollection<AttendanceRecord>('attendance', wrapSetter(setAttendance)));
    unsubs.push(subscribeToCollection<SalaryRecord>('salaries', wrapSetter(setSalaries)));
    unsubs.push(subscribeToCollection<UdhaarCustomer>('udhaarCustomers', wrapSetter(setUdhaarCustomers)));
    unsubs.push(subscribeToCollection<ExpenseCategory>('categories', wrapSetter(setCategories)));
    unsubs.push(subscribeToCollection<Expense>('expenses', wrapSetter(setExpenses)));
    unsubs.push(subscribeToCollection<BankAccount>('bankAccounts', wrapSetter(setBankAccounts)));
    unsubs.push(subscribeToCollection<BankTransaction>('bankTransactions', wrapSetter(setBankTransactions)));
    unsubs.push(subscribeToDoc<CashRegister>('singletons/cashRegister', wrapSetter(setCashRegister)));
    unsubs.push(subscribeToCollection<CreditCardTransaction>('creditCardSales', wrapSetter(setCreditCardSales)));
    unsubs.push(subscribeToCollection<InfiniCardTransaction>('infiniCardSales', wrapSetter(setInfiniCardSales)));
    unsubs.push(subscribeToCollection<ShopModuleData>('shops', wrapSetter(setShops)));
    unsubs.push(subscribeToCollection<RentalAgreement>('rentalAgreements', wrapSetter(setRentalAgreements)));
    unsubs.push(subscribeToCollection<AppNotification>('notifications', wrapSetter(setNotifications)));

    unsubs.push(subscribeToCollection<TyreShopService>('tyreShopServices', wrapSetter(setTyreShopServices)));
    unsubs.push(subscribeToCollection<CarWashService>('carWashServices', wrapSetter(setCarWashServices)));
    unsubs.push(subscribeToCollection<TuckShopItem>('tuckShopItems', wrapSetter(setTuckShopItems)));

    unsubs.push(subscribeToCollection<RestaurantSale>('restaurantSales', wrapSetter(setRestaurantSales)));
    unsubs.push(subscribeToCollection<RestaurantExpense>('restaurantExpenses', wrapSetter(setRestaurantExpenses)));
    unsubs.push(subscribeToCollection<RestaurantStaff>('restaurantStaff', wrapSetter(setRestaurantStaff)));
    unsubs.push(subscribeToCollection<RestaurantAttendance>('restaurantAttendance', wrapSetter(setRestaurantAttendance)));
    unsubs.push(subscribeToCollection<RestaurantSalaryRecord>('restaurantSalaries', wrapSetter(setRestaurantSalaries)));
    unsubs.push(subscribeToCollection<RestaurantSupplier>('restaurantSuppliers', wrapSetter(setRestaurantSuppliers)));
    unsubs.push(subscribeToCollection<RestaurantKitchenInventory>('restaurantInventory', wrapSetter(setRestaurantInventory)));
    unsubs.push(subscribeToCollection<RestaurantPurchase>('restaurantPurchases', wrapSetter(setRestaurantPurchases)));
    unsubs.push(subscribeToCollection<RestaurantDeposit>('restaurantDeposits', wrapSetter(setRestaurantDeposits)));

    unsubs.push(subscribeToCollection<DailySalesEntry>('dailySalesEntries', wrapSetter(setDailySalesEntries)));
    unsubs.push(subscribeToCollection<FuelSale>('fuelSales', wrapSetter(setFuelSales)));

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
  useEffect(() => saveLocal('fuelSales', fuelSales), [fuelSales]);
  useEffect(() => saveLocal('restaurantPurchases', restaurantPurchases), [restaurantPurchases]);
  useEffect(() => saveLocal('restaurantDeposits', restaurantDeposits), [restaurantDeposits]);

  // Automated Monthly and Yearly Report Availability Notifications Trigger
  const notifsCheckedRef = useRef(false);

  useEffect(() => {
    if (notifsCheckedRef.current || notifications.length === 0) return;

    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const currentYearKey = `${today.getFullYear()}`;
    const dateStr = today.toISOString().slice(0, 10);

    const monthlyPdfIds = [
      `notif-monthly-pdf-cc-${currentMonthKey}`,
      `notif-monthly-pdf-lube-${currentMonthKey}`,
      `notif-monthly-pdf-exp-${currentMonthKey}`,
      `notif-monthly-pdf-fuel-${currentMonthKey}`,
      `notif-monthly-pdf-emp-${currentMonthKey}`,
      `notif-monthly-pdf-master-${currentMonthKey}`
    ];

    const yearlyPdfId = `notif-yearly-pdf-${currentYearKey}`;

    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const newToInsert: AppNotification[] = [];

      if (!existingIds.has(monthlyPdfIds[0])) {
        newToInsert.push(
          { id: monthlyPdfIds[0], title: '📄 Monthly Report Ready', message: 'Your Monthly Credit Card PDF is ready.', type: 'INFO', category: 'SYSTEM', date: dateStr, read: false },
          { id: monthlyPdfIds[1], title: '📄 Monthly Report Ready', message: 'Your Monthly Lubricant PDF is ready.', type: 'INFO', category: 'SYSTEM', date: dateStr, read: false },
          { id: monthlyPdfIds[2], title: '📄 Monthly Report Ready', message: 'Your Monthly Expense PDF is ready.', type: 'INFO', category: 'SYSTEM', date: dateStr, read: false },
          { id: monthlyPdfIds[3], title: '📄 Monthly Report Ready', message: 'Your Monthly Fuel Report PDF is ready.', type: 'INFO', category: 'SYSTEM', date: dateStr, read: false },
          { id: monthlyPdfIds[4], title: '📄 Monthly Report Ready', message: 'Your Monthly Employee Report PDF is ready.', type: 'INFO', category: 'SYSTEM', date: dateStr, read: false },
          { id: monthlyPdfIds[5], title: '📄 Monthly Master Report Ready', message: 'Your Complete Monthly Business Report PDF is ready.', type: 'SUCCESS', category: 'SYSTEM', date: dateStr, read: false }
        );
      }

      if (!existingIds.has(yearlyPdfId)) {
        newToInsert.push({
          id: yearlyPdfId,
          title: '📊 Annual Business Report Ready',
          message: 'Your Annual Business Reports are ready for PDF export.',
          type: 'SUCCESS',
          category: 'SYSTEM',
          date: dateStr,
          read: false
        });
      }

      if (newToInsert.length === 0) {
        return prev;
      }

      newToInsert.forEach(n => syncSaveDoc('notifications', n));
      return [...newToInsert, ...prev];
    });

    notifsCheckedRef.current = true;
  }, [notifications]);

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

  const logAuditDelete = (moduleName: string, itemDetails: string) => {
    const notif: AppNotification = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `[AUDIT DELETE] ${moduleName}`,
      message: `${currentUser?.name || 'Admin'} permanently deleted: ${itemDetails}`,
      timestamp: new Date().toLocaleString(),
      date: new Date().toISOString().slice(0, 10),
      category: 'SYSTEM',
      type: 'WARNING',
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
    syncSaveDoc('notifications', notif);
  };

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
    if (!canDelete) return;
    const emp = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    syncDeleteDoc('users', id);
    logAuditDelete('Employee User', emp?.name || id);
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
  };

  const updateDelivery = (id: string, data: Partial<FuelDelivery>) => {
    setDeliveries(prev =>
      prev.map(d => {
        if (d.id === id) {
          const updated = { ...d, ...data };
          syncSaveDoc('deliveries', updated);
          return updated;
        }
        return d;
      })
    );
  };

  const deleteDelivery = (id: string) => {
    if (!canDelete) return;
    const del = deliveries.find(d => d.id === id);
    setDeliveries(prev => prev.filter(d => d.id !== id));
    syncDeleteDoc('deliveries', id);
    logAuditDelete('Fuel Delivery', `${del?.fuelType || 'Fuel'} (Invoice #${del?.invoiceNo || id})`);
  };

  // Fuel Sales Action Handlers
  const addFuelSale = (data: Omit<FuelSale, 'id' | 'createdAt' | 'createdBy'>): { success: boolean; message?: string } => {
    const targetTank = liveTanks.find(t => t.id === data.tankId) || liveTanks.find(t => t.fuelType === data.fuelType);
    if (!targetTank) {
      return { success: false, message: 'Selected tank was not found in the system.' };
    }

    // Check stock availability against live tank stock
    if (data.quantityLiters > targetTank.currentFuel) {
      return {
        success: false,
        message: `Sale quantity (${data.quantityLiters.toLocaleString()} L) exceeds live available stock in ${targetTank.tankName} (${targetTank.currentFuel.toLocaleString()} L).`,
      };
    }

    const calculatedTotal = data.sellingPricePerLiter
      ? Math.round(data.quantityLiters * data.sellingPricePerLiter)
      : data.totalSaleAmount;

    const newSale: FuelSale = {
      ...data,
      id: `sale-${Date.now()}`,
      tankId: targetTank.id,
      tankName: targetTank.tankName,
      totalSaleAmount: calculatedTotal,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'System',
    };

    setFuelSales(prev => [newSale, ...prev]);
    syncSaveDoc('fuelSales', newSale);

    return { success: true };
  };

  const updateFuelSale = (id: string, updatedData: Partial<FuelSale>): { success: boolean; message?: string } => {
    if (!canEdit) {
      return { success: false, message: 'Permission denied. Admin access required.' };
    }

    const oldSale = fuelSales.find(s => s.id === id);
    if (!oldSale) {
      return { success: false, message: 'Fuel sale record not found.' };
    }

    const targetTankId = updatedData.tankId || oldSale.tankId;
    const targetTank = liveTanks.find(t => t.id === targetTankId) || liveTanks.find(t => t.fuelType === (updatedData.fuelType || oldSale.fuelType));
    if (!targetTank) {
      return { success: false, message: 'Selected target tank not found.' };
    }

    const newQty = updatedData.quantityLiters ?? oldSale.quantityLiters;
    const oldQtyInTank = oldSale.tankId === targetTank.id ? oldSale.quantityLiters : 0;
    const effectiveAvailableStock = targetTank.currentFuel + oldQtyInTank;

    if (newQty > effectiveAvailableStock) {
      return {
        success: false,
        message: `Updated sale quantity (${newQty.toLocaleString()} L) exceeds available live stock (${effectiveAvailableStock.toLocaleString()} L).`,
      };
    }

    setFuelSales(prev =>
      prev.map(s => {
        if (s.id === id) {
          const calcTotal = updatedData.sellingPricePerLiter
            ? Math.round(newQty * updatedData.sellingPricePerLiter)
            : updatedData.totalSaleAmount ?? s.totalSaleAmount;

          const updated: FuelSale = {
            ...s,
            ...updatedData,
            tankId: targetTank.id,
            tankName: targetTank.tankName,
            totalSaleAmount: calcTotal,
          };
          syncSaveDoc('fuelSales', updated);
          return updated;
        }
        return s;
      })
    );

    return { success: true };
  };

  const deleteFuelSale = (id: string) => {
    if (!canDelete) return;
    const sale = fuelSales.find(s => s.id === id);
    if (!sale) return;

    setFuelSales(prev => prev.filter(s => s.id !== id));
    syncDeleteDoc('fuelSales', id);
    logAuditDelete('Fuel Sale Entry', `${sale.fuelType} - ${sale.quantityLiters} Litres (${sale.date})`);
  };

  const addTank = (data: Omit<Tank, 'id'>) => {
    const newTank: Tank = {
      ...data,
      id: `tank-${Date.now()}`,
      openingStock: Number(data.openingStock ?? data.currentFuel ?? 0),
      currentFuel: Number(data.openingStock ?? data.currentFuel ?? 0),
      closingStock: Number(data.openingStock ?? data.currentFuel ?? 0),
      createdAt: new Date().toISOString(),
      lastUpdatedTime: new Date().toISOString(),
    };
    setTanks(prev => [...prev, newTank]);
    syncSaveDoc('tanks', newTank);
  };

  const updateTank = (tank: Tank) => {
    if (!canEdit) return;
    const updatedTank = {
      ...tank,
      openingStock: Number(tank.openingStock ?? tank.currentFuel ?? 0),
      lastUpdatedTime: new Date().toISOString(),
    };
    setTanks(prev => prev.map(t => (t.id === tank.id ? updatedTank : t)));
    syncSaveDoc('tanks', updatedTank);
  };

  const deleteTank = (id: string) => {
    if (!canDelete) return;
    const tank = tanks.find(t => t.id === id);
    setTanks(prev => prev.filter(t => t.id !== id));
    syncDeleteDoc('tanks', id);
    logAuditDelete('Tank Unit', tank?.name || id);
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
    const newWorker: Worker = { status: 'Active', ...data, id: newId };
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
    const updatedWorker: Worker = { status: 'Active', ...worker };
    setWorkers(prev => prev.map(w => (w.id === worker.id ? updatedWorker : w)));
    setSalaries(prev =>
      prev.map(s => {
        if (s.workerId === worker.id) {
          const remaining = Math.max(0, (worker.monthlySalary || 0) - s.totalAdvance - s.salaryPaid);
          const updatedSalary: SalaryRecord = {
            ...s,
            monthlySalary: worker.monthlySalary || 0,
            pendingSalary: remaining,
            remainingSalary: remaining,
          };
          syncSaveDoc('salaries', updatedSalary);
          return updatedSalary;
        }
        return s;
      })
    );
    syncSaveDoc('workers', updatedWorker);
  };

  const deleteWorker = (id: string) => {
    if (!canDelete) return;
    setWorkers(prev => prev.filter(w => w.id !== id));
    syncDeleteDoc('workers', id);
  };

  const markAttendance = (workerId: string, status: AttendanceRecord['status'], date: string, notes?: string) => {
    if (!canEdit) return;
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

  const deleteAttendance = (id: string) => {
    if (!canDelete) return;
    setAttendance(prev => prev.filter(a => a.id !== id));
    syncDeleteDoc('attendance', id);
    logAuditDelete('Attendance Record', id);
  };

  const deleteSalaryRecord = (id: string) => {
    if (!canDelete) return;
    setSalaries(prev => prev.filter(s => s.id !== id));
    syncDeleteDoc('salaries', id);
    logAuditDelete('Salary Record', id);
  };

  const deleteAdvanceRecord = (workerId: string, advanceId: string) => {
    if (!canDelete) return;
    setSalaries(prev =>
      prev.map(s => {
        if (s.workerId === workerId) {
          const targetAdv = s.advanceHistory.find(a => a.id === advanceId);
          const advAmount = targetAdv ? targetAdv.amount : 0;
          const newHistory = s.advanceHistory.filter(a => a.id !== advanceId);
          const newTotalAdvance = Math.max(0, s.totalAdvance - advAmount);
          const remaining = Math.max(0, s.monthlySalary - newTotalAdvance - s.salaryPaid);
          const updated = {
            ...s,
            totalAdvance: newTotalAdvance,
            advanceHistory: newHistory,
            remainingSalary: remaining,
            pendingSalary: remaining,
          };
          syncSaveDoc('salaries', updated);
          return updated;
        }
        return s;
      })
    );
    logAuditDelete('Employee Advance', advanceId);
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
      totalCredit: data.totalCredit || 0,
      paymentReceived: data.paymentReceived || 0,
      remainingBalance: (data.totalCredit || 0) - (data.paymentReceived || 0),
      transactions: [],
    };
    setUdhaarCustomers(prev => [...prev, newCust]);
    syncSaveDoc('udhaarCustomers', newCust);
  };

  const updateUdhaarCustomer = (id: string, data: Partial<UdhaarCustomer>) => {
    setUdhaarCustomers(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...data };
          updated.remainingBalance = (updated.totalCredit || 0) - (updated.paymentReceived || 0);
          syncSaveDoc('udhaarCustomers', updated);
          return updated;
        }
        return c;
      })
    );
  };

  const addUdhaarTransaction = (
    customerId: string,
    type: 'CREDIT_PURCHASE' | 'PAYMENT_RECEIVED',
    amount: number,
    description: string,
    vehicleNumber?: string,
    date?: string,
    time?: string
  ) => {
    setUdhaarCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          const totalCredit = type === 'CREDIT_PURCHASE' ? c.totalCredit + amount : c.totalCredit;
          const paymentReceived = type === 'PAYMENT_RECEIVED' ? c.paymentReceived + amount : c.paymentReceived;
          const remaining = totalCredit - paymentReceived;
          const newTx: UdhaarTransaction = {
            id: `ut-${Date.now()}`,
            date: date || new Date().toISOString().slice(0, 10),
            time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type,
            amount,
            description,
            vehicleNumber,
            runningBalance: remaining,
          };
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

  const editUdhaarTransaction = (customerId: string, txId: string, updatedTx: Partial<UdhaarTransaction>) => {
    setUdhaarCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          const newTxs = c.transactions.map(t => (t.id === txId ? { ...t, ...updatedTx } : t));
          let totalCredit = 0;
          let paymentReceived = 0;
          newTxs.forEach(t => {
            if (t.type === 'CREDIT_PURCHASE') totalCredit += t.amount;
            else if (t.type === 'PAYMENT_RECEIVED') paymentReceived += t.amount;
          });
          const remaining = totalCredit - paymentReceived;
          const updated = {
            ...c,
            totalCredit,
            paymentReceived,
            remainingBalance: remaining,
            transactions: newTxs,
          };
          syncSaveDoc('udhaarCustomers', updated);
          return updated;
        }
        return c;
      })
    );
  };

  const deleteUdhaarTransaction = (customerId: string, txId: string) => {
    if (!canDelete) return;
    setUdhaarCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          const targetTx = c.transactions.find(t => t.id === txId);
          if (!targetTx) return c;
          const newTxs = c.transactions.filter(t => t.id !== txId);
          const totalCredit = targetTx.type === 'CREDIT_PURCHASE' ? Math.max(0, c.totalCredit - targetTx.amount) : c.totalCredit;
          const paymentReceived = targetTx.type === 'PAYMENT_RECEIVED' ? Math.max(0, c.paymentReceived - targetTx.amount) : c.paymentReceived;
          const remaining = totalCredit - paymentReceived;
          const updated = {
            ...c,
            totalCredit,
            paymentReceived,
            remainingBalance: remaining,
            transactions: newTxs,
          };
          syncSaveDoc('udhaarCustomers', updated);
          return updated;
        }
        return c;
      })
    );
    logAuditDelete('Credit Transaction', txId);
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

  const updateExpense = (id: string, data: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(e => {
        if (e.id === id) {
          const updated = { ...e, ...data };
          syncSaveDoc('expenses', updated);
          return updated;
        }
        return e;
      })
    );
  };

  const deleteExpense = (id: string) => {
    if (!canDelete) return;
    const exp = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    syncDeleteDoc('expenses', id);
    logAuditDelete('Expense Record', `${exp?.category || 'Expense'} (Rs. ${exp?.amount || 0})`);
  };

  // Bank
  const addBankAccount = (data: Omit<BankAccount, 'id'>) => {
    const newBank: BankAccount = { ...data, id: `bank-${Date.now()}`, currentBalance: data.currentBalance || 0 };
    setBankAccounts(prev => [...prev, newBank]);
    syncSaveDoc('bankAccounts', newBank);
  };

  const deleteBankAccount = (id: string) => {
    if (!canDelete) return;
    const bank = bankAccounts.find(b => b.id === id);
    setBankAccounts(prev => prev.filter(b => b.id !== id));
    syncDeleteDoc('bankAccounts', id);
    logAuditDelete('Bank Account', bank?.bankName || id);
  };

  const deleteUdhaarCustomer = (id: string) => {
    if (!canDelete) return;
    const cust = udhaarCustomers.find(c => c.id === id);
    setUdhaarCustomers(prev => prev.filter(c => c.id !== id));
    syncDeleteDoc('udhaarCustomers', id);
    logAuditDelete('Udhaar Customer', cust?.customerName || cust?.name || id);
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

  const deleteBankTransaction = (id: string) => {
    if (!canDelete) return;
    const tx = bankTransactions.find(b => b.id === id);
    setBankTransactions(prev => prev.filter(b => b.id !== id));
    syncDeleteDoc('bankTransactions', id);
    if (tx) {
      setBankAccounts(prev =>
        prev.map(b => {
          if (b.id === tx.bankId) {
            const change = tx.type === 'Deposit' ? -tx.amount : tx.amount;
            const updated = { ...b, currentBalance: b.currentBalance + change };
            syncSaveDoc('bankAccounts', updated);
            return updated;
          }
          return b;
        })
      );
    }
    logAuditDelete('Bank Transaction', id);
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

  const deleteCreditCardSale = (id: string) => {
    if (!canDelete) return;
    const sale = creditCardSales.find(c => c.id === id);
    setCreditCardSales(prev => prev.filter(c => c.id !== id));
    syncDeleteDoc('creditCardSales', id);
    logAuditDelete('Credit Card Sale', `Rs. ${sale?.amount || 0}`);
  };

  const addInfiniCardSale = (data: Omit<InfiniCardTransaction, 'id'>) => {
    const newTx: InfiniCardTransaction = { ...data, id: `inf-${Date.now()}` };
    setInfiniCardSales(prev => [newTx, ...prev]);
    syncSaveDoc('infiniCardSales', newTx);
  };

  const deleteInfiniCardSale = (id: string) => {
    if (!canDelete) return;
    const sale = infiniCardSales.find(s => s.id === id);
    setInfiniCardSales(prev => prev.filter(s => s.id !== id));
    syncDeleteDoc('infiniCardSales', id);
    logAuditDelete('Infini Card Sale', `Rs. ${sale?.amount || 0}`);
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

  const deleteRentalAgreement = (id: string) => {
    if (!canDelete) return;
    const rent = rentalAgreements.find(r => r.id === id);
    setRentalAgreements(prev => prev.filter(r => r.id !== id));
    syncDeleteDoc('rentalAgreements', id);
    logAuditDelete('Rental Agreement', rent?.tenantName || id);
  };

  const clearModuleData = (moduleKey: string) => {
    if (!canDelete) return;
    logAuditDelete(`Module Section [${moduleKey}]`, `Entire section cleared by Admin`);
    if (moduleKey === 'tanks') { tanks.forEach(t => syncDeleteDoc('tanks', t.id)); setTanks([]); }
    else if (moduleKey === 'deliveries') { deliveries.forEach(d => syncDeleteDoc('deliveries', d.id)); setDeliveries([]); }
    else if (moduleKey === 'workers') { workers.forEach(w => syncDeleteDoc('workers', w.id)); setWorkers([]); setSalaries([]); }
    else if (moduleKey === 'expenses') { expenses.forEach(e => syncDeleteDoc('expenses', e.id)); setExpenses([]); }
    else if (moduleKey === 'bankAccounts') { bankAccounts.forEach(b => syncDeleteDoc('bankAccounts', b.id)); setBankAccounts([]); }
    else if (moduleKey === 'udhaarCustomers') { udhaarCustomers.forEach(c => syncDeleteDoc('udhaarCustomers', c.id)); setUdhaarCustomers([]); }
    else if (moduleKey === 'lubricants') { lubricants.forEach(l => syncDeleteDoc('lubricants', l.id)); setLubricants([]); }
    else if (moduleKey === 'creditCardSales') { creditCardSales.forEach(c => syncDeleteDoc('creditCardSales', c.id)); setCreditCardSales([]); }
    else if (moduleKey === 'infiniCardSales') { infiniCardSales.forEach(s => syncDeleteDoc('infiniCardSales', s.id)); setInfiniCardSales([]); }
    else if (moduleKey === 'rentalAgreements') { rentalAgreements.forEach(r => syncDeleteDoc('rentalAgreements', r.id)); setRentalAgreements([]); }
    else if (moduleKey === 'dailySalesEntries') { dailySalesEntries.forEach(d => syncDeleteDoc('dailySalesEntries', d.id)); setDailySalesEntries([]); }
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
            status: (pending === 0 ? 'Paid' : 'Pending') as 'Paid' | 'Pending' | 'Overdue',
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

  const deleteRestaurantPurchase = (id: string) => {
    if (!canDelete) return;
    setRestaurantPurchases(prev => prev.filter(p => p.id !== id));
    syncDeleteDoc('restaurantPurchases', id);
  };

  const addRestaurantDeposit = (data: Omit<RestaurantDeposit, 'id'>) => {
    const newDep: RestaurantDeposit = { ...data, id: `rdep-${Date.now()}` };
    setRestaurantDeposits(prev => [newDep, ...prev]);
    syncSaveDoc('restaurantDeposits', newDep);
  };

  const deleteRestaurantDeposit = (id: string) => {
    if (!canDelete) return;
    setRestaurantDeposits(prev => prev.filter(d => d.id !== id));
    syncDeleteDoc('restaurantDeposits', id);
  };

  const deleteRestaurantAttendance = (id: string) => {
    if (!canDelete) return;
    setRestaurantAttendance(prev => prev.filter(a => a.id !== id));
    syncDeleteDoc('restaurantAttendance', id);
  };

  const deleteRestaurantSalary = (id: string) => {
    if (!canDelete) return;
    setRestaurantSalaries(prev => prev.filter(s => s.id !== id));
    syncDeleteDoc('restaurantSalaries', id);
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

  // Live Tank Stock Synchronization Calculation
  // Ground Truth: Current Tank Stock = Opening Stock + Total Fuel Delivered - Total Fuel Sold
  const liveTanks = useMemo(() => {
    return tanks.map(tank => {
      const openingStock = Number(tank.openingStock ?? tank.currentFuel ?? 0);

      // Total fuel delivered to this tank
      const totalFuelDelivered = deliveries.reduce((sum, d) => {
        const matchesTankId = d.tankId === tank.id;
        const matchesFuelType = !d.tankId && (
          d.fuelType === tank.fuelType ||
          ((d.fuelType as string) === 'Petrol' && tank.fuelType === 'Super Petrol') ||
          ((d.fuelType as string) === 'Diesel' && tank.fuelType === 'High-Speed Diesel (HSD)')
        );
        if (matchesTankId || matchesFuelType) {
          return sum + (Number(d.totalLitersReceived) || 0);
        }
        return sum;
      }, 0);

      // Total fuel sold from this tank
      const totalFuelSold = fuelSales.reduce((sum, s) => {
        const matchesTankId = s.tankId === tank.id;
        const matchesFuelType = !s.tankId && (
          s.fuelType === tank.fuelType ||
          ((s.fuelType as string) === 'Petrol' && tank.fuelType === 'Super Petrol') ||
          ((s.fuelType as string) === 'Diesel' && tank.fuelType === 'High-Speed Diesel (HSD)')
        );
        if (matchesTankId || matchesFuelType) {
          return sum + (Number(s.quantityLiters) || 0);
        }
        return sum;
      }, 0);

      const calculatedStock = Math.max(0, openingStock + totalFuelDelivered - totalFuelSold);

      // Determine last updated time
      let lastUpdated = tank.lastUpdatedTime || tank.createdAt || new Date().toISOString();

      deliveries.forEach(d => {
        if (d.tankId === tank.id || (!d.tankId && d.fuelType === tank.fuelType)) {
          const dt = d.createdAt || d.deliveryDate;
          if (dt && new Date(dt).getTime() > new Date(lastUpdated).getTime()) {
            lastUpdated = dt;
          }
        }
      });

      fuelSales.forEach(s => {
        if (s.tankId === tank.id || (!s.tankId && s.fuelType === tank.fuelType)) {
          const st = s.createdAt || s.date;
          if (st && new Date(st).getTime() > new Date(lastUpdated).getTime()) {
            lastUpdated = st;
          }
        }
      });

      return {
        ...tank,
        openingStock,
        totalFuelDelivered,
        totalFuelSold,
        currentFuel: calculatedStock,
        closingStock: calculatedStock,
        lastUpdatedTime: lastUpdated,
      };
    });
  }, [tanks, deliveries, fuelSales]);

  useEffect(() => {
    saveLocal('tanks', liveTanks);
  }, [liveTanks]);

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
        tanks: liveTanks,
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
        fuelSales,
        addFuelSale,
        updateFuelSale,
        deleteFuelSale,
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
        updateDelivery,
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
        deleteAttendance,
        addSalaryAdvance,
        deleteAdvanceRecord,
        paySalary,
        deleteSalaryRecord,
        addUdhaarCustomer,
        updateUdhaarCustomer,
        addUdhaarTransaction,
        editUdhaarTransaction,
        deleteUdhaarTransaction,
        addExpenseCategory,
        addExpense,
        updateExpense,
        deleteExpense,
        addBankAccount,
        deleteBankAccount,
        addBankTransaction,
        deleteBankTransaction,
        deleteUdhaarCustomer,
        updateCashRegister,
        addCreditCardSale,
        deleteCreditCardSale,
        addInfiniCardSale,
        deleteInfiniCardSale,
        updateShopData,
        addRentalAgreement,
        deleteRentalAgreement,
        receiveRentPayment,
        clearModuleData,
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
        deleteRestaurantPurchase,
        addRestaurantDeposit,
        deleteRestaurantDeposit,
        deleteRestaurantAttendance,
        deleteRestaurantSalary,
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
