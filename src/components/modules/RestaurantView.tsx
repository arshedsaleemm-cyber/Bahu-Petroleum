import React from 'react';
import { SingleSectionDailySalesView } from '../common/SingleSectionDailySalesView';
import { Utensils } from 'lucide-react';

export const RestaurantView: React.FC = () => {
  return (
    <SingleSectionDailySalesView
      sectionKey="Fast Food"
      title="Fast Food - Daily Total Sales"
      subtitle="Record total daily revenue for fast food, beverages, and restaurant counter sales."
      amountLabel="Total Daily Sales (PKR)"
      icon={Utensils}
      badgeColorBg="bg-amber-100"
      badgeColorText="text-amber-900"
    />
  );
};
