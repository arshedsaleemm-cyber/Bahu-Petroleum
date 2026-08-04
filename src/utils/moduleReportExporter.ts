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

      const sections: PDFSection[] = [
        {
          title: 'Fuel Sales Records Log',
          summaryCards: [
            { label: 'Super Petrol Sales (PKR)', value: formatCurrency(superPetrolRev) },
            { label: 'High-Speed Diesel Sales (PKR)', value: formatCurrency(hsdRev) },
            { label: 'Excellium High-Octane Sales (PKR)', value: formatCurrency(excelliumRev) },
            { label: 'Total Fuel Sales Revenue', value: formatCurrency(totalFuelSalesAmt) },
          ],
          headers: ['Date', 'Fuel Type', 'Tank', 'Litres Sold', 'Selling Price Per Litre', 'Total Sale Amount'],
          rows: fuelSales.length > 0
            ? fuelSales.map((s: any) => {
                const price = s.sellingPricePerLiter || s.sellingPrice || s.rate || (s.quantityLiters ? s.totalSaleAmount / s.quantityLiters : 0);
                return [
                  formatDate(s.date),
                  s.fuelType,
                  s.tankName || `Tank ${s.tankId || 1}`,
                  formatLiters(s.quantityLiters || 0),
                  `PKR ${Number(price).toFixed(2)}`,
                  formatCurrency(s.totalSaleAmount || 0),
                ];
              })
            : [['No Fuel Sales Records', '-', '-', '0 L', 'PKR 0.00', 'PKR 0']],
        },
        {
          title: 'Monthly Summary',
          summaryCards: [
            { label: 'Super Petrol Sales (PKR)', value: formatCurrency(superPetrolRev) },
            { label: 'High-Speed Diesel Sales (PKR)', value: formatCurrency(hsdRev) },
            { label: 'Excellium High-Octane Sales (PKR)', value: formatCurrency(excelliumRev) },
            { label: 'Total Fuel Sales Revenue', value: formatCurrency(totalFuelSalesAmt) },
          ],
          headers: ['Fuel Category', 'Litres Sold', 'Total Sales Revenue (PKR)'],
          rows: [
            ['Super Petrol Sales', formatLiters(superPetrolLiters), formatCurrency(superPetrolRev)],
            ['High-Speed Diesel Sales', formatLiters(hsdLiters), formatCurrency(hsdRev)],
            ['Excellium High-Octane Sales', formatLiters(excelliumLiters), formatCurrency(excelliumRev)],
            ['TOTAL FUEL SALES REVENUE', formatLiters(totalLiters), formatCurrency(totalFuelSalesAmt)],
          ],
        },
      ];

      generateProfessionalPDF('Fuel Sales Report', label, sections, 'Fuel_Sales_Report');
      break;
    }

    case 'DELIVERIES': {
      const deliveries = (appState.deliveries || []).filter((d: any) => isDateInRange(d.deliveryDate, range));
      
      const petrolDeliveries = deliveries.filter((d: any) => d.fuelType === 'Super Petrol' || d.fuelType === 'Petrol');
      const petrolLiters = petrolDeliveries.reduce((sum: number, d: any) => sum + (d.totalLitersReceived || d.petrolLiters || 0), 0);
      
      const dieselDeliveries = deliveries.filter((d: any) => d.fuelType === 'High-Speed Diesel (HSD)' || d.fuelType === 'Diesel');
      const dieselLiters = dieselDeliveries.reduce((sum: number, d: any) => sum + (d.totalLitersReceived || d.dieselLiters || 0), 0);
      
      const excelliumDeliveries = deliveries.filter((d: any) => d.fuelType === 'Excellium High-Octane' || d.fuelType === 'High Octane');
      const excelliumLiters = excelliumDeliveries.reduce((sum: number, d: any) => sum + (d.totalLitersReceived || 0), 0);
      
      const totalCost = deliveries.reduce((sum: number, d: any) => sum + (d.totalPurchaseAmount || 0), 0);

      // Shortages & Overages
      const tanks = appState.tanks || [];
      let totalShortage = 0;
      let totalOverage = 0;

      const dipRows = tanks.map((t: any) => {
        const physicalDip = t.currentDipReading || t.currentFuel || 0;
        const calcStock = t.calculatedStock !== undefined ? t.calculatedStock : t.currentFuel;
        const diff = physicalDip - calcStock;
        const shortage = diff < 0 ? Math.abs(diff) : 0;
        const overage = diff > 0 ? diff : 0;
        totalShortage += shortage;
        totalOverage += overage;

        return [
          t.tankName || 'Tank',
          formatLiters(physicalDip),
          formatLiters(calcStock),
          `${diff >= 0 ? '+' : ''}${formatLiters(diff)}`,
          formatLiters(shortage),
          formatLiters(overage),
        ];
      });

      const sections: PDFSection[] = [
        {
          title: 'Fuel Delivery Log',
          summaryCards: [
            { label: 'Total Deliveries Received', value: `${deliveries.length} Tankers` },
            { label: 'Total Purchase Cost', value: formatCurrency(totalCost) },
          ],
          headers: ['Delivery Date', 'Fuel Type', 'Tank Name', 'Quantity Received (Litres)', 'Purchase Rate Per Litre', 'Total Purchase Cost'],
          rows: deliveries.length > 0
            ? deliveries.map((d: any) => {
                const rate = d.fuelRate || d.purchaseRate || (d.totalLitersReceived ? d.totalPurchaseAmount / d.totalLitersReceived : 0);
                return [
                  formatDate(d.deliveryDate),
                  d.fuelType,
                  d.tankName || d.destinationTank || 'Tank 1',
                  formatLiters(d.totalLitersReceived || 0),
                  `PKR ${Number(rate).toFixed(2)}`,
                  formatCurrency(d.totalPurchaseAmount || 0),
                ];
              })
            : [['No Deliveries Recorded', '-', '-', '0 L', 'PKR 0.00', 'PKR 0']],
        },
        {
          title: 'Monthly Delivery Summary',
          summaryCards: [
            { label: 'Total Super Petrol Delivered', value: formatLiters(petrolLiters) },
            { label: 'Total High-Speed Diesel Delivered', value: formatLiters(dieselLiters) },
            { label: 'Total Excellium High-Octane Delivered', value: formatLiters(excelliumLiters) },
            { label: 'Total Purchase Cost', value: formatCurrency(totalCost) },
          ],
          headers: ['Fuel Category', 'Total Volume Delivered (L)', 'Total Purchase Cost (PKR)'],
          rows: [
            ['Total Super Petrol Delivered', formatLiters(petrolLiters), '-'],
            ['Total High-Speed Diesel Delivered', formatLiters(dieselLiters), '-'],
            ['Total Excellium High-Octane Delivered', formatLiters(excelliumLiters), '-'],
            ['TOTAL PURCHASE COST', formatLiters(petrolLiters + dieselLiters + excelliumLiters), formatCurrency(totalCost)],
          ],
        },
        {
          title: 'Fuel Dip & Shortage Summary',
          summaryCards: [
            { label: 'Total Monthly Shortage', value: formatLiters(totalShortage) },
            { label: 'Total Monthly Overage', value: formatLiters(totalOverage) },
          ],
          headers: ['Tank Name', 'Physical Dip Reading', 'Calculated Stock', 'Difference', 'Shortage', 'Overage'],
          rows: dipRows.length > 0 ? dipRows : [['No Tank Dip Records', '0 L', '0 L', '0 L', '0 L', '0 L']],
        },
      ];
      generateProfessionalPDF('Fuel Delivery Report', label, sections, 'Fuel_Delivery_Report');
      break;
    }

    case 'TANKS':
    case 'TANK_STOCK': {
      const tanks = appState.tanks || [];
      const fuelSales = (appState.fuelSales || []).filter((s: any) => isDateInRange(s.date, range));
      const deliveries = (appState.deliveries || []).filter((d: any) => isDateInRange(d.deliveryDate, range));

      const rows = tanks.map((t: any) => {
        const openingStock = Number(t.openingStock ?? t.currentFuel ?? 0);

        const tDeliveries = deliveries.filter((d: any) => d.destinationTank === t.tankName || d.tankName === t.tankName || d.tankId === t.id);
        const fuelRec = tDeliveries.reduce((sum: number, d: any) => sum + (d.totalLitersReceived || 0), 0);

        const tSales = fuelSales.filter((s: any) => s.tankName === t.tankName || s.tankId === t.id);
        const fuelSold = tSales.reduce((sum: number, s: any) => sum + (s.quantityLiters || 0), 0);

        const closingStock = Math.max(0, openingStock + fuelRec - fuelSold);

        return [
          t.tankName || 'Tank',
          t.fuelType || 'Fuel',
          formatLiters(openingStock),
          formatLiters(fuelRec),
          formatLiters(fuelSold),
          formatLiters(closingStock),
        ];
      });

      const totalOpening = tanks.reduce((acc: number, t: any) => acc + Number(t.openingStock ?? t.currentFuel ?? 0), 0);
      const totalDelivered = deliveries.reduce((acc: number, d: any) => acc + (d.totalLitersReceived || 0), 0);
      const totalSold = fuelSales.reduce((acc: number, s: any) => acc + (s.quantityLiters || 0), 0);
      const totalClosing = Math.max(0, totalOpening + totalDelivered - totalSold);

      const sections: PDFSection[] = [
        {
          title: 'Tank Stock & Fuel Balance Audit',
          summaryCards: [
            { label: 'Opening Stock', value: formatLiters(totalOpening) },
            { label: 'Fuel Delivered During Period', value: formatLiters(totalDelivered) },
            { label: 'Fuel Sold During Period', value: formatLiters(totalSold) },
            { label: 'Closing Stock', value: formatLiters(totalClosing) },
          ],
          headers: ['Tank Name', 'Fuel Type', 'Opening Stock', 'Fuel Delivered', 'Fuel Sold', 'Closing Stock'],
          rows: rows.length > 0 ? rows : [['No Tanks Configured', '-', '0 L', '0 L', '0 L', '0 L']],
        },
      ];
      generateProfessionalPDF('Tank Management Report', label, sections, 'Tank_Management_Report');
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
      const lubeSales = (appState.dailySalesEntries || []).filter((s: any) => s.section === 'Lubricants' && isDateInRange(s.date, range));
      const lubricants = appState.lubricants || [];
      const totalSaleAmount = lubeSales.reduce((sum: number, s: any) => sum + (s.totalSales || 0), 0);

      const rows = lubeSales.map((s: any) => [
        formatDate(s.date),
        s.productName || s.notes || 'Engine Oil / Lubricant',
        `${s.quantitySold || 1} Units`,
        formatCurrency(s.totalSales || 0),
      ]);

      const sections: PDFSection[] = [
        {
          title: 'Lubricant Sales Log',
          summaryCards: [
            { label: 'Total Sales Transactions', value: `${lubeSales.length}` },
            { label: 'Monthly Total Sale Amount', value: formatCurrency(totalSaleAmount) },
          ],
          headers: ['Date', 'Product', 'Quantity Sold', 'Total Sale Amount'],
          rows: rows.length > 0 ? rows : [['No Sales Recorded', '-', '0 Units', 'PKR 0']],
        },
        {
          title: 'Lubricant Inventory Summary',
          headers: ['Product Name', 'Remaining Stock', 'Selling Price'],
          rows: lubricants.map((l: any) => [
            l.productName,
            `${l.remainingStock || 0} Units`,
            formatCurrency(l.sellingPrice || 0),
          ]),
        },
      ];
      generateProfessionalPDF('Lubricant Report', label, sections, 'Lubricant_Report');
      break;
    }

    case 'WORKERS': {
      const workers = appState.workers || [];
      const salaries = appState.salaries || [];

      const sections: PDFSection[] = [
        {
          title: 'Employee Report Directory',
          summaryCards: [
            { label: 'Total Employees', value: `${workers.length}` },
          ],
          headers: ['Worker Name', 'Monthly Salary', 'Salary Paid', 'Advance', 'Pending Salary'],
          rows: workers.map((w: any) => {
            const sal = salaries.find((s: any) => s.workerId === w.id);
            const mSal = w.basicSalary || w.monthlySalary || sal?.monthlySalary || 0;
            const paid = sal?.salaryPaid || 0;
            const adv = sal?.totalAdvance || 0;
            const pending = sal?.pendingSalary !== undefined ? sal.pendingSalary : Math.max(0, mSal - paid);

            return [
              w.name,
              formatCurrency(mSal),
              formatCurrency(paid),
              formatCurrency(adv),
              formatCurrency(pending),
            ];
          }),
        },
      ];
      generateProfessionalPDF('Employee Report', label, sections, 'Employee_Report');
      break;
    }

    case 'ATTENDANCE': {
      const workers = appState.workers || [];
      const attendance = appState.attendanceLogs || appState.attendance || [];

      const rows = workers.map((w: any) => {
        const wLogs = attendance.filter((a: any) => (a.workerId === w.id || a.workerName === w.name) && isDateInRange(a.date, range));
        const presentDays = wLogs.filter((a: any) => a.status === 'Present').length;
        const absentDays = wLogs.filter((a: any) => a.status === 'Absent').length;
        const leaveDays = wLogs.filter((a: any) => a.status === 'Leave').length;

        return [
          w.name,
          `${presentDays} Days`,
          `${absentDays} Days`,
          `${leaveDays} Days`,
        ];
      });

      const sections: PDFSection[] = [
        {
          title: 'Employee Attendance Summary Report',
          headers: ['Worker Name', 'Present Days', 'Absent Days', 'Leave Days'],
          rows: rows.length > 0 ? rows : [['No Employees Registered', '0 Days', '0 Days', '0 Days']],
        },
      ];
      generateProfessionalPDF('Attendance Report', label, sections, 'Attendance_Report');
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

    case 'CREDIT_CUSTOMERS': {
      const customers = appState.creditCustomers || [];
      const txs = (appState.creditTransactions || []).filter((t: any) => isDateInRange(t.date, range));

      const sections: PDFSection[] = [];

      // Overall Summary Section
      const totalCreditGiven = txs.filter((t: any) => t.type === 'CREDIT' || t.creditAmount > 0).reduce((s: number, t: any) => s + (t.creditAmount || t.amount || 0), 0);
      const totalPaymentsRec = txs.filter((t: any) => t.type === 'PAYMENT' || t.paymentAmount > 0).reduce((s: number, t: any) => s + (t.paymentAmount || t.amount || 0), 0);
      const totalOutstanding = customers.reduce((s: number, c: any) => s + (c.currentBalance || c.balance || 0), 0);

      sections.push({
        title: 'Credit Customers Ledger Overview',
        summaryCards: [
          { label: 'Total Credit Customers', value: `${customers.length}` },
          { label: 'Total Credit Given', value: formatCurrency(totalCreditGiven) },
          { label: 'Total Payments Received', value: formatCurrency(totalPaymentsRec) },
          { label: 'Total Outstanding Balance', value: formatCurrency(totalOutstanding) },
        ],
        headers: ['Customer Name', 'Total Credit Given', 'Total Payments Received', 'Outstanding Balance'],
        rows: customers.map((c: any) => {
          const cTxs = txs.filter((t: any) => t.customerId === c.id || t.customerName === c.name);
          const cGiven = cTxs.filter((t: any) => t.type === 'CREDIT' || t.creditAmount > 0).reduce((s: number, t: any) => s + (t.creditAmount || t.amount || 0), 0);
          const cPaid = cTxs.filter((t: any) => t.type === 'PAYMENT' || t.paymentAmount > 0).reduce((s: number, t: any) => s + (t.paymentAmount || t.amount || 0), 0);
          const bal = c.currentBalance !== undefined ? c.currentBalance : (c.balance || cGiven - cPaid);

          return [
            c.name,
            formatCurrency(cGiven),
            formatCurrency(cPaid),
            formatCurrency(bal),
          ];
        }),
      });

      // Individual Customer Detailed Ledgers
      customers.forEach((c: any) => {
        const cTxs = (appState.creditTransactions || [])
          .filter((t: any) => (t.customerId === c.id || t.customerName === c.name) && isDateInRange(t.date, range))
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const cGiven = cTxs.filter((t: any) => t.type === 'CREDIT' || t.creditAmount > 0).reduce((s: number, t: any) => s + (t.creditAmount || t.amount || 0), 0);
        const cPaid = cTxs.filter((t: any) => t.type === 'PAYMENT' || t.paymentAmount > 0).reduce((s: number, t: any) => s + (t.paymentAmount || t.amount || 0), 0);
        const currentBal = c.currentBalance !== undefined ? c.currentBalance : (c.balance || cGiven - cPaid);

        let runningBal = 0;
        const txRows = cTxs.map((t: any) => {
          const isCredit = t.type === 'CREDIT' || (t.creditAmount && t.creditAmount > 0);
          const creditAdded = isCredit ? (t.creditAmount || t.amount || 0) : 0;
          const paymentRec = !isCredit ? (t.paymentAmount || t.amount || 0) : 0;
          runningBal = runningBal + creditAdded - paymentRec;

          return [
            formatDate(t.date),
            isCredit ? 'Credit Added' : 'Payment Received',
            creditAdded > 0 ? formatCurrency(creditAdded) : '-',
            paymentRec > 0 ? formatCurrency(paymentRec) : '-',
            formatCurrency(runningBal),
          ];
        });

        sections.push({
          title: `Customer Ledger: ${c.name}`,
          summaryCards: [
            { label: 'Customer Name', value: c.name },
            { label: 'Total Credit Given', value: formatCurrency(cGiven) },
            { label: 'Total Payments Received', value: formatCurrency(cPaid) },
            { label: 'Outstanding Balance', value: formatCurrency(currentBal) },
          ],
          headers: ['Date', 'Transaction Type', 'Credit Added', 'Payment Received', 'Running Balance'],
          rows: txRows.length > 0 ? txRows : [['No Transactions', '-', '-', '-', formatCurrency(currentBal)]],
        });
      });

      generateProfessionalPDF('Credit Customer Report', label, sections, 'Credit_Customer_Report');
      break;
    }

    case 'CREDIT_CARD': {
      const ccSales = (appState.creditCardSales || []).filter((c: any) => isDateInRange(c.date, range));
      const totalCC = ccSales.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'POS Credit Card Sales Log',
          summaryCards: [
            { label: 'Card Transactions', value: `${ccSales.length}` },
            { label: 'Monthly Total Revenue', value: formatCurrency(totalCC) },
          ],
          headers: ['Date', 'Amount'],
          rows: ccSales.length > 0
            ? ccSales.map((c: any) => [
                formatDate(c.date),
                formatCurrency(c.amount || 0),
              ])
            : [['No Card Transactions', 'PKR 0']],
        },
      ];
      generateProfessionalPDF('Credit Card Report', label, sections, 'Credit_Card_Report');
      break;
    }

    case 'INFINI_CARD': {
      const infiniSales = (appState.infiniCardSales || []).filter((i: any) => isDateInRange(i.date, range));
      const totalInfini = infiniSales.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Infinity Fleet Card Sales Log',
          summaryCards: [
            { label: 'Fleet Transactions', value: `${infiniSales.length}` },
            { label: 'Monthly Total Revenue', value: formatCurrency(totalInfini) },
          ],
          headers: ['Date', 'Amount'],
          rows: infiniSales.length > 0
            ? infiniSales.map((i: any) => [
                formatDate(i.date),
                formatCurrency(i.amount || 0),
              ])
            : [['No Infinity Card Transactions', 'PKR 0']],
        },
      ];
      generateProfessionalPDF('Infinity Card Report', label, sections, 'Infinity_Card_Report');
      break;
    }

    case 'BANK': {
      const txs = (appState.bankTransactions || []).filter((t: any) => isDateInRange(t.date, range));
      const bankAccounts = appState.bankAccounts || [];
      
      let runningBal = bankAccounts.reduce((sum: number, b: any) => sum + (b.openingBalance || b.currentBalance || 0), 0);

      const rows = txs.map((t: any) => {
        const deposit = t.type === 'DEPOSIT' || t.amount > 0 ? Math.abs(t.amount) : 0;
        const withdrawal = t.type === 'WITHDRAWAL' || t.amount < 0 ? Math.abs(t.amount) : 0;
        runningBal = runningBal + deposit - withdrawal;

        return [
          formatDate(t.date),
          deposit > 0 ? formatCurrency(deposit) : '-',
          withdrawal > 0 ? formatCurrency(withdrawal) : '-',
          formatCurrency(runningBal),
        ];
      });

      const sections: PDFSection[] = [
        {
          title: 'Bank Statement Log',
          summaryCards: [
            { label: 'Active Bank Accounts', value: `${bankAccounts.length}` },
            { label: 'Current Closing Balance', value: formatCurrency(runningBal) },
          ],
          headers: ['Date', 'Deposit', 'Withdrawal', 'Closing Balance'],
          rows: rows.length > 0 ? rows : [['No Transactions', '-', '-', formatCurrency(runningBal)]],
        },
      ];
      generateProfessionalPDF('Bank Report', label, sections, 'Bank_Report');
      break;
    }

    case 'EXPENSES': {
      // Exclude fuel purchase invoices
      const expenses = (appState.expenses || []).filter(
        (e: any) => isDateInRange(e.date, range) && e.category !== 'Fuel Purchase' && !e.title?.toLowerCase().includes('fuel delivery')
      );
      const totalExp = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      // Category Totals
      const catMap: Record<string, number> = {};
      expenses.forEach((e: any) => {
        const cat = e.category || 'General';
        catMap[cat] = (catMap[cat] || 0) + (e.amount || 0);
      });

      const catRows = Object.entries(catMap).map(([cat, amt]) => [cat, formatCurrency(amt)]);

      const sections: PDFSection[] = [
        {
          title: 'General Business Expenses Log',
          summaryCards: [
            { label: 'Total Expense Vouchers', value: `${expenses.length}` },
            { label: 'Overall Expense Total', value: formatCurrency(totalExp) },
          ],
          headers: ['Date', 'Expense Category', 'Description', 'Amount'],
          rows: expenses.length > 0
            ? expenses.map((e: any) => [
                formatDate(e.date),
                e.category || 'General',
                e.description || e.title || e.notes || '-',
                formatCurrency(e.amount || 0),
              ])
            : [['No Expenses Logged', '-', '-', 'PKR 0']],
        },
        {
          title: 'Category Totals Summary',
          headers: ['Expense Category', 'Total Amount (PKR)'],
          rows: catRows.length > 0 ? catRows : [['No Expense Categories', 'PKR 0']],
        },
      ];
      generateProfessionalPDF('Expense Report', label, sections, 'Expense_Report');
      break;
    }

    case 'CAR_WASH': {
      const washes = (appState.carWashServices || []).filter((c: any) => isDateInRange(c.date || c.dateTime?.slice(0, 10), range));
      const totalRev = washes.reduce((sum: number, c: any) => sum + (c.serviceFee || c.amount || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Car Wash Sales Log',
          summaryCards: [
            { label: 'Vehicles Serviced', value: `${washes.length}` },
            { label: 'Monthly Total Revenue', value: formatCurrency(totalRev) },
          ],
          headers: ['Date', 'Package / Service', 'Vehicle #', 'Amount'],
          rows: washes.length > 0
            ? washes.map((c: any) => [
                formatDate(c.date || c.dateTime?.slice(0, 10)),
                c.serviceType || c.packageName || 'Full Car Wash',
                c.vehicleNumber || c.plateNo || 'N/A',
                formatCurrency(c.serviceFee || c.amount || 0),
              ])
            : [['No Car Wash Records', '-', '-', 'PKR 0']],
        },
      ];
      generateProfessionalPDF('Car Wash Report', label, sections, 'Car_Wash_Report');
      break;
    }

    case 'TYRE_SHOP': {
      const tireSales = (appState.tyreServices || appState.tyreShopSales || []).filter((t: any) => isDateInRange(t.date, range));
      const totalRev = tireSales.reduce((sum: number, t: any) => sum + (t.amount || t.price || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Tire Shop Sales Log',
          summaryCards: [
            { label: 'Services / Products Sold', value: `${tireSales.length}` },
            { label: 'Monthly Total Revenue', value: formatCurrency(totalRev) },
          ],
          headers: ['Date', 'Service / Product', 'Amount'],
          rows: tireSales.length > 0
            ? tireSales.map((t: any) => [
                formatDate(t.date),
                t.serviceName || t.productName || t.notes || 'Tire Service / Repair',
                formatCurrency(t.amount || t.price || 0),
              ])
            : [['No Tire Shop Records', '-', 'PKR 0']],
        },
      ];
      generateProfessionalPDF('Tire Shop Report', label, sections, 'Tire_Shop_Report');
      break;
    }

    case 'TUCK_SHOP': {
      const martSales = (appState.tuckShopSales || appState.martSales || []).filter((m: any) => isDateInRange(m.date, range));
      const totalRev = martSales.reduce((sum: number, m: any) => sum + (m.amount || m.totalPrice || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Tuck Shop / Mart Sales Log',
          summaryCards: [
            { label: 'Sales Transactions', value: `${martSales.length}` },
            { label: 'Monthly Total Revenue', value: formatCurrency(totalRev) },
          ],
          headers: ['Date', 'Item / Description', 'Amount'],
          rows: martSales.length > 0
            ? martSales.map((m: any) => [
                formatDate(m.date),
                m.itemName || m.description || m.notes || 'Mart Items Sale',
                formatCurrency(m.amount || m.totalPrice || 0),
              ])
            : [['No Tuck Shop Records', '-', 'PKR 0']],
        },
      ];
      generateProfessionalPDF('Tuck Shop Report', label, sections, 'Tuck_Shop_Report');
      break;
    }

    case 'RESTAURANT': {
      const restSales = (appState.restaurantSales || []).filter((r: any) => isDateInRange(r.date, range));
      const totalRev = restSales.reduce((sum: number, r: any) => sum + (r.amount || r.totalBill || 0), 0);

      const sections: PDFSection[] = [
        {
          title: 'Restaurant Sales Log',
          summaryCards: [
            { label: 'Customer Orders', value: `${restSales.length}` },
            { label: 'Monthly Total Revenue', value: formatCurrency(totalRev) },
          ],
          headers: ['Date', 'Order / Items', 'Amount'],
          rows: restSales.length > 0
            ? restSales.map((r: any) => [
                formatDate(r.date),
                r.orderItems || r.dishName || r.notes || 'Food Order',
                formatCurrency(r.amount || r.totalBill || 0),
              ])
            : [['No Restaurant Records', '-', 'PKR 0']],
        },
      ];
      generateProfessionalPDF('Restaurant Report', label, sections, 'Restaurant_Report');
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
          title: 'UNDERGROUND TANK STORAGE & REMAINING STOCK AUDIT',
          summaryCards: [
            { label: 'Total Opening Stock', value: formatLiters(tanks.reduce((s: number, t: any) => s + Number(t.openingStock ?? t.currentFuel ?? 0), 0)) },
            { label: 'Fuel Delivered During Period', value: formatLiters(totalFuelDeliveredLiters) },
            { label: 'Fuel Sold During Period', value: formatLiters(totalFuelLiters) },
            { label: 'Total Closing Stock', value: formatLiters(totalCurrentTankStock) },
          ],
          headers: ['Tank Name', 'Fuel Type', 'Opening Stock', 'Fuel Delivered', 'Fuel Sold', 'Closing Stock'],
          rows: tanks.length > 0
            ? tanks.map((t: any) => {
                const tDeliveries = deliveries.filter((d: any) => d.destinationTank === t.tankName || d.tankName === t.tankName || d.tankId === t.id);
                const fuelRec = tDeliveries.reduce((sum: number, d: any) => sum + (d.totalLitersReceived || 0), 0);
                const tSales = fuelSales.filter((s: any) => s.tankName === t.tankName || s.tankId === t.id);
                const fuelSold = tSales.reduce((sum: number, s: any) => sum + (s.quantityLiters || 0), 0);
                const opStock = Number(t.openingStock ?? t.currentFuel ?? 0);
                const clStock = Math.max(0, opStock + fuelRec - fuelSold);
                return [
                  t.tankName || 'Tank',
                  t.fuelType,
                  formatLiters(opStock),
                  formatLiters(fuelRec),
                  formatLiters(fuelSold),
                  formatLiters(clStock),
                ];
              })
            : [['No Tank Data', '-', '0 L', '0 L', '0 L', '0 L']],
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
