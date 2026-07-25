import React from 'react';
import { SingleSectionDailySalesView } from '../common/SingleSectionDailySalesView';
import { CircleDot } from 'lucide-react';

export const TyreShopView: React.FC = () => {
  return (
    <SingleSectionDailySalesView
      sectionKey="Tyre Shop"
      title="Tyre Shop - Daily Total Sales"
      subtitle="Record total daily revenue for tyre sales, punctures, balancing, and alignment services."
      amountLabel="Total Daily Sales (PKR)"
      icon={CircleDot}
      badgeColorBg="bg-purple-100"
      badgeColorText="text-purple-900"
    />
  );
};
