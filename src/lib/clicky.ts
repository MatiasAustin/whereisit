import { PaymentProvider } from '@/types';

export type ClickyShippingRegion = 'Jabodetabek' | 'Luar Jabodetabek';

export const CLICKY_SHIPPING_RATES: Record<ClickyShippingRegion, number> = {
  'Jabodetabek': 16000,
  'Luar Jabodetabek': 20000,
};

export const CLICKY_PAYMENT_LINKS: Record<string, Record<ClickyShippingRegion, string>> = {
  // 1. Keychain Only / Tanpa Kartu (Rp119.000 + Ongkir)
  'var-57x94': {
    'Jabodetabek': 'https://clicky.id/whereisit/link/keychain-custom-data-strava-x-where-is-it-jabodetabek-pre-order-batch-2',
    'Luar Jabodetabek': 'https://clicky.id/whereisit/link/keychain-custom-data-strava-x-where-is-it-luar-jabodetabek-pre-order-batch-2',
  },
  // 2. E-money (Rp180.000 + Ongkir)
  'var-emoney': {
    'Jabodetabek': 'https://clicky.id/whereisit/link/keychain-custom-data-strava-x-where-is-it-emoney-jabodetabek-pre-order-batch-2',
    'Luar Jabodetabek': 'https://clicky.id/whereisit/link/keychain-custom-data-strava-x-where-is-it-emoney-luar-jabodetabek-pre-order-batch-2',
  },
  // 3. Flazz (Rp220.000 + Ongkir)
  'var-flazz': {
    'Jabodetabek': 'https://clicky.id/whereisit/link/keychain-custom-data-strava-x-where-is-it-flazz-jabodetabek-pre-order-batch-2',
    'Luar Jabodetabek': 'https://clicky.id/whereisit/link/keychain-custom-data-strava-x-where-is-it-flazz-luar-jabodetabek-pre-order-batch-2',
  },
};

// Aliases for variation IDs for complete backward compatibility
export function normalizeVariationId(rawId: string): string {
  const lower = (rawId || '').toLowerCase().trim();
  if (lower.includes('emoney') || lower === 'var-emoney' || lower === 'e-money') {
    return 'var-emoney';
  }
  if (lower.includes('flazz') || lower === 'var-flazz') {
    return 'var-flazz';
  }
  // Default to base variation (Keychain Only / Tanpa Kartu)
  return 'var-57x94';
}

export function getClickyPaymentLink(
  variationId: string,
  region: ClickyShippingRegion
): string {
  const normId = normalizeVariationId(variationId);
  const links = CLICKY_PAYMENT_LINKS[normId] || CLICKY_PAYMENT_LINKS['var-57x94'];
  return links[region] || links['Jabodetabek'];
}

export function getActivePaymentProvider(): PaymentProvider {
  const provider = (
    process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ||
    process.env.PAYMENT_PROVIDER ||
    'clicky'
  ).toLowerCase().trim();

  if (provider === 'mayar') {
    return 'mayar';
  }
  return 'clicky';
}

export function calculateClickyEstimatedFee(
  total: number,
  channel: 'QRIS' | 'VA' = 'QRIS'
): number {
  if (channel === 'VA') {
    return 6500;
  }
  // QRIS / E-wallet is 5%
  return Math.round(total * 0.05);
}
