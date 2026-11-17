export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // 4 random alphanumeric characters (excluding confusing 0/O/1/I)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WSI-${year}${month}${day}-${rand}`;
}

export function getMayarApiBase(): string {
  // Default to Mayar Sandbox V2 first until production key & base are configured
  return process.env.MAYAR_API_BASE || 'https://api.mayar.io/hl/v2';
}

export interface MayarInvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

export interface CreateInvoiceParams {
  orderId: string;
  name: string;
  email: string;
  mobile: string;
  items: MayarInvoiceItem[];
  redirectUrl: string;
}

export interface MayarInvoiceResponse {
  success: boolean;
  invoiceId?: string;
  paymentUrl?: string;
  expiredAt?: string;
  isSandboxSimulation?: boolean;
  error?: string;
}

export async function createMayarInvoice(params: CreateInvoiceParams): Promise<MayarInvoiceResponse> {
  const apiKey = process.env.MAYAR_API_KEY;
  const baseUrl = getMayarApiBase();

  // Expire in 24 hours UTC
  const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // If no Mayar API key is provided, provide sandbox test simulation route
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_mayar_api_key_here') {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return {
      success: true,
      invoiceId: `INV-MOCK-${params.orderId}`,
      paymentUrl: `${siteUrl}/preorder/keychain-strava/sandbox-pay?orderId=${params.orderId}`,
      expiredAt,
      isSandboxSimulation: true,
    };
  }

  try {
    const payload = {
      name: params.name,
      email: params.email,
      mobile: params.mobile,
      items: params.items,
      extraData: {
        orderId: params.orderId,
        product: 'keychain-strava',
      },
      redirectUrl: params.redirectUrl,
      expiredAt,
    };

    const res = await fetch(`${baseUrl}/invoices/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || (data.status && data.status !== 'success' && data.statusCode !== 200 && data.statusCode !== 201)) {
      console.error('Mayar invoice creation failed:', data);
      return {
        success: false,
        error: data.message || data.error || 'Failed to create Mayar invoice',
      };
    }

    // Mayar V2 invoice url structure
    const invoiceData = data.data || data;
    const paymentUrl = invoiceData.url || invoiceData.link || invoiceData.paymentUrl;
    const invoiceId = invoiceData.id || invoiceData.invoiceId;

    return {
      success: true,
      invoiceId,
      paymentUrl,
      expiredAt: invoiceData.expiredAt || expiredAt,
    };
  } catch (err: any) {
    console.error('Error contacting Mayar API:', err);
    return {
      success: false,
      error: err.message || 'Internal network error contacting Mayar gateway',
    };
  }
}

export async function verifyMayarTransaction(transactionId: string): Promise<any | null> {
  const apiKey = process.env.MAYAR_API_KEY;
  const baseUrl = getMayarApiBase();

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_mayar_api_key_here') {
    return null;
  }

  try {
    const res = await fetch(`${baseUrl}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`Failed to verify Mayar transaction ${transactionId}: HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.data || data;
  } catch (err) {
    console.error(`Exception verifying Mayar transaction ${transactionId}:`, err);
    return null;
  }
}
