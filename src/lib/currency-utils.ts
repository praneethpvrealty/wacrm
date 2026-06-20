import {
  DollarSign,
  Euro,
  PoundSterling,
  IndianRupee,
  Coins,
} from 'lucide-react';

export function getCurrencyIcon(currency: string) {
  switch (currency) {
    case 'INR':
      return IndianRupee;
    case 'USD':
      return DollarSign;
    case 'EUR':
      return Euro;
    case 'GBP':
      return PoundSterling;
    default:
      return Coins;
  }
}

export function formatCurrency(value: number, currency: string = "INR"): string {
  if (currency === "INR") {
    if (value >= 10000000) {
      const cr = value / 10000000;
      return `₹${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
    } else if (value >= 100000) {
      const lakhs = value / 100000;
      return `₹${lakhs.toFixed(2).replace(/\.00$/, '')} Lakhs`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyShort(v: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    if (v >= 10000000) {
      const cr = v / 10000000;
      return `₹${cr.toFixed(1).replace(/\.0$/, '')} Cr`;
    }
    if (v >= 100000) {
      const lakhs = v / 100000;
      return `₹${lakhs.toFixed(1).replace(/\.0$/, '')} L`;
    }
    return `₹${v.toLocaleString('en-IN')}`;
  }

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ',
  };
  const sym = symbols[currency] || '';

  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(1)}k`
  return `${sym}${v.toFixed(0)}`
}
