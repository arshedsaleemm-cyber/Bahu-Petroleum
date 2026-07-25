import React from 'react';
import { SingleSectionDailySalesView } from '../common/SingleSectionDailySalesView';
import { ShoppingBag } from 'lucide-react';

export const TuckShopView: React.FC = () => {
  return (
    <SingleSectionDailySalesView
      sectionKey="Tuck Shop"
      title="Tuck Shop - Daily Total Sales"
      subtitle="Record total daily revenue for snacks, beverages, and general tuck shop items."
      amountLabel="Total Daily Sales (PKR)"
      icon={ShoppingBag}
      badgeColorBg="bg-emerald-100"
      badgeColorText="text-emerald-900"
    />
  );
};
