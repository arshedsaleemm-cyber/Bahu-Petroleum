export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return 'Rs. 0';
  return 'Rs. ' + amount.toLocaleString('en-PK', { maximumFractionDigits: 2 });
};

export const formatLiters = (liters: number): string => {
  if (isNaN(liters)) return '0 L';
  return liters.toLocaleString('en-PK', { maximumFractionDigits: 1 }) + ' L';
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  return timeString;
};
