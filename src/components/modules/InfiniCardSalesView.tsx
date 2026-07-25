import React from 'react';
import { SingleSectionDailySalesView } from '../common/SingleSectionDailySalesView';
import { Layers } from 'lucide-react';

export const InfiniCardSalesView: React.FC = () => {
  return (
    <SingleSectionDailySalesView
      sectionKey="Infinity Card"
      title="Infinity Card - Daily Total Sales"
      subtitle="Record total daily sales received via Infinity fleet card machine settlements."
      amountLabel="Total Daily Sales Received via Infinity Card (PKR)"
      icon={Layers}
      badgeColorBg="bg-rose-100"
      badgeColorText="text-rose-900"
    />
  );
};
