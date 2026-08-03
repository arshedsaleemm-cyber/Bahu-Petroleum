export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  password?: string;
  role: UserRole;
  designation?: string;
  active: boolean;
  createdAt: string;
}

export type FuelType = 'Super Petrol' | 'High-Speed Diesel (HSD)' | 'Excellium High-Octane';

export interface FuelDelivery {
  id: string;
  deliveryDate: string;
  deliveryTime: string;
  fuelType: FuelType;
  petrolLiters: number;
  dieselLiters: number;
  supplierName: string;
  invoiceNumber: string;
  invoiceNo?: string;
  vehicleNumber?: string;
  driverName?: string;
  totalLitersReceived: number;
  fuelRate?: number;
  purchaseRatePetrol: number;
  purchaseRateDiesel: number;
  totalPurchaseAmount: number;
  tankId?: string;
  tankName?: string;
  // Dip Measurement Verification
  expectedDip?: number;
  actualDip?: number;
  dipDifference?: number; // actualDip - expectedDip
  shortageDip?: number; // negative value if shortage, else 0
  shortageLiters?: number;
  receivedByWorker?: string;
  adminApprovalStatus?: 'Approved' | 'Pending' | 'Rejected';
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface Tank {
  id: string;
  tankName: string;
  name?: string;
  fuelType: FuelType;
  capacity: number; // in Liters
  currentFuel: number; // in Liters (Live calculated: openingStock + totalFuelDelivered - totalFuelSold)
  openingStock: number;
  closingStock: number;
  dailyUsage: number;
  lowStockThreshold: number; // default 20%
  notes?: string;
  totalFuelDelivered?: number;
  totalFuelSold?: number;
  lastUpdatedTime?: string;
  createdAt?: string;
}

export interface LubricantProduct {
  id: string;
  productName: string;
  brand: string;
  category: 'Engine Oil' | 'Gear Oil' | 'Brake Fluid' | 'Grease' | 'Additives';
  barcode: string;
  purchaseDate: string;
  supplier: string;
  purchasePrice: number;
  sellingPrice: number;
  stockIn: number;
  stockOut: number;
  remainingStock: number;
  lowStockAlert: number;
  imageUrl?: string;
  notes?: string;
}

export interface Worker {
  id: string;
  name: string;
  monthlySalary: number;
  photoUrl?: string;
  fatherName?: string;
  phoneNumber?: string;
  cnic?: string;
  address?: string;
  designation?: string;
  joiningDate?: string;
  status?: 'Active' | 'Inactive';
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'Half Day';

export interface AttendanceRecord {
  id: string;
  workerId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface SalaryAdvanceLog {
  id: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface SalaryRecord {
  id: string;
  workerId: string;
  monthlySalary: number;
  totalAdvance: number;
  advanceHistory: SalaryAdvanceLog[];
  salaryPaid: number;
  pendingSalary: number;
  remainingSalary: number;
  lastPaymentDate?: string;
}

export interface UdhaarTransaction {
  id: string;
  date: string;
  time?: string;
  type: 'CREDIT_PURCHASE' | 'PAYMENT_RECEIVED';
  amount: number;
  description: string;
  vehicleNumber?: string;
  receiptNumber?: string;
  runningBalance?: number;
}

export interface UdhaarCustomer {
  id: string;
  customerName: string;
  name?: string;
  phoneNumber: string;
  vehicleNumber: string;
  address: string;
  cnic?: string;
  creditLimit: number;
  totalCredit: number;
  paymentReceived: number;
  remainingBalance: number;
  transactions: UdhaarTransaction[];
  notes?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isCustom?: boolean;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  time: string;
  description: string;
  receiptPhotoUrl?: string;
  notes?: string;
  createdBy: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountTitle: string;
  currentBalance: number;
  iban?: string;
  branchName?: string;
  branchCode?: string;
  transactions?: BankTransaction[];
}

export interface BankTransaction {
  id: string;
  bankId: string;
  bankName: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer';
  amount: number;
  referenceNumber: string;
  depositSlipUrl?: string;
  date: string;
  notes?: string;
  createdBy: string;
}

export interface CashRegister {
  id: string;
  date: string;
  openingCash: number;
  closingCash: number;
  cashReceived: number;
  cashBalance: number;
  totalCashOnHand?: number;
  notes?: string;
}

export interface CreditCardTransaction {
  id: string;
  date: string;
  time: string;
  terminalId: string;
  amount: number;
  customerName?: string;
  receiptNo: string;
  notes?: string;
}

export interface InfiniCardTransaction {
  id: string;
  date: string;
  time: string;
  cardNumber: string;
  fleetName: string;
  vehicleNumber: string;
  amount: number;
  liters: number;
  fuelType: 'Petrol' | 'Diesel';
  receiptNo: string;
  notes?: string;
}

export interface TyreShopService {
  id: string;
  serviceType: 'Puncture Repair' | 'Air Filling' | 'Wheel Alignment' | 'Wheel Balancing' | 'New Tyre Sales' | 'Used Tyre Sales';
  customerName: string;
  vehicleNumber: string;
  vehicleType: 'Bike' | 'Car' | 'Truck' | 'Bus';
  serviceCost: number;
  paymentMethod: 'Cash' | 'Credit Card' | 'Udhaar';
  technicianName: string;
  dateTime: string;
  notes?: string;
}

export interface CarWashService {
  id: string;
  vehicleCategory: 'Car' | 'SUV' | 'Bus' | 'Truck' | 'Bike';
  washPackage: 'Normal Wash' | 'Service Wash' | 'Foam Wash' | 'Interior Detailing' | 'Engine Wash' | 'Underbody Wash';
  customerName: string;
  vehicleNumber: string;
  serviceFee: number;
  paymentStatus: 'Paid' | 'Unpaid';
  washerWorker: string;
  dateTime: string;
  notes?: string;
}

export interface TuckShopItem {
  id: string;
  itemName: string;
  category: 'Beverages' | 'Snacks' | 'Cigarettes' | 'Biscuits' | 'Dairy' | 'Accessories';
  barcode: string;
  stockQty: number;
  purchasePrice: number;
  salePrice: number;
  reorderLevel: number;
  notes?: string;
}

export interface ShopModuleData {
  id: string;
  shopType: 'Tyre Shop' | 'Car Wash' | 'Tuck Shop';
  tenantName?: string;
  monthlyRent: number;
  rentReceived: number;
  rentPending: number;
  dailyIncome: number;
  monthlyIncome: number;
  yearlyIncome: number;
  totalCarsWashed?: number;
  employeeCharges?: number;
  waterExpenses?: number;
  expenses: number;
  notes?: string;
  lastUpdated: string;
}

export interface RentalAgreement {
  id: string;
  shopName: string;
  tenantName: string;
  phoneNumber: string;
  monthlyRent: number;
  securityDeposit: number;
  dueDate: string; // e.g. "5th of every month" or "2026-08-05"
  amountPaid: number;
  pendingAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentHistory: {
    id: string;
    date: string;
    amount: number;
    monthPaidFor: string;
    receiptNo: string;
  }[];
  notes?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'WARNING' | 'INFO' | 'ALERT' | 'SUCCESS';
  category: 'STOCK' | 'RENT' | 'SALARY' | 'BILL' | 'SYSTEM' | 'DELIVERY';
  date: string;
  timestamp?: string;
  read: boolean;
}

export interface SyncStatus {
  online: boolean;
  lastSyncedAt: string;
  syncing: boolean;
}

// RESTAURANT MODULE TYPES
export interface RestaurantSale {
  id: string;
  date: string;
  time: string;
  customerName?: string;
  orderType: 'Dine-In' | 'Takeaway' | 'Delivery';
  paymentMethod: 'Cash' | 'Credit Card' | 'Infini Card' | 'Bank Deposit';
  totalAmount: number;
  discount?: number;
  netAmount: number;
  notes?: string;
  createdBy: string;
}

export interface RestaurantExpense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  time: string;
  paymentMethod: 'Cash' | 'Bank';
  description?: string;
  notes?: string;
  createdBy: string;
}

export interface RestaurantStaff {
  id: string;
  name: string;
  designation: string;
  phone?: string;
  monthlySalary: number;
  joiningDate?: string;
  status: 'Active' | 'Inactive';
}

export interface RestaurantAttendance {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Half Day';
  notes?: string;
}

export interface RestaurantSalaryRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  amountPaid: number;
  advanceDeducted: number;
  netPaid: number;
  notes?: string;
}

export interface RestaurantSupplier {
  id: string;
  supplierName: string;
  contactPerson?: string;
  phone?: string;
  category?: string;
  address?: string;
  notes?: string;
}

export interface RestaurantKitchenInventory {
  id: string;
  itemName: string;
  category: 'Raw Food' | 'Spices' | 'Beverages' | 'Packaging' | 'Cleaning' | 'Other';
  unit: 'Kg' | 'Liter' | 'Pack' | 'Carton' | 'Item';
  currentStock: number;
  minStockAlert: number;
  unitCost: number;
  supplierName?: string;
  lastUpdated: string;
}

export interface RestaurantPurchase {
  id: string;
  date: string;
  supplierName: string;
  itemName: string;
  quantity: number;
  unit: string;
  totalCost: number;
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  notes?: string;
}

export interface RestaurantDeposit {
  id: string;
  date: string;
  bankName: string;
  accountNumber?: string;
  amount: number;
  referenceNo?: string;
  notes?: string;
}

// DAILY SALES MODULE TYPES FOR ALL SUB-BUSINESSES & CASH/CARDS
export type DailySalesSection =
  | 'Car Wash'
  | 'Fast Food'
  | 'Tyre Shop'
  | 'Tuck Shop'
  | 'Lubricants'
  | 'Credit Card'
  | 'Infinity Card'
  | 'Daily Petrol Cash';

export interface DailySalesEntry {
  id: string;
  date: string; // YYYY-MM-DD
  section: DailySalesSection;
  fuelType?: FuelType;
  totalSales: number; // PKR
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface FuelSale {
  id: string;
  date: string; // YYYY-MM-DD
  fuelType: FuelType;
  tankId: string;
  tankName?: string;
  quantityLiters: number;
  sellingPricePerLiter?: number;
  totalSaleAmount: number; // calculated as quantityLiters * sellingPricePerLiter
  notes?: string;
  createdBy?: string;
  createdAt?: string;
}

