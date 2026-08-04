import {
  DateFilterRange,
  getDateRangeDates,
  isDateInRange,
  generateProfessionalPDF,
  PDFSection,
} from './pdfGenerator';
import { formatCurrency, formatLiters, formatDate } from './formatters';

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
      const fuelSales = (appState.fuelSales || []).filter((s: any) => isDateInRange(s.date, range));
      const totalFuelRev = fuelSales.reduce((sum: number, s: any) => sum + (s.totalSaleAmount || 0), 0);
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
      const fuelSales = (appState.fuelSales || []).filter((s: any) => isDateInRange(s.date, range));

      const superPetrolSales = fuelSales.filter((s: any) => s.fuelType === 'Super Petrol');
      const superPetrolLiters = superPetrolSales.reduce((a: number, b: any) => a + (b.quantityLiters || 0), 0);
      const superPetrolRev = superPetrolSales.reduce((a: number, b: any) => a + (b.totalSaleAmount || 0), 0);

      const hsdSales = fuelSales.filter((s: any) => s.fuelType === 'High-Speed Diesel (HSD)');
      const hsdLiters = hsdSales.reduce((a: number, b: any) => a + (b.quantityLiters || 0), 0);
      const hsdRev = hsdSales.reduce((a: number, b: any) => a + (b.totalSaleAmount || 0), 0);

      const excelliumSales = fuelSales.filter((s: any) => s.fuelType === 'Excellium High-Octane');
      const excelliumLiters = excelliumSales.reduce((a: number, b: any) => a + (b.quantityLiters || 0), 0);
      const excelliumRev = excelliumSales.reduce((a: number, b: any) => a + (b.totalSaleAmount || 0), 0);

      const totalLiters = superPetrolLiters + hsdLiters + excelliumLiters;
      const totalFuelSalesAmt = superPetrolRev + hsdRev + excelliumRev;

      // Tank-wise breakdown
      const tankMap: Record<string, { tankName: string; fuelType: string; liters: number; amount: number }> = {};
      fuelSales.forEach((s: any) => {
        const tName = s.tankName || 'Tank ' + (s.tankId || '');
        if (!tankMap[tName]) {
          tankMap[tName] = { tankName: tName, fuelType: s.fuelType, liters: 0, amount: 0 };
        }
        tankMap[tName].liters += s.quantityLiters || 0;
        tankMap[tName].amount += s.totalSaleAmount || 0;
      });

      const tankRows = Object.values(tankMap).map(t => [
        t.tankName,
        t.fuelType,
        formatLiters(t.liters),
        formatCurrency(t.amount),
      ]);

      const sections: PDFSection[] = [
        {
          title: 'Fuel Sales Business Revenue Overview',
          summaryCards: [
            { label: 'Total Super Petrol Sales', value: formatCurrency(superPetrolRev) },
            { label: 'Total High-Speed Diesel (HSD) Sales', value: formatCurrency(hsdRev) },
            { label: 'Total Excellium High-Octane Sales', value: formatCurrency(excelliumRev) },
            { label: 'Total Fuel Sales Revenue', value: formatCurrency(totalFuelSalesAmt) },
          ],
          headers: ['Date', 'Fuel Type', 'Tank Name', 'Quantity Sold (L)', 'Total Sale Amount (PKR)'],
          rows: fuelSales.length > 0
            ? fuelSales.map((s: any) => [
                formatDate(s.date),
                s.fuelType,
                s.tankName || 'Tank',
                formatLiters(s.quantityLiters || 0),
                formatCurrency(s.totalSaleAmount || 0),
              ])
            : [['No Fuel Sales Records', '-', '-', '0 L', 'PKR 0']],
        },
        {
          title: 'Fuel Type-wise Revenue Summary',
          headers: ['Fuel Category', 'Litres Sold (Supporting Info)', 'Total Sales Revenue (PKR)'],
          rows: [
            ['Super Petrol Sales', formatLiters(superPetrolLiters), formatCurrency(superPetrolRev)],
            ['High-Speed Diesel (HSD) Sales', formatLiters(hsdLiters), formatCurrency(hsdRev)],
            ['Excellium High-Octane Sales', formatLiters(excelliumLiters), formatCurrency(excelliumRev)],
          ],
        },
        {
          title: 'Tank-wise Summary Breakdown',
          headers: ['Tank Name', 'Fuel Type', 'Total Litres Sold', 'Total Sales Revenue (PKR)'],
          rows: tankRows.length > 0 ? tankRows : [['No Tank Data', '-', '0 L', 'PKR 0']],
        },
        {
          title: 'MONTHLY FUEL SALES SUMMARY',
          summaryCards: [
            { label: 'Super Petrol Sales', value: formatCurrency(superPetrolRev) },
            { label: 'High-Speed Diesel Sales', value: formatCurrency(hsdRev) },
            { label: 'Excellium High-Octane Sales', value: formatCurrency(excelliumRev) },
            { label: 'Total Monthly Fuel Sales', value: formatCurrency(totalFuelSalesAmt) },
          ],
          headers: ['Fuel Stream', 'Volume Sold', 'Total Monthly Sales (PKR)'],
          rows: [
            ['Super Petrol Sales', formatLiters(superPetrolLiters), formatCurrency(superPetrolRev)],
            ['High-Speed Diesel Sales', formatLiters(hsdLiters), formatCurrency(hsdRev)],
            ['Excellium High-Octane Sales', formatLiters(excelliumLiters), formatCurrency(excelliumRev)],
            ['TOTAL MONTHLY FUEL SALES', formatLiters(totalLiters), formatCurrency(totalFuelSalesAmt)],
          ],
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
          headers: ['Date', 'Supplier', 'Invoice #', 'Fuel Type', 'Quantity', 'Fuel Rate', 'Purchase Cost', 'Tank'],
          rows: deliveries.map((d: any) => {
            const rate = d.fuelRate || (d.fuelType === 'Petrol' ? d.purchaseRatePetrol : d.purchaseRateDiesel) || (d.totalLitersReceived ? d.totalPurchaseAmount / d.totalLitersReceived : 0);
            return [
              d.deliveryDate,
              d.supplierName,
              d.invoiceNumber,
              d.fuelType,
              formatLiters(d.totalLitersReceived),
              `PKR ${rate.toFixed(2)}/L`,
              formatCurrency(d.totalPurchaseAmount),
              d.tankName || d.destinationTank || 'Tank 1',
            ];
          }),
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
      const fuelRev = (appState.fuelSales || [])
        .filter((s: any) => isDateInRange(s.date, range))
        .reduce((sum: number, s: any) => sum + (s.totalSaleAmount || 0), 0);
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
            ['Fuel Sales Revenue', formatCurrency(fuelRev)],
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
      // Complete Grand Monthly Business Master Report - Bahu Petroleum Enterprise
      
      // 1. FUEL SALES & DELIVERIES
      const fuelSales = (appState.fuelSales || []).filter((s: any) => isDateInRange(s.date, range));
      const superPetrolSales = fuelSales.filter((s: any) => s.fuelType === 'Super Petrol');
      const superPetrolLiters = superPetrolSales.reduce((a: number, b: any) => a + (b.quantityLiters || 0), 0);
      const superPetrolRev = superPetrolSales.reduce((a: number, b: any) => a + (b.totalSaleAmount || 0), 0);

      const hsdSales = fuelSales.filter((s: any) => s.fuelType === 'High-Speed Diesel (HSD)');
      const hsdLiters = hsdSales.reduce((a: number, b: any) => a + (b.quantityLiters || 0), 0);
      const hsdRev = hsdSales.reduce((a: number, b: any) => a + (b.totalSaleAmount || 0), 0);

      const excelliumSales = fuelSales.filter((s: any) => s.fuelType === 'Excellium High-Octane');
      const excelliumLiters = excelliumSales.reduce((a: number, b: any) => a + (b.quantityLiters || 0), 0);
      const excelliumRev = excelliumSales.reduce((a: number, b: any) => a + (b.totalSaleAmount || 0), 0);

      const totalFuelLiters = superPetrolLiters + hsdLiters + excelliumLiters;
      const totalFuelRev = superPetrolRev + hsdRev + excelliumRev;

      const deliveries = (appState.deliveries || []).filter((d: any) => isDateInRange(d.deliveryDate, range));
      const totalFuelDeliveredLiters = deliveries.reduce((s: number, d: any) => s + (d.totalLitersReceived || (d.petrolLiters || 0) + (d.dieselLiters || 0) || 0), 0);
      const fuelPurchaseCost = deliveries.reduce((s: number, d: any) => s + (d.totalPurchaseAmount || 0), 0);
      const fuelGrossProfit = totalFuelRev - fuelPurchaseCost;

      // 2. TANKS
      const tanks = appState.tanks || [];
      const totalTankCapacity = tanks.reduce((s: number, t: any) => s + (t.capacity || 0), 0);
      const totalCurrentTankStock = tanks.reduce((s: number, t: any) => s + (t.currentFuel || 0), 0);

      // 3. LUBRICANTS
      const lubricants = appState.lubricants || [];
      const lubeSalesEntries = (appState.dailySalesEntries || []).filter((s: any) => s.section === 'Lubricants' && isDateInRange(s.date, range));
      const lubeDirectRev = lubeSalesEntries.reduce((s: number, e: any) => s + (e.totalSales || 0), 0);
      const lubeStockSoldQty = lubricants.reduce((s: number, l: any) => s + Math.max(0, (l.stockIn || 0) - (l.remainingStock || 0)), 0);
      const lubeRev = lubeDirectRev || lubricants.reduce((s: number, l: any) => s + (Math.max(0, (l.stockIn || 0) - (l.remainingStock || 0)) * (l.sellingPrice || 0)), 0);
      const lubeCount = lubeSalesEntries.length || lubeStockSoldQty;

      // 4. TIRE SHOP
      const tyreServices = (appState.tyreShopServices || []).filter((t: any) => isDateInRange(t.dateTime?.slice(0, 10), range));
      const tyreDirectEntries = (appState.dailySalesEntries || []).filter((s: any) => s.section === 'Tyre Shop' && isDateInRange(s.date, range));
      const tyreRev = tyreServices.reduce((s: number, t: any) => s + (t.serviceCost || 0), 0) + tyreDirectEntries.reduce((s: number, e: any) => s + (e.totalSales || 0), 0);
      const tyreCount = tyreServices.length + tyreDirectEntries.length;

      // 5. TUCK SHOP
      const tuckItems = appState.tuckShopItems || [];
      const tuckDirectEntries = (appState.dailySalesEntries || []).filter((s: any) => s.section === 'Tuck Shop' && isDateInRange(s.date, range));
      const tuckRev = tuckDirectEntries.reduce((s: number, e: any) => s + (e.totalSales || 0), 0) || tuckItems.reduce((s: number, t: any) => s + ((t.stockQty || 0) * (t.salePrice || 0)), 0);
      const tuckCount = tuckDirectEntries.length || tuckItems.length;

      // 6. CAR WASH
      const washServices = (appState.carWashServices || []).filter((c: any) => isDateInRange(c.dateTime?.slice(0, 10), range));
      const washDirectEntries = (appState.dailySalesEntries || []).filter((s: any) => s.section === 'Car Wash' && isDateInRange(s.date, range));
      const carWashRev = washServices.reduce((s: number, c: any) => s + (c.serviceFee || 0), 0) + washDirectEntries.reduce((s: number, e: any) => s + (e.totalSales || 0), 0);
      const washCount = washServices.length + washDirectEntries.length;

      // 7. RESTAURANT
      const restSales = (appState.restaurantSales || []).filter((r: any) => isDateInRange(r.date, range));
      const restDirectEntries = (appState.dailySalesEntries || []).filter((s: any) => s.section === 'Fast Food' && isDateInRange(s.date, range));
      const restaurantRev = restSales.reduce((s: number, r: any) => s + (r.netAmount || 0), 0) + restDirectEntries.reduce((s: number, e: any) => s + (e.totalSales || 0), 0);
      const restaurantCount = restSales.length + restDirectEntries.length;

      // 8. CREDIT CARDS & INFINITY CARDS
      const ccSales = (appState.creditCardSales || []).filter((c: any) => isDateInRange(c.date, range));
      const ccDirectEntries = (appState.dailySalesEntries || []).filter((s: any) => s.section === 'Credit Card' && isDateInRange(s.date, range));
      const creditCardRev = ccSales.reduce((s: number, c: any) => s + (c.amount || 0), 0) + ccDirectEntries.reduce((s: number, e: any) => s + (e.totalSales || 0), 0);
      const ccCount = ccSales.length + ccDirectEntries.length;

      const infiniSales = (appState.infiniCardSales || []).filter((i: any) => isDateInRange(i.date, range));
      const infiniDirectEntries = (appState.dailySalesEntries || []).filter((s: any) => s.section === 'Infinity Card' && isDateInRange(s.date, range));
      const infiniCardRev = infiniSales.reduce((s: number, i: any) => s + (i.amount || 0), 0) + infiniDirectEntries.reduce((s: number, e: any) => s + (e.totalSales || 0), 0);
      const infiniCount = infiniSales.length + infiniDirectEntries.length;

      // 9. BANK ACCOUNTS
      const bankAccounts = appState.bankAccounts || [];
      const bankTxs = (appState.bankTransactions || []).filter((t: any) => isDateInRange(t.date, range));
      const totalDeposits = bankTxs.filter((t: any) => t.type === 'Deposit').reduce((s: number, t: any) => s + (t.amount || 0), 0);
      const totalWithdrawals = bankTxs.filter((t: any) => t.type === 'Withdrawal').reduce((s: number, t: any) => s + (t.amount || 0), 0);
      const totalBankBalance = bankAccounts.reduce((s: number, b: any) => s + (b.currentBalance || 0), 0);

      // 10. CREDIT CUSTOMERS (UDHAAR)
      const udhaarCustomers = appState.udhaarCustomers || [];
      const totalUdhaarGiven = udhaarCustomers.reduce((s: number, c: any) => s + (c.totalCredit || 0), 0);
      const totalUdhaarReceived = udhaarCustomers.reduce((s: number, c: any) => s + (c.paymentReceived || 0), 0);
      const totalUdhaarOutstanding = udhaarCustomers.reduce((s: number, c: any) => s + (c.remainingBalance || 0), 0);

      // Udhaar Transactions Log
      const allUdhaarTxs: any[] = [];
      udhaarCustomers.forEach((c: any) => {
        const cName = c.customerName || c.name || 'Customer';
        (c.transactions || []).forEach((t: any) => {
          if (isDateInRange(t.date, range)) {
            allUdhaarTxs.push({ ...t, customerName: cName });
          }
        });
      });
      allUdhaarTxs.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

      // 11. EXPENSES & CATEGORY BREAKDOWN
      const expenses = (appState.expenses || []).filter((e: any) => isDateInRange(e.date, range));
      const operatingExpensesAmt = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
      
      const categoryMap: Record<string, { count: number; total: number }> = {};
      // Initialize standard categories
      ['Water', 'Electricity', 'Maintenance', 'Salaries', 'Fuel Purchase', 'Other Expenses'].forEach(cat => {
        categoryMap[cat] = { count: 0, total: 0 };
      });

      // Add fuel purchase as category
      if (fuelPurchaseCost > 0) {
        categoryMap['Fuel Purchase'] = { count: deliveries.length, total: fuelPurchaseCost };
      }

      // Add operating expenses
      expenses.forEach((e: any) => {
        const cat = e.category || 'Other Expenses';
        if (!categoryMap[cat]) categoryMap[cat] = { count: 0, total: 0 };
        categoryMap[cat].count += 1;
        categoryMap[cat].total += e.amount || 0;
      });

      // Worker salaries paid
      const workers = appState.workers || [];
      const salaries = appState.salaries || [];
      const totalSalariesPaid = salaries.reduce((s: number, sal: any) => s + (sal.salaryPaid || 0), 0);
      if (totalSalariesPaid > 0) {
        categoryMap['Salaries'].count += salaries.length || workers.length;
        categoryMap['Salaries'].total += totalSalariesPaid;
      }

      const totalExpensesAll = Object.values(categoryMap).reduce((s, c) => s + c.total, 0);

      // 12. EMPLOYEES & ATTENDANCE
      const attendance = appState.attendance || [];
      const employeeRows = workers.map((w: any) => {
        const sal = salaries.find((s: any) => s.workerId === w.id);
        const wAtt = attendance.filter((a: any) => a.workerId === w.id && isDateInRange(a.date, range));
        const pCount = wAtt.filter((a: any) => a.status === 'Present').length;
        const aCount = wAtt.filter((a: any) => a.status === 'Absent').length;
        const lCount = wAtt.filter((a: any) => a.status === 'Leave').length;
        const hdCount = wAtt.filter((a: any) => a.status === 'Half Day').length;

        const attSummary = wAtt.length > 0
          ? `${pCount} P / ${aCount} A / ${lCount} L${hdCount > 0 ? ` / ${hdCount} HD` : ''}`
          : 'No logs recorded';

        const mSal = w.monthlySalary || sal?.monthlySalary || 0;
        const adv = sal?.totalAdvance || 0;
        const paid = sal?.salaryPaid || 0;
        const pending = sal?.pendingSalary !== undefined ? sal.pendingSalary : Math.max(0, mSal - paid);

        return [
          w.name,
          formatCurrency(mSal),
          formatCurrency(adv),
          formatCurrency(paid),
          formatCurrency(pending),
          attSummary,
        ];
      });

      // 13. TOTAL BUSINESS INCOME & EXPENSES & PROFIT/LOSS
      const totalBusinessIncome = totalFuelRev + lubeRev + tyreRev + tuckRev + carWashRev + restaurantRev + creditCardRev + infiniCardRev;
      const totalBusinessExpenses = totalExpensesAll;
      const netProfit = totalBusinessIncome - totalBusinessExpenses;

      const sections: PDFSection[] = [
        {
          title: 'EXECUTIVE DASHBOARD FINANCIAL SUMMARY',
          summaryCards: [
            { label: 'Total Business Income', value: formatCurrency(totalBusinessIncome) },
            { label: 'Total Business Expenses', value: formatCurrency(totalBusinessExpenses) },
            { label: 'Total Net Profit', value: netProfit >= 0 ? formatCurrency(netProfit) : 'PKR 0' },
            { label: 'Total Net Loss', value: netProfit < 0 ? formatCurrency(Math.abs(netProfit)) : 'PKR 0' },
          ],
          headers: ['Revenue Stream', 'Volume / Order Count', 'Total Sales Revenue (PKR)'],
          rows: [
            ['Fuel Cash Sales', formatLiters(totalFuelLiters), formatCurrency(totalFuelRev)],
            ['Lubricants & Engine Oils', `${lubeCount} Items / Sales`, formatCurrency(lubeRev)],
            ['Car Wash Services', `${washCount} Vehicles Washed`, formatCurrency(carWashRev)],
            ['Tire Shop Services', `${tyreCount} Repair Services`, formatCurrency(tyreRev)],
            ['Tuck Shop Mart', `${tuckCount} Items / Orders`, formatCurrency(tuckRev)],
            ['Fast Food Restaurant', `${restaurantCount} Orders Processed`, formatCurrency(restaurantRev)],
            ['Credit Card Terminal Sales', `${ccCount} POS Receipts`, formatCurrency(creditCardRev)],
            ['Infinity Fleet Card Sales', `${infiniCount} Fleet Receipts`, formatCurrency(infiniCardRev)],
            ['TOTAL COMBINED REVENUE', '-', formatCurrency(totalBusinessIncome)],
          ],
        },
        {
          title: 'FUEL SECTION - DELIVERIES, SALES & GROSS PROFIT',
          summaryCards: [
            { label: 'Fuel Sales Revenue', value: formatCurrency(totalFuelRev) },
            { label: 'Fuel Purchase Cost', value: formatCurrency(fuelPurchaseCost) },
            { label: 'Fuel Gross Profit', value: formatCurrency(fuelGrossProfit) },
            { label: 'Total Litres Sold', value: formatLiters(totalFuelLiters) },
          ],
          headers: ['Fuel Category', 'Litres Delivered / Sold', 'Purchases / Sales Amount (PKR)'],
          rows: [
            ['Super Petrol Sales', formatLiters(superPetrolLiters), formatCurrency(superPetrolRev)],
            ['High-Speed Diesel (HSD) Sales', formatLiters(hsdLiters), formatCurrency(hsdRev)],
            ['Excellium High-Octane Sales', formatLiters(excelliumLiters), formatCurrency(excelliumRev)],
            ['Fuel Tanker Purchases Outflow', formatLiters(totalFuelDeliveredLiters), `- ${formatCurrency(fuelPurchaseCost)}`],
            ['NET FUEL GROSS PROFIT', formatLiters(totalFuelLiters), formatCurrency(fuelGrossProfit)],
          ],
        },
        {
          title: 'UNDERGROUND TANK STORAGE & REMAINING STOCK',
          summaryCards: [
            { label: 'Total Fuel Tanks', value: `${tanks.length} Underground Tanks` },
            { label: 'Total Tank Capacity', value: formatLiters(totalTankCapacity) },
            { label: 'Current Tank Stock', value: formatLiters(totalCurrentTankStock) },
            { label: 'Remaining Tank Stock', value: formatLiters(totalCurrentTankStock) },
          ],
          headers: ['Tank Name', 'Fuel Type', 'Capacity', 'Current Fuel Stock', 'Stock Fullness (%)'],
          rows: tanks.length > 0
            ? tanks.map((t: any) => [
                t.tankName || 'Tank',
                t.fuelType,
                formatLiters(t.capacity || 0),
                formatLiters(t.currentFuel || 0),
                `${Math.round(((t.currentFuel || 0) / (t.capacity || 1)) * 100)}%`,
              ])
            : [['No Tank Data', '-', '0 L', '0 L', '0%']],
        },
        {
          title: 'SUB-BUSINESS REVENUE (LUBRICANTS, CAR WASH, TIRE SHOP, TUCK SHOP, RESTAURANT)',
          headers: ['Business Module', 'Total Sales / Orders Count', 'Total Module Revenue (PKR)'],
          rows: [
            ['Lubricants & Engine Oils', `${lubeCount} Sales / Items`, formatCurrency(lubeRev)],
            ['Tire Repair Shop', `${tyreCount} Services`, formatCurrency(tyreRev)],
            ['Tuck Shop Mart', `${tuckCount} Items Sold`, formatCurrency(tuckRev)],
            ['Car Wash Station', `${washCount} Vehicles Washed`, formatCurrency(carWashRev)],
            ['Fast Food Restaurant', `${restaurantCount} Orders Processed`, formatCurrency(restaurantRev)],
          ],
        },
        {
          title: 'CREDIT CUSTOMERS (UDHAAR REGISTER) AUDIT',
          summaryCards: [
            { label: 'Total Udhaar Accounts', value: `${udhaarCustomers.length}` },
            { label: 'Total Credit Given', value: formatCurrency(totalUdhaarGiven) },
            { label: 'Total Payments Received', value: formatCurrency(totalUdhaarReceived) },
            { label: 'Remaining Outstanding Balance', value: formatCurrency(totalUdhaarOutstanding) },
          ],
          headers: ['Customer Name', 'Total Credit Given', 'Total Payments Received', 'Remaining Balance'],
          rows: udhaarCustomers.length > 0
            ? udhaarCustomers.map((c: any) => [
                c.customerName || c.name || 'Customer',
                formatCurrency(c.totalCredit || 0),
                formatCurrency(c.paymentReceived || 0),
                formatCurrency(c.remainingBalance || 0),
              ])
            : [['No Udhaar Customers Registered', 'PKR 0', 'PKR 0', 'PKR 0']],
        },
        {
          title: 'CREDIT CUSTOMERS COMPLETE TRANSACTION HISTORY LOG',
          headers: ['Date', 'Customer Name', 'Type', 'Description', 'Credit Added', 'Payment Received', 'Running Balance'],
          rows: allUdhaarTxs.length > 0
            ? allUdhaarTxs.map((t: any) => [
                formatDate(t.date),
                t.customerName,
                t.type === 'CREDIT_PURCHASE' ? 'Credit Added' : 'Payment Received',
                t.description || (t.type === 'CREDIT_PURCHASE' ? 'Credit Purchase' : 'Payment Received'),
                t.type === 'CREDIT_PURCHASE' ? formatCurrency(t.amount) : '-',
                t.type === 'PAYMENT_RECEIVED' ? formatCurrency(t.amount) : '-',
                formatCurrency(t.runningBalance !== undefined ? t.runningBalance : t.amount),
              ])
            : [['No Transactions Recorded', '-', '-', '-', '-', '-', 'PKR 0']],
        },
        {
          title: 'CREDIT CARD & INFINITY FLEET CARD SALES',
          summaryCards: [
            { label: 'Credit Card Sales', value: formatCurrency(creditCardRev) },
            { label: 'Infini Fleet Card Sales', value: formatCurrency(infiniCardRev) },
          ],
          headers: ['Card Type / Terminal', 'Total Monthly Transactions', 'Total Sales Amount (PKR)'],
          rows: [
            ['Credit Card POS Terminal', `${ccCount} Transactions`, formatCurrency(creditCardRev)],
            ['Infinity Fleet Card', `${infiniCount} Transactions`, formatCurrency(infiniCardRev)],
          ],
        },
        {
          title: 'BANK ACCOUNTS & TRANSACTIONS STATEMENT',
          summaryCards: [
            { label: 'Total Deposits', value: formatCurrency(totalDeposits) },
            { label: 'Total Withdrawals', value: formatCurrency(totalWithdrawals) },
            { label: 'Combined Bank Balance', value: formatCurrency(totalBankBalance) },
          ],
          headers: ['Bank Name', 'Account Title / Number', 'Deposits (PKR)', 'Withdrawals (PKR)', 'Closing Balance (PKR)'],
          rows: bankAccounts.length > 0
            ? bankAccounts.map((b: any) => {
                const bTxs = bankTxs.filter((t: any) => t.bankId === b.id || t.bankName === b.bankName);
                const dep = bTxs.filter((t: any) => t.type === 'Deposit').reduce((s: number, t: any) => s + (t.amount || 0), 0);
                const wd = bTxs.filter((t: any) => t.type === 'Withdrawal').reduce((s: number, t: any) => s + (t.amount || 0), 0);
                return [
                  b.bankName,
                  `${b.accountTitle || ''} (${b.accountNumber || 'Acc'})`,
                  formatCurrency(dep),
                  formatCurrency(wd),
                  formatCurrency(b.currentBalance || 0),
                ];
              })
            : [['No Bank Accounts Registered', '-', 'PKR 0', 'PKR 0', 'PKR 0']],
        },
        {
          title: 'EXPENSES BY CATEGORY BREAKDOWN',
          summaryCards: [
            { label: 'Total Expense Vouchers', value: `${expenses.length}` },
            { label: 'Overall Expense Total', value: formatCurrency(totalExpensesAll) },
          ],
          headers: ['Expense Category', 'Voucher / Log Count', 'Category Total (PKR)'],
          rows: Object.entries(categoryMap).map(([cat, val]) => [
            cat,
            `${val.count} Vouchers`,
            formatCurrency(val.total),
          ]),
        },
        {
          title: 'EMPLOYEES PAYROLL & ATTENDANCE SUMMARY',
          headers: ['Worker Name', 'Monthly Salary', 'Total Advance', 'Salary Paid', 'Pending Salary', 'Monthly Attendance Summary'],
          rows: employeeRows.length > 0 ? employeeRows : [['No Employees Registered', 'PKR 0', 'PKR 0', 'PKR 0', 'PKR 0', '-']],
        },
        {
          title: 'STATEMENT OF PROFIT AND LOSS',
          summaryCards: [
            { label: 'Total Business Income', value: formatCurrency(totalBusinessIncome) },
            { label: 'Total Business Expenses', value: formatCurrency(totalBusinessExpenses) },
            { label: 'Net Operating Result', value: netProfit >= 0 ? formatCurrency(netProfit) : `LOSS: ${formatCurrency(Math.abs(netProfit))}` },
          ],
          headers: ['Financial Statement Category', 'Amount (PKR)'],
          rows: [
            ['Total Business Income', formatCurrency(totalBusinessIncome)],
            ['Total Business Expenses & Outflows', `- ${formatCurrency(totalBusinessExpenses)}`],
            [netProfit >= 0 ? 'NET MONTHLY PROFIT' : 'NET MONTHLY LOSS', formatCurrency(netProfit)],
          ],
        },
        {
          title: 'FINAL CONSOLIDATED MONTHLY BUSINESS SUMMARY',
          summaryCards: [
            { label: 'Total Fuel Sold', value: formatLiters(totalFuelLiters) },
            { label: 'Total Fuel Purchased', value: formatCurrency(fuelPurchaseCost) },
            { label: 'Total Credit Outstanding', value: formatCurrency(totalUdhaarOutstanding) },
            { label: 'Net Monthly Profit / Loss', value: formatCurrency(netProfit) },
          ],
          headers: ['Summary Metric Category', 'Volume / Status Details', 'Consolidated Total (PKR)'],
          rows: [
            ['Total Fuel Sold', formatLiters(totalFuelLiters), formatCurrency(totalFuelRev)],
            ['Total Fuel Purchased', `${deliveries.length} Tankers Received`, formatCurrency(fuelPurchaseCost)],
            ['Total Lubricant Sales', `${lubeCount} Items Sold`, formatCurrency(lubeRev)],
            ['Total Tire Shop Sales', `${tyreCount} Services Logged`, formatCurrency(tyreRev)],
            ['Total Tuck Shop Sales', `${tuckCount} Items Sold`, formatCurrency(tuckRev)],
            ['Total Car Wash Sales', `${washCount} Washes Logged`, formatCurrency(carWashRev)],
            ['Total Restaurant Sales', `${restaurantCount} Orders Processed`, formatCurrency(restaurantRev)],
            ['Total Credit Outstanding', `${udhaarCustomers.length} Accounts`, formatCurrency(totalUdhaarOutstanding)],
            ['Total Bank Balance', `${bankAccounts.length} Bank Accounts`, formatCurrency(totalBankBalance)],
            ['Total Monthly Expenses', `${expenses.length} Vouchers + Purchases + Salaries`, formatCurrency(totalExpensesAll)],
            [netProfit >= 0 ? 'NET MONTHLY PROFIT' : 'NET MONTHLY LOSS', 'Final Enterprise Result', formatCurrency(netProfit)],
          ],
        },
      ];

      generateProfessionalPDF('Complete Monthly Business Report', label, sections, 'Complete_Monthly_Business_Report');
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
  const custName = customer.customerName || customer.name || 'Credit Customer';
  const rawTxs = customer.transactions || [];

  // Sort transactions chronologically from oldest to newest
  const sortedTxs = [...rawTxs].sort((a: any, b: any) => {
    const timeA = new Date(`${a.date || ''}T${a.time || '00:00'}`).getTime();
    const timeB = new Date(`${b.date || ''}T${b.time || '00:00'}`).getTime();
    if (isNaN(timeA) || isNaN(timeB)) {
      return (a.date || '').localeCompare(b.date || '');
    }
    return timeA - timeB;
  });

  let runningBal = 0;
  let totalCreditGiven = 0;
  let totalPaymentsReceived = 0;

  const rows = sortedTxs.map((t: any) => {
    const isCredit = t.type === 'CREDIT_PURCHASE';
    const amt = Number(t.amount) || 0;

    if (isCredit) {
      runningBal += amt;
      totalCreditGiven += amt;
    } else {
      runningBal -= amt;
      totalPaymentsReceived += amt;
    }

    const descParts = [];
    if (t.description) descParts.push(t.description);
    if (t.vehicleNumber) descParts.push(`Vehicle: ${t.vehicleNumber}`);
    if (t.receiptNumber) descParts.push(`Receipt #: ${t.receiptNumber}`);
    const fullDesc = descParts.length > 0 ? descParts.join(' | ') : (isCredit ? 'Credit Added' : 'Payment Received');

    return [
      formatDate(t.date),
      isCredit ? 'Credit Added' : 'Payment Received',
      fullDesc,
      isCredit ? formatCurrency(amt) : '-',
      !isCredit ? formatCurrency(amt) : '-',
      formatCurrency(runningBal),
    ];
  });

  // Calculate actual remaining balance
  const currentOutstanding = customer.remainingBalance !== undefined ? customer.remainingBalance : runningBal;

  const sections: PDFSection[] = [
    {
      title: `CUSTOMER CREDIT SUMMARY - ${custName.toUpperCase()}`,
      summaryCards: [
        { label: 'Customer Name', value: custName },
        { label: 'Current Outstanding', value: formatCurrency(currentOutstanding) },
        { label: 'Total Credit Given', value: formatCurrency(totalCreditGiven) },
        { label: 'Total Payments Received', value: formatCurrency(totalPaymentsReceived) },
        { label: 'Remaining Balance', value: formatCurrency(currentOutstanding) },
      ],
      headers: [],
      rows: [],
    },
    {
      title: 'TRANSACTION HISTORY (CHRONOLOGICAL LEDGER)',
      headers: ['Date', 'Transaction Type', 'Description', 'Credit Amount', 'Payment Amount', 'Running Balance'],
      rows: rows.length > 0 ? rows : [['First Entry', 'Account Creation', 'Initial Account Opening', '-', '-', formatCurrency(0)]],
    },
    {
      title: 'FINAL ACCOUNT LEDGER SUMMARY',
      summaryCards: [
        { label: 'Total Credit Given', value: formatCurrency(totalCreditGiven) },
        { label: 'Total Payments Received', value: formatCurrency(totalPaymentsReceived) },
        { label: 'Current Outstanding Balance', value: formatCurrency(currentOutstanding) },
      ],
      headers: [],
      rows: [],
    },
  ];

  const sanitized = custName.replace(/[^a-zA-Z0-9]/g, '_');
  generateProfessionalPDF(
    `Credit Customer Statement & Ledger - ${custName}`,
    `Complete Ledger History | Generated on ${new Date().toLocaleDateString()}`,
    sections,
    `Credit_Ledger_${sanitized}`
  );
};
