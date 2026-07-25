import React from 'react';
import { SingleSectionDailySalesView } from '../common/SingleSectionDailySalesView';
import { Droplets } from 'lucide-react';

export const DailyPetrolCashView: React.FC = () => {
  return (
    <SingleSectionDailySalesView
      sectionKey="Daily Petrol Cash"
      title="Daily Petrol Cash"
      subtitle="Record total cash received from Petrol sales for the day. No nozzle or customer details required."
      amountLabel="Total Petrol Cash Received (PKR)"
      icon={Droplets}
      badgeColorBg="bg-teal-100"
      badgeColorText="text-teal-900"
    />
  );
};
