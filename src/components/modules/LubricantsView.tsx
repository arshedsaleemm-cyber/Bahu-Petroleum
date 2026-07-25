import React from 'react';
import { SingleSectionDailySalesView } from '../common/SingleSectionDailySalesView';
import { Package } from 'lucide-react';

export const LubricantsView: React.FC = () => {
  return (
    <SingleSectionDailySalesView
      sectionKey="Lubricants"
      title="Lubricants - Daily Total Sales"
      subtitle="Record total daily revenue for engine oil, gear oil, and lubricant sales."
      amountLabel="Total Daily Sales (PKR)"
      icon={Package}
      badgeColorBg="bg-orange-100"
      badgeColorText="text-orange-900"
    />
  );
};
