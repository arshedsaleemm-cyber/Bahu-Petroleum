import React from 'react';
import { SingleSectionDailySalesView } from '../common/SingleSectionDailySalesView';
import { CreditCard } from 'lucide-react';

export const CreditCardSalesView: React.FC = () => {
  return (
    <SingleSectionDailySalesView
      sectionKey="Credit Card"
      title="Credit Card - Daily Total Sales"
      subtitle="Record total daily sales received via POS credit card machine settlements."
      amountLabel="Total Daily Sales Received via Credit Card (PKR)"
      icon={CreditCard}
      badgeColorBg="bg-indigo-100"
      badgeColorText="text-indigo-900"
    />
  );
};
