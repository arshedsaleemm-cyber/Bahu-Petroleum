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

export const initialUsers: User[] = [
  {
    id: 'u-admin-1',
    name: 'Mian Rashid Saleem',
    email: 'admin@bahupetroleum.com',
    phonePrimary: '03009654471',
    phoneSecondary: '03129654471',
    password: 'admin',
    role: 'ADMIN',
    designation: 'CEO & Founder',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export const initialTanks: Tank[] = [
  {
    id: 'tank-1',
    tankName: 'Tank 1 - Super Petrol Main',
    fuelType: 'Petrol',
    capacity: 0,
    currentFuel: 0,
    openingStock: 0,
    closingStock: 0,
    dailyUsage: 0,
    lowStockThreshold: 0,
    notes: 'Primary Petrol Tank',
  },
  {
    id: 'tank-2',
    tankName: 'Tank 2 - High Speed Diesel Main',
    fuelType: 'Diesel',
    capacity: 0,
    currentFuel: 0,
    openingStock: 0,
    closingStock: 0,
    dailyUsage: 0,
    lowStockThreshold: 0,
    notes: 'Primary Diesel Tank',
  },
];

export const initialDeliveries: FuelDelivery[] = [];
export const initialLubricants: LubricantProduct[] = [];
export const initialWorkers: Worker[] = [];
export const initialAttendance: AttendanceRecord[] = [];
export const initialSalaries: SalaryRecord[] = [];
export const initialUdhaarCustomers: UdhaarCustomer[] = [];

export const initialCategories: ExpenseCategory[] = [
  { id: 'cat-1', name: 'Electricity Bill' },
  { id: 'cat-2', name: 'Water & Sanitation' },
  { id: 'cat-3', name: 'Generator Diesel & Maintenance' },
  { id: 'cat-4', name: 'Staff Food & Refreshments' },
  { id: 'cat-5', name: 'Station Cleaning & Supplies' },
  { id: 'cat-6', name: 'Government Taxes & Licenses' },
  { id: 'cat-7', name: 'Miscellaneous Expense' },
];

export const initialExpenses: Expense[] = [];
export const initialBankAccounts: BankAccount[] = [];
export const initialBankTransactions: BankTransaction[] = [];

export const initialCashRegister: CashRegister = {
  id: 'cr-1',
  date: new Date().toISOString().split('T')[0],
  openingCash: 0,
  closingCash: 0,
  cashReceived: 0,
  cashBalance: 0,
  notes: 'Clean initial register',
};

export const initialCreditCardSales: CreditCardTransaction[] = [];
export const initialInfiniCardSales: InfiniCardTransaction[] = [];

export const initialShops: ShopModuleData[] = [
  {
    id: 'shop-tyre',
    shopType: 'Tyre Shop',
    monthlyRent: 0,
    rentReceived: 0,
    rentPending: 0,
    dailyIncome: 0,
    monthlyIncome: 0,
    yearlyIncome: 0,
    expenses: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'shop-wash',
    shopType: 'Car Wash',
    monthlyRent: 0,
    rentReceived: 0,
    rentPending: 0,
    dailyIncome: 0,
    monthlyIncome: 0,
    yearlyIncome: 0,
    expenses: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'shop-tuck',
    shopType: 'Tuck Shop',
    monthlyRent: 0,
    rentReceived: 0,
    rentPending: 0,
    dailyIncome: 0,
    monthlyIncome: 0,
    yearlyIncome: 0,
    expenses: 0,
    lastUpdated: new Date().toISOString(),
  },
];

export const initialRentalAgreements: RentalAgreement[] = [];
export const initialNotifications: AppNotification[] = [];

// Clean initial data for sub-business services
export const initialTyreServices: TyreShopService[] = [];
export const initialCarWashServices: CarWashService[] = [];
export const initialTuckShopItems: TuckShopItem[] = [];

// Clean initial data for Restaurant
export const initialRestaurantSales: RestaurantSale[] = [];
export const initialRestaurantExpenses: RestaurantExpense[] = [];
export const initialRestaurantStaff: RestaurantStaff[] = [];
export const initialRestaurantAttendance: RestaurantAttendance[] = [];
export const initialRestaurantSalaries: RestaurantSalaryRecord[] = [];
export const initialRestaurantSuppliers: RestaurantSupplier[] = [];
export const initialRestaurantInventory: RestaurantKitchenInventory[] = [];
export const initialRestaurantPurchases: RestaurantPurchase[] = [];
export const initialRestaurantDeposits: RestaurantDeposit[] = [];

// Sample Daily Sales Entries for all modules
export const initialDailySalesEntries: DailySalesEntry[] = [
  {
    id: 'dse-1',
    date: '2026-07-25',
    section: 'Car Wash',
    totalSales: 18500,
    notes: '25 Cars washed today including 4 full body service washes',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-2',
    date: '2026-07-25',
    section: 'Fast Food',
    totalSales: 34200,
    notes: 'Peak dinner hours sales',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-3',
    date: '2026-07-25',
    section: 'Tyre Shop',
    totalSales: 22000,
    notes: 'Tyre punctures & 2 new tyre sales',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-4',
    date: '2026-07-25',
    section: 'Tuck Shop',
    totalSales: 41800,
    notes: 'Beverages and snacks daily counter total',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-5',
    date: '2026-07-25',
    section: 'Credit Card',
    totalSales: 125000,
    notes: 'Total POS machines credit card receipts batch Settlement',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-6',
    date: '2026-07-25',
    section: 'Infinity Card',
    totalSales: 88500,
    notes: 'Fleet card terminal settlement total',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-7',
    date: '2026-07-25',
    section: 'Lubricants',
    totalSales: 54000,
    notes: 'Engine oil cans & lube sales daily total',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-8',
    date: '2026-07-25',
    section: 'Daily Petrol Cash',
    totalSales: 420000,
    notes: 'Total physical cash collected from petrol shift sales',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-9',
    date: '2026-07-24',
    section: 'Car Wash',
    totalSales: 16000,
    notes: 'Regular Thursday washing counter',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-10',
    date: '2026-07-24',
    section: 'Fast Food',
    totalSales: 29800,
    notes: 'Total daily food counter',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-11',
    date: '2026-07-24',
    section: 'Credit Card',
    totalSales: 112000,
    notes: 'Thursday credit card terminal total',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-12',
    date: '2026-07-24',
    section: 'Infinity Card',
    totalSales: 76000,
    notes: 'Infinity fleet cards Thursday total',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dse-13',
    date: '2026-07-24',
    section: 'Daily Petrol Cash',
    totalSales: 395000,
    notes: 'Total cash received from petrol counter yesterday',
    createdBy: 'Mian Rashid Saleem',
    createdAt: new Date().toISOString(),
  },
];

