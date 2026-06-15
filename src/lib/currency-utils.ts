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
