import React from 'react';
import { SingleSectionDailySalesView } from '../common/SingleSectionDailySalesView';
import { Car } from 'lucide-react';

export const CarWashView: React.FC = () => {
  return (
    <SingleSectionDailySalesView
      sectionKey="Car Wash"
      title="Car Wash - Daily Total Sales"
      subtitle="Record total daily revenue for vehicle washing, detailing, and service washes."
      amountLabel="Total Daily Sales (PKR)"
      icon={Car}
      badgeColorBg="bg-blue-100"
      badgeColorText="text-blue-900"
    />
  );
};
