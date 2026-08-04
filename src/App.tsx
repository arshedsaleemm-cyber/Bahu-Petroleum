import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { FAB } from './components/common/FAB';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { PDFSuccessModal } from './components/common/PDFSuccessModal';

// Views
import { LoginView } from './components/modules/LoginView';
import { DashboardView } from './components/modules/DashboardView';
import { FuelDeliveriesView } from './components/modules/FuelDeliveriesView';
import { FuelSalesView } from './components/modules/FuelSalesView';
import { FuelInventoryView } from './components/modules/FuelInventoryView';
import { TankManagementView } from './components/modules/TankManagementView';
import { LubricantsView } from './components/modules/LubricantsView';
import { WorkersView } from './components/modules/WorkersView';
import { AttendanceView } from './components/modules/AttendanceView';
import { SalaryView } from './components/modules/SalaryView';
import { UdhaarView } from './components/modules/UdhaarView';
import { ExpensesView } from './components/modules/ExpensesView';
import { BankView } from './components/modules/BankView';
import { TyreShopView } from './components/modules/TyreShopView';
import { CarWashView } from './components/modules/CarWashView';
import { TuckShopView } from './components/modules/TuckShopView';
import { RestaurantView } from './components/modules/RestaurantView';
import { CreditCardSalesView } from './components/modules/CreditCardSalesView';
import { InfiniCardSalesView } from './components/modules/InfiniCardSalesView';
import { BahuAIAssistantView } from './components/modules/BahuAIAssistantView';
import { ReportsView } from './components/modules/ReportsView';
import { SettingsView } from './components/modules/SettingsView';

const MainLayout: React.FC = () => {
  const { isLoggedIn, currentView, isSearchOpen, setIsSearchOpen } = useApp();

  if (!isLoggedIn) {
    return <LoginView />;
  }

  const renderModuleView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'bahu_ai':
      case 'ai_assistant':
        return <BahuAIAssistantView />;
      case 'deliveries':
        return <FuelDeliveriesView />;
      case 'fuel_sales':
      case 'fuelsales':
        return <FuelSalesView />;
      case 'inventory':
        return <FuelInventoryView />;
      case 'tanks':
        return <TankManagementView />;
      case 'lubricants':
        return <LubricantsView />;
      case 'workers':
        return <WorkersView />;
      case 'attendance':
        return <AttendanceView />;
      case 'salary':
        return <SalaryView />;
      case 'customers':
      case 'udhaar':
        return <UdhaarView />;
      case 'expenses':
        return <ExpensesView />;
      case 'daily_petrol_cash':
        return <FuelSalesView />;
      case 'bank':
      case 'cash':
        return <BankView />;
      case 'credit_card':
        return <CreditCardSalesView />;
      case 'infini_card':
      case 'infinity_card':
        return <InfiniCardSalesView />;
      case 'tyre_shop':
      case 'tyreshop':
        return <TyreShopView />;
      case 'car_wash':
      case 'carwash':
        return <CarWashView />;
      case 'tuck_shop':
      case 'tuckshop':
        return <TuckShopView />;
      case 'restaurant':
      case 'fast_food':
      case 'fastfood':
        return <RestaurantView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased selection:bg-red-500 selection:text-white max-w-full overflow-x-hidden">
      {/* Top Header */}
      <Header />

      <div className="flex-1 flex overflow-hidden w-full max-w-full">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full max-w-full custom-scrollbar pb-20 md:pb-8 min-w-0">
          {renderModuleView()}
        </main>
      </div>

      {/* Mobile Nav */}
      <MobileNav />

      {/* Quick Action FAB */}
      <FAB />

      {/* Global Search */}
      {isSearchOpen && <GlobalSearchModal onClose={() => setIsSearchOpen(false)} />}

      {/* Global PDF Export Confirmation & Share Modal */}
      <PDFSuccessModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
