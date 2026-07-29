import {
  DateFilterRange,
  getDateRangeDates,
  isDateInRange,
  generateProfessionalPDF,
  PDFSection,
} from './pdfGenerator';
import { formatCurrency, formatLiters } from './formatters';

export type ModuleReportKey =
  | 'DASHBOARD'
  | 'FUEL_SALES'
  | 'DELIVERIES'
  | 'TANKS'
  | 'TANK_STOCK'
  | 'SHORTAGE'
  | 'DAILY_CASH'
  | 'LUBRICANTS'
  | 'WORKERS'
  | 'ATTENDANCE'
  | 'SALARY'
  | 'ADVANCES'
  | 'PENDING_SALARY'
  | 'CREDIT_CARD'
  | 'INFINI_CARD'
  | 'BANK'
  | 'EXPENSES'
  | 'TAXES'
  | 'CAR_WASH'
  | 'TYRE_SHOP'
  | 'TUCK_SHOP'
  | 'RESTAURANT'
  | 'PROFIT_LOSS'
  | 'CREDIT_CUSTOMERS'
  | 'COMPLETE_BUSINESS';

export const exportModulePDF = (
  moduleKey: ModuleReportKey,
  filter: DateFilterRange,
  appState: any
) => {
  const { start, end, label } = getDateRangeDates(filter);
  const range = { start, end };

  switch (moduleKey) {
    case 'DASHBOARD': {
      const fuelSales = (appState.dailySalesEntries || []).filter((e: any) => isDateInRange(e.date, range));
      const totalFuelRev = fuelSales.reduce((sum: number, e: any) => sum + (e.totalSales || 0), 0);
      const deliveryCost = (appState.deliveries || [])
        .filter((d: any) => isDateInRange(d.deliveryDate, range))
        .reduce((sum: number, d: any) => sum + (d.totalPurchaseAmount || 0), 0);
      const expenseAmt = (appState.expenses || [])
        .filter((e: any) => isDateInRange(e.date, range))
        .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      const netProfit = totalFuelRev - deliveryCost - expenseAmt;

      const sections: PDFSection[] = [
        {
          title: 'Executive Dashboard Financial Overview',
          summaryCards: [
            { label: 'Total Fuel Revenue', value: formatCurrency(totalFuelRev) },
            { label: 'Fuel Purchases', value: formatCurrency(deliveryCost) },
            { label: 'Operating Expenses', value: formatCurrency(expenseAmt) },
            { label: 'Net Operating Profit', value: formatCurrency(netProfit) },
          ],
          headers: ['Metric Category', 'Status / Volume / Value'],
          rows: [
            ['Active Fuel Tanks', `${(appState.tanks || []).length} Underground Tanks`],
            ['Total Tank Fuel Capacity', formatLiters((appState.tanks || []).reduce((s: number, t: any) => s + t.capacity, 0))],
            ['Current Fuel Stock', formatLiters((appState.tanks || []).reduce((s: number, t: any) => s + t.currentFuel, 0))],
            ['Registered Workers', `${(appState.workers || []).length} Employees`],
            ['Cash in Register', formatCurrency(appState.cashRegister?.cashBalance || 0)],
            ['Total Bank Balance', formatCurrency((appState.bankAccounts || []).reduce((s: number, b: any) => s + b.currentBalance, 0))],
          ],
        },
      ];
      generateProfessionalPDF('Executive Dashboard Summary Report', label, sections, 'Dashboard_Summary');
      break;
    }

    case 'FUEL_SALES': {
      const sales = (appState.dailySalesEntries || []).filter((e: any) => isDateInRange(e.date, range));
      const totalSalesAmt = sales.reduce((sum: number, e: any) => sum + (e.totalSales || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Daily Petrol & Fuel Cash Sales Log',
          summaryCards: [
            { label: 'Total Sales Entries', value: `${sales.length} Logged` },
            { label: 'Total Revenue Collected', value: formatCurrency(totalSalesAmt) },
          ],
          headers: ['Date', 'Business Section', 'Sales Amount', 'Recorded By', 'Notes'],
          rows: sales.map((e: any) => [
            e.date,
            e.section || 'Main Dispenser',
            formatCurrency(e.totalSales || 0),
            e.createdBy || 'Admin',
            e.notes || '-',
          ]),
        },
      ];
      generateProfessionalPDF('Fuel Sales Report', label, sections, 'Fuel_Sales_Report');
      break;
    }

    case 'DELIVERIES': {
      const deliveries = (appState.deliveries || []).filter((d: any) => isDateInRange(d.deliveryDate, range));
      const totalLiters = deliveries.reduce((sum: number, d: any) => sum + (d.totalLitersReceived || 0), 0);
      const totalCost = deliveries.reduce((sum: number, d: any) => sum + (d.totalPurchaseAmount || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Fuel Tanker Shipments Received Log',
          summaryCards: [
            { label: 'Total Deliveries', value: `${deliveries.length} Tankers` },
            { label: 'Total Fuel Received', value: formatLiters(totalLiters) },
            { label: 'Total Purchase Invoice', value: formatCurrency(totalCost) },
          ],
          headers: ['Date', 'Supplier', 'Invoice #', 'Fuel Type', 'Quantity', 'Purchase Cost', 'Tank'],
          rows: deliveries.map((d: any) => [
            d.deliveryDate,
            d.supplierName,
            d.invoiceNumber,
            d.fuelType,
            formatLiters(d.totalLitersReceived),
            formatCurrency(d.totalPurchaseAmount),
            d.destinationTank || 'Tank 1',
          ]),
        },
      ];
      generateProfessionalPDF('Fuel Deliveries Report', label, sections, 'Fuel_Deliveries_Report');
      break;
    }

    case 'TANKS':
    case 'TANK_STOCK': {
      const tanks = appState.tanks || [];
      const totalCap = tanks.reduce((sum: number, t: any) => sum + t.capacity, 0);
      const totalStock = tanks.reduce((sum: number, t: any) => sum + t.currentFuel, 0);

      const sections: PDFSection[] = [
        {
          title: 'Underground Tank Stock Audit',
          summaryCards: [
            { label: 'Total Underground Tanks', value: `${tanks.length}` },
            { label: 'Total Storage Capacity', value: formatLiters(totalCap) },
            { label: 'Current Fuel Level', value: formatLiters(totalStock) },
          ],
          headers: ['Tank Name', 'Fuel Product', 'Capacity', 'Current Fuel', 'Stock %', 'Status'],
          rows: tanks.map((t: any) => {
            const pct = Math.round((t.currentFuel / t.capacity) * 100);
            return [
              t.tankName,
              t.fuelType,
              formatLiters(t.capacity),
              formatLiters(t.currentFuel),
              `${pct}%`,
              t.currentFuel <= t.lowStockThreshold ? '⚠️ LOW STOCK' : '🟢 Optimal',
            ];
          }),
        },
      ];
      generateProfessionalPDF('Tank Management & Stock Report', label, sections, 'Tank_Management_Report');
      break;
    }

    case 'SHORTAGE': {
      const deliveries = (appState.deliveries || []).filter(
        (d: any) => isDateInRange(d.deliveryDate, range) && d.shortageLiters > 0
      );
      const totalShortLiters = deliveries.reduce((sum: number, d: any) => sum + (d.shortageLiters || 0), 0);
      const totalShortAmt = deliveries.reduce((sum: number, d: any) => sum + (d.shortageAmount || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Tanker Delivery Shortage Audit',
          summaryCards: [
            { label: 'Shortage Incidents', value: `${deliveries.length}` },
            { label: 'Total Shortage Volume', value: formatLiters(totalShortLiters) },
            { label: 'Total Shortage Claim (PKR)', value: formatCurrency(totalShortAmt) },
          ],
          headers: ['Delivery Date', 'Supplier', 'Invoice #', 'Expected Liters', 'Shortage Liters', 'Deducted Amount'],
          rows: deliveries.map((d: any) => [
            d.deliveryDate,
            d.supplierName,
            d.invoiceNumber,
            formatLiters(d.invoiceLiters || d.totalLitersReceived),
            formatLiters(d.shortageLiters),
            formatCurrency(d.shortageAmount || 0),
          ]),
        },
      ];
      generateProfessionalPDF('Fuel Shortage Claims Report', label, sections, 'Fuel_Shortage_Report');
      break;
    }

    case 'DAILY_CASH': {
      const cashEntries = (appState.dailySalesEntries || []).filter((e: any) => isDateInRange(e.date, range));
      const totalCash = cashEntries.reduce((sum: number, e: any) => sum + (e.totalSales || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Daily Register Cash Reconciliation',
          summaryCards: [
            { label: 'Current Register Cash', value: formatCurrency(appState.cashRegister?.cashBalance || 0) },
            { label: 'Period Cash Collections', value: formatCurrency(totalCash) },
          ],
          headers: ['Date', 'Entry Category', 'Cash Amount', 'Handled By', 'Notes'],
          rows: cashEntries.map((e: any) => [
            e.date,
            e.section || 'Cash Register',
            formatCurrency(e.totalSales || 0),
            e.createdBy || 'Admin',
            e.notes || '-',
          ]),
        },
      ];
      generateProfessionalPDF('Daily Cash Register Report', label, sections, 'Daily_Cash_Report');
      break;
    }

    case 'LUBRICANTS': {
      const lubricants = appState.lubricants || [];
      const totalStockVal = lubricants.reduce(
        (sum: number, l: any) => sum + (l.remainingStock || 0) * (l.sellingPrice || 0),
        0
      );

      const sections: PDFSection[] = [
        {
          title: 'Lubricant & Engine Oil Inventory Report',
          summaryCards: [
            { label: 'Total Lubricant SKUs', value: `${lubricants.length}` },
            { label: 'Current Stock Valuation', value: formatCurrency(totalStockVal) },
          ],
          headers: ['Product Name', 'Category', 'Initial Stock', 'Remaining Stock', 'Selling Price', 'Status'],
          rows: lubricants.map((l: any) => [
            l.productName,
            l.category,
            `${l.stockIn || 0} Units`,
            `${l.remainingStock || 0} Units`,
            formatCurrency(l.sellingPrice || 0),
            (l.remainingStock || 0) <= (l.lowStockAlert || 5) ? '⚠️ LOW STOCK' : '🟢 Available',
          ]),
        },
      ];
      generateProfessionalPDF('Lubricant Inventory Report', label, sections, 'Lubricants_Report');
      break;
    }

    case 'WORKERS': {
      const workers = appState.workers || [];

      const sections: PDFSection[] = [
        {
          title: 'Employee / Worker Profiles Directory',
          summaryCards: [
            { label: 'Total Workers', value: `${workers.length}` },
            { label: 'Active Workers', value: `${workers.filter((w: any) => w.status === 'Active').length}` },
          ],
          headers: ['Worker Name', 'Designation / Role', 'Phone Number', 'Basic Salary', 'Joining Date', 'Status'],
          rows: workers.map((w: any) => [
            w.name,
            w.designation,
            w.phone || 'N/A',
            formatCurrency(w.basicSalary || 0),
            w.joiningDate || 'N/A',
            w.status || 'Active',
          ]),
        },
      ];
      generateProfessionalPDF('Employee Management Report', label, sections, 'Employee_Report');
      break;
    }

    case 'ATTENDANCE': {
      const attendance = (appState.attendanceLogs || []).filter((a: any) => isDateInRange(a.date, range));

      const sections: PDFSection[] = [
        {
          title: 'Worker Attendance Register',
          summaryCards: [
            { label: 'Logged Entries', value: `${attendance.length}` },
            { label: 'Present Count', value: `${attendance.filter((a: any) => a.status === 'Present').length}` },
            { label: 'Absent Count', value: `${attendance.filter((a: any) => a.status === 'Absent').length}` },
          ],
          headers: ['Date', 'Worker Name', 'Attendance Status', 'Shift', 'Overtime Hours'],
          rows: attendance.map((a: any) => [
            a.date,
            a.workerName || 'Worker',
            a.status,
            a.shift || 'Day',
            a.overtimeHours ? `${a.overtimeHours} hrs` : '-',
          ]),
        },
      ];
      generateProfessionalPDF('Attendance Log Report', label, sections, 'Attendance_Report');
      break;
    }

    case 'SALARY': {
      const salaries = appState.salaries || [];
      const totalPaid = salaries.reduce((sum: number, s: any) => sum + (s.salaryPaid || 0), 0);
      const totalPending = salaries.reduce((sum: number, s: any) => sum + (s.pendingSalary || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Worker Salary Ledger',
          summaryCards: [
            { label: 'Total Salary Disbursed', value: formatCurrency(totalPaid) },
            { label: 'Total Salary Pending', value: formatCurrency(totalPending) },
          ],
          headers: ['Worker Name', 'Basic Salary', 'Salary Paid', 'Advance Balance', 'Pending Salary'],
          rows: salaries.map((s: any) => {
            const worker = (appState.workers || []).find((w: any) => w.id === s.workerId);
            return [
              worker?.name || 'Worker',
              formatCurrency(worker?.basicSalary || 0),
              formatCurrency(s.salaryPaid || 0),
              formatCurrency(s.totalAdvance || 0),
              formatCurrency(s.pendingSalary || 0),
            ];
          }),
        },
      ];
      generateProfessionalPDF('Worker Salary Report', label, sections, 'Salary_Report');
      break;
    }

    case 'ADVANCES': {
      const advances = (appState.salaryAdvances || []).filter((a: any) => isDateInRange(a.date, range));
      const totalAdv = advances.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Employee Salary Advance Vouchers',
          summaryCards: [
            { label: 'Advance Vouchers Issued', value: `${advances.length}` },
            { label: 'Total Advance Granted', value: formatCurrency(totalAdv) },
          ],
          headers: ['Date', 'Worker Name', 'Advance Amount', 'Notes / Purpose', 'Approved By'],
          rows: advances.map((a: any) => {
            const worker = (appState.workers || []).find((w: any) => w.id === a.workerId);
            return [
              a.date,
              worker?.name || 'Worker',
              formatCurrency(a.amount || 0),
              a.notes || 'Emergency Advance',
              a.approvedBy || 'Admin',
            ];
          }),
        },
      ];
      generateProfessionalPDF('Employee Salary Advance Report', label, sections, 'Salary_Advances_Report');
      break;
    }

    case 'PENDING_SALARY': {
      const salaries = (appState.salaries || []).filter((s: any) => (s.pendingSalary || 0) > 0);
      const totalPending = salaries.reduce((sum: number, s: any) => sum + (s.pendingSalary || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Outstanding Worker Pending Salaries Audit',
          summaryCards: [
            { label: 'Workers with Pending Salary', value: `${salaries.length}` },
            { label: 'Total Pending Payable', value: formatCurrency(totalPending) },
          ],
          headers: ['Worker Name', 'Designation', 'Basic Monthly Salary', 'Pending Payable Amount'],
          rows: salaries.map((s: any) => {
            const worker = (appState.workers || []).find((w: any) => w.id === s.workerId);
            return [
              worker?.name || 'Worker',
              worker?.designation || 'Staff',
              formatCurrency(worker?.basicSalary || 0),
              formatCurrency(s.pendingSalary || 0),
            ];
          }),
        },
      ];
      generateProfessionalPDF('Pending Salaries Audit Report', label, sections, 'Pending_Salaries_Report');
      break;
    }

    case 'CREDIT_CARD': {
      const ccSales = (appState.creditCardSales || []).filter((c: any) => isDateInRange(c.date, range));
      const totalCC = ccSales.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'POS Credit Card Transactions',
          summaryCards: [
            { label: 'Card Receipts Logged', value: `${ccSales.length}` },
            { label: 'Total Credit Card Revenue', value: formatCurrency(totalCC) },
          ],
          headers: ['Date', 'Time', 'Terminal ID', 'Customer Name', 'Receipt / Slip #', 'Amount'],
          rows: ccSales.map((c: any) => [
            c.date,
            c.time || '12:00 PM',
            c.terminalId || 'POS-01',
            c.customerName || 'Walk-in',
            c.receiptNo || 'SLIP-01',
            formatCurrency(c.amount || 0),
          ]),
        },
      ];
      generateProfessionalPDF('Credit Card Sales Report', label, sections, 'Credit_Card_Report');
      break;
    }

    case 'INFINI_CARD': {
      const infiniSales = (appState.infiniCardSales || []).filter((i: any) => isDateInRange(i.date, range));
      const totalInfini = infiniSales.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Infini Fleet Card Transactions Log',
          summaryCards: [
            { label: 'Fleet Receipts Logged', value: `${infiniSales.length}` },
            { label: 'Total Fleet Sales Revenue', value: formatCurrency(totalInfini) },
          ],
          headers: ['Date', 'Card #', 'Fleet / Company', 'Vehicle #', 'Fuel Liters', 'Total Amount'],
          rows: infiniSales.map((i: any) => [
            i.date,
            i.cardNumber || 'INF-00',
            i.fleetName || 'Corporate Fleet',
            i.vehicleNumber || 'N/A',
            formatLiters(i.liters || 0),
            formatCurrency(i.amount || 0),
          ]),
        },
      ];
      generateProfessionalPDF('Infini Card Sales Report', label, sections, 'Infini_Card_Report');
      break;
    }

    case 'BANK': {
      const txs = (appState.bankTransactions || []).filter((t: any) => isDateInRange(t.date, range));
      const bankAccounts = appState.bankAccounts || [];
      const totalBal = bankAccounts.reduce((sum: number, b: any) => sum + b.currentBalance, 0);

      const sections: PDFSection[] = [
        {
          title: 'Bank Accounts & Transactions Statement',
          summaryCards: [
            { label: 'Active Bank Accounts', value: `${bankAccounts.length}` },
            { label: 'Combined Bank Balance', value: formatCurrency(totalBal) },
          ],
          headers: ['Date', 'Bank Name', 'Type', 'Amount', 'Reference #', 'Notes'],
          rows: txs.map((t: any) => [
            t.date,
            t.bankName || 'Bank',
            t.type,
            formatCurrency(t.amount || 0),
            t.referenceNumber || 'REF-00',
            t.notes || '-',
          ]),
        },
      ];
      generateProfessionalPDF('Bank Management Statement', label, sections, 'Bank_Transactions_Report');
      break;
    }

    case 'EXPENSES': {
      const expenses = (appState.expenses || []).filter((e: any) => isDateInRange(e.date, range));
      const totalExp = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Station Expenses & Operating Vouchers',
          summaryCards: [
            { label: 'Vouchers Logged', value: `${expenses.length}` },
            { label: 'Total Expenses Paid', value: formatCurrency(totalExp) },
          ],
          headers: ['Date', 'Title', 'Category', 'Amount', 'Description'],
          rows: expenses.map((e: any) => [
            e.date,
            e.title,
            e.category || 'General',
            formatCurrency(e.amount || 0),
            e.description || e.notes || '-',
          ]),
        },
      ];
      generateProfessionalPDF('Expenses Statement Report', label, sections, 'Expenses_Report');
      break;
    }

    case 'TAXES': {
      const expenses = (appState.expenses || []).filter(
        (e: any) => isDateInRange(e.date, range) && (e.category === 'Taxes' || e.title.toLowerCase().includes('tax'))
      );
      const totalTax = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Government Taxes & Levies Payment Audit',
          summaryCards: [
            { label: 'Tax Payments Logged', value: `${expenses.length}` },
            { label: 'Total Taxes Paid', value: formatCurrency(totalTax) },
          ],
          headers: ['Date', 'Tax Title', 'Category', 'Paid Amount', 'Reference'],
          rows: expenses.map((e: any) => [
            e.date,
            e.title,
            'Government Tax / Duty',
            formatCurrency(e.amount || 0),
            e.notes || 'Official Payment Voucher',
          ]),
        },
      ];
      generateProfessionalPDF('Tax Management Audit Report', label, sections, 'Tax_Management_Report');
      break;
    }

    case 'CAR_WASH': {
      const washes = (appState.carWashServices || []).filter((c: any) => isDateInRange(c.dateTime?.slice(0, 10), range));
      const totalRev = washes.reduce((sum: number, c: any) => sum + (c.serviceFee || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Car Wash Sub-Business Sales Report',
          summaryCards: [
            { label: 'Vehicles Washed', value: `${washes.length}` },
            { label: 'Total Car Wash Revenue', value: formatCurrency(totalRev) },
          ],
          headers: ['Date/Time', 'Customer', 'Vehicle Category', 'Package', 'Fee Amount', 'Washer'],
          rows: washes.map((c: any) => [
            c.dateTime || 'Today',
            c.customerName || 'Walk-in',
            c.vehicleCategory || 'Car',
            c.washPackage || 'Standard',
            formatCurrency(c.serviceFee || 0),
            c.washerWorker || 'Staff',
          ]),
        },
      ];
      generateProfessionalPDF('Car Wash Business Report', label, sections, 'Car_Wash_Report');
      break;
    }

    case 'TYRE_SHOP': {
      const tyres = (appState.tyreShopServices || []).filter((t: any) => isDateInRange(t.dateTime?.slice(0, 10), range));
      const totalRev = tyres.reduce((sum: number, t: any) => sum + (t.serviceCost || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Tire Shop Sub-Business Services Log',
          summaryCards: [
            { label: 'Services Performed', value: `${tyres.length}` },
            { label: 'Total Tire Shop Revenue', value: formatCurrency(totalRev) },
          ],
          headers: ['Date/Time', 'Customer', 'Service Type', 'Vehicle', 'Cost Amount', 'Technician'],
          rows: tyres.map((t: any) => [
            t.dateTime || 'Today',
            t.customerName || 'Walk-in',
            t.serviceType || 'Tire Repair',
            t.vehicleType || 'Car',
            formatCurrency(t.serviceCost || 0),
            t.technicianName || 'Technician',
          ]),
        },
      ];
      generateProfessionalPDF('Tire Shop Business Report', label, sections, 'Tire_Shop_Report');
      break;
    }

    case 'TUCK_SHOP': {
      const items = appState.tuckShopItems || [];
      const totalVal = items.reduce((sum: number, t: any) => sum + (t.stockQty || 0) * (t.salePrice || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Tuck Shop Mart Inventory & Sales Audit',
          summaryCards: [
            { label: 'Items Cataloged', value: `${items.length}` },
            { label: 'Stock Retail Value', value: formatCurrency(totalVal) },
          ],
          headers: ['Item Name', 'Category', 'In Stock', 'Purchase Cost', 'Sale Price', 'Reorder Level'],
          rows: items.map((t: any) => [
            t.itemName,
            t.category,
            `${t.stockQty || 0} Units`,
            formatCurrency(t.purchasePrice || 0),
            formatCurrency(t.salePrice || 0),
            `${t.reorderLevel || 5} Units`,
          ]),
        },
      ];
      generateProfessionalPDF('Tuck Shop Mart Report', label, sections, 'Tuck_Shop_Report');
      break;
    }

    case 'RESTAURANT': {
      const sales = (appState.restaurantSales || []).filter((r: any) => isDateInRange(r.date, range));
      const totalRev = sales.reduce((sum: number, r: any) => sum + (r.netAmount || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Fast Food Restaurant Sales Log',
          summaryCards: [
            { label: 'Orders Processed', value: `${sales.length}` },
            { label: 'Total Restaurant Revenue', value: formatCurrency(totalRev) },
          ],
          headers: ['Date', 'Order Time', 'Customer', 'Order Type', 'Payment Method', 'Net Total'],
          rows: sales.map((r: any) => [
            r.date,
            r.time || '12:00 PM',
            r.customerName || 'Walk-in',
            r.orderType || 'Takeaway',
            r.paymentMethod || 'Cash',
            formatCurrency(r.netAmount || 0),
          ]),
        },
      ];
      generateProfessionalPDF('Restaurant Business Report', label, sections, 'Restaurant_Report');
      break;
    }

    case 'PROFIT_LOSS': {
      const fuelRev = (appState.dailySalesEntries || [])
        .filter((e: any) => isDateInRange(e.date, range))
        .reduce((sum: number, e: any) => sum + (e.totalSales || 0), 0);
      const deliveryCost = (appState.deliveries || [])
        .filter((d: any) => isDateInRange(d.deliveryDate, range))
        .reduce((sum: number, d: any) => sum + (d.totalPurchaseAmount || 0), 0);
      const operatingExp = (appState.expenses || [])
        .filter((e: any) => isDateInRange(e.date, range))
        .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const salaryPaid = (appState.salaries || []).reduce((sum: number, s: any) => sum + (s.salaryPaid || 0), 0);

      const carWashRev = (appState.carWashServices || []).reduce((sum: number, c: any) => sum + (c.serviceFee || 0), 0);
      const tyreShopRev = (appState.tyreShopServices || []).reduce((sum: number, t: any) => sum + (t.serviceCost || 0), 0);
      const restaurantRev = (appState.restaurantSales || [])
        .filter((r: any) => isDateInRange(r.date, range))
        .reduce((sum: number, r: any) => sum + (r.netAmount || 0), 0);

      const totalRevenue = fuelRev + carWashRev + tyreShopRev + restaurantRev;
      const totalOutflow = deliveryCost + operatingExp + salaryPaid;
      const netProfit = totalRevenue - totalOutflow;

      const sections: PDFSection[] = [
        {
          title: 'Comprehensive Profit & Loss Executive Statement',
          summaryCards: [
            { label: 'Gross Revenue', value: formatCurrency(totalRevenue) },
            { label: 'Total Purchases & Outflows', value: formatCurrency(totalOutflow) },
            { label: 'Net Profit / Loss', value: formatCurrency(netProfit) },
          ],
          headers: ['Revenue / Expense Stream', 'Amount (PKR)'],
          rows: [
            ['Fuel & Petrol Cash Sales Revenue', formatCurrency(fuelRev)],
            ['Car Wash Services Revenue', formatCurrency(carWashRev)],
            ['Tire Shop Services Revenue', formatCurrency(tyreShopRev)],
            ['Restaurant Fast Food Revenue', formatCurrency(restaurantRev)],
            ['Fuel Tanker Deliveries Purchase Cost', `- ${formatCurrency(deliveryCost)}`],
            ['Station Operating Expenses Vouchers', `- ${formatCurrency(operatingExp)}`],
            ['Worker Salaries Disbursed', `- ${formatCurrency(salaryPaid)}`],
            ['GRAND NET OPERATING PROFIT', formatCurrency(netProfit)],
          ],
        },
      ];
      generateProfessionalPDF('Profit & Loss Master Report', label, sections, 'Profit_Loss_Report');
      break;
    }

    case 'COMPLETE_BUSINESS': {
      // Complete Grand Monthly Master Report!
      const fuelSales = (appState.dailySalesEntries || []).filter((e: any) => isDateInRange(e.date, range));
      const fuelRev = fuelSales.reduce((s: number, e: any) => s + (e.totalSales || 0), 0);

      const deliveries = (appState.deliveries || []).filter((d: any) => isDateInRange(d.deliveryDate, range));
      const deliveryCost = deliveries.reduce((s: number, d: any) => s + (d.totalPurchaseAmount || 0), 0);

      const expenses = (appState.expenses || []).filter((ex: any) => isDateInRange(ex.date, range));
      const expAmt = expenses.reduce((s: number, ex: any) => s + (ex.amount || 0), 0);

      const ccSales = (appState.creditCardSales || []).filter((c: any) => isDateInRange(c.date, range));
      const ccAmt = ccSales.reduce((s: number, c: any) => s + (c.amount || 0), 0);

      const infiniSales = (appState.infiniCardSales || []).filter((i: any) => isDateInRange(i.date, range));
      const infiniAmt = infiniSales.reduce((s: number, i: any) => s + (i.amount || 0), 0);

      const washes = (appState.carWashServices || []).filter((c: any) => isDateInRange(c.dateTime?.slice(0, 10), range));
      const washAmt = washes.reduce((s: number, c: any) => s + (c.serviceFee || 0), 0);

      const tyres = (appState.tyreShopServices || []).filter((t: any) => isDateInRange(t.dateTime?.slice(0, 10), range));
      const tyreAmt = tyres.reduce((s: number, t: any) => s + (t.serviceCost || 0), 0);

      const restaurantSales = (appState.restaurantSales || []).filter((r: any) => isDateInRange(r.date, range));
      const restAmt = restaurantSales.reduce((s: number, r: any) => s + (r.netAmount || 0), 0);

      const totalGrandRevenue = fuelRev + ccAmt + infiniAmt + washAmt + tyreAmt + restAmt;
      const netGrandProfit = totalGrandRevenue - deliveryCost - expAmt;

      const sections: PDFSection[] = [
        {
          title: 'Executive Financial Summary',
          summaryCards: [
            { label: 'Total Enterprise Revenue', value: formatCurrency(totalGrandRevenue) },
            { label: 'Fuel Purchases Outflow', value: formatCurrency(deliveryCost) },
            { label: 'Operating Expenses', value: formatCurrency(expAmt) },
            { label: 'Net Profit', value: formatCurrency(netGrandProfit) },
          ],
          headers: ['Business Stream', 'Transactions Count', 'Revenue / Value (PKR)'],
          rows: [
            ['Fuel Cash Sales', `${fuelSales.length}`, formatCurrency(fuelRev)],
            ['Fuel Deliveries Received', `${deliveries.length}`, formatCurrency(deliveryCost)],
            ['Credit Card Terminal Sales', `${ccSales.length}`, formatCurrency(ccAmt)],
            ['Infini Fleet Card Sales', `${infiniSales.length}`, formatCurrency(infiniAmt)],
            ['Car Wash Services', `${washes.length}`, formatCurrency(washAmt)],
            ['Tire Shop Services', `${tyres.length}`, formatCurrency(tyreAmt)],
            ['Fast Food Restaurant', `${restaurantSales.length}`, formatCurrency(restAmt)],
            ['Operating Expenses Vouchers', `${expenses.length}`, formatCurrency(expAmt)],
          ],
        },
        {
          title: 'Underground Tank Fuel Stock Status',
          headers: ['Tank Name', 'Fuel Type', 'Capacity', 'Current Fuel', 'Stock %'],
          rows: (appState.tanks || []).map((t: any) => [
            t.tankName,
            t.fuelType,
            formatLiters(t.capacity),
            formatLiters(t.currentFuel),
            `${Math.round((t.currentFuel / t.capacity) * 100)}%`,
          ]),
        },
        {
          title: 'Employee & HR Payroll Overview',
          headers: ['Worker Name', 'Designation', 'Basic Salary', 'Pending Salary'],
          rows: (appState.workers || []).map((w: any) => {
            const sal = (appState.salaries || []).find((s: any) => s.workerId === w.id);
            return [
              w.name,
              w.designation,
              formatCurrency(w.basicSalary || 0),
              formatCurrency(sal?.pendingSalary || 0),
            ];
          }),
        },
      ];

      generateProfessionalPDF('Complete Business Monthly Master Report', label, sections, 'Complete_Business_Monthly');
      break;
    }

    case 'CREDIT_CUSTOMERS': {
      const customers = appState.udhaarCustomers || [];
      const totalCredit = customers.reduce((sum: number, c: any) => sum + (c.totalCredit || 0), 0);
      const totalReceived = customers.reduce((sum: number, c: any) => sum + (c.paymentReceived || 0), 0);
      const totalOutstanding = customers.reduce((sum: number, c: any) => sum + (c.remainingBalance || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Credit Customers (Udhaar Register) Ledger Statement',
          summaryCards: [
            { label: 'Total Credit Accounts', value: `${customers.length}` },
            { label: 'Total Credit Extended', value: formatCurrency(totalCredit) },
            { label: 'Total Payments Received', value: formatCurrency(totalReceived) },
            { label: 'Total Outstanding Balance', value: formatCurrency(totalOutstanding) },
          ],
          headers: ['Customer Name', 'Phone Number', 'Vehicle / Details', 'Credit Limit', 'Total Credit', 'Received', 'Outstanding Balance'],
          rows: customers.map((c: any) => [
            c.customerName || c.name,
            c.phoneNumber || '-',
            c.vehicleNumber || '-',
            formatCurrency(c.creditLimit || 0),
            formatCurrency(c.totalCredit || 0),
            formatCurrency(c.paymentReceived || 0),
            formatCurrency(c.remainingBalance || 0),
          ]),
        },
      ];
      generateProfessionalPDF('Credit Customers Udhaar Report', label, sections, 'Credit_Customers_Report');
      break;
    }

    default:
      break;
  }
};

export const exportCustomerLedgerPDF = (customer: any) => {
  const sections: PDFSection[] = [
    {
      title: `Credit Account Statement - ${customer.customerName || customer.name}`,
      summaryCards: [
        { label: 'Customer Name', value: customer.customerName || customer.name },
        { label: 'Mobile / Phone', value: customer.phoneNumber || 'N/A' },
        { label: 'Credit Limit', value: formatCurrency(customer.creditLimit || 0) },
        { label: 'Outstanding Balance', value: formatCurrency(customer.remainingBalance || 0) },
      ],
      headers: ['Date', 'Time', 'Description', 'Credit Added', 'Payment Received', 'Running Balance'],
      rows: (customer.transactions || []).map((t: any) => [
        t.date,
        t.time || '12:00 PM',
        t.description || (t.type === 'CREDIT_PURCHASE' ? 'Credit Purchase' : 'Payment Received'),
        t.type === 'CREDIT_PURCHASE' ? formatCurrency(t.amount) : '-',
        t.type === 'PAYMENT_RECEIVED' ? formatCurrency(t.amount) : '-',
        formatCurrency(t.runningBalance !== undefined ? t.runningBalance : t.amount),
      ]),
    },
  ];
  generateProfessionalPDF(
    `Udhaar Ledger Statement - ${customer.customerName || customer.name}`,
    `Generated on ${new Date().toLocaleDateString()}`,
    sections,
    `Udhaar_Ledger_${(customer.customerName || customer.name).replace(/[^a-zA-Z0-9]/g, '_')}`
  );
};
