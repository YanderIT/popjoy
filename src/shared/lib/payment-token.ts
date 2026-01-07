import { envConfigs } from '@/config';

export interface PaymentTokenPayload {
  orderId: string;
  orderNo: string;
  exp: number; // 过期时间戳 (ms)
}

const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15分钟

/**
 * 生成 HMAC-SHA256 签名 (兼容 Edge Runtime)
 */
async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const dataToSign = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, dataToSign);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Base64 URL 安全编码
 */
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64 URL 安全解码
 */
function base64UrlDecode(str: string): string {
  const pad = str.length % 4;
  const padded = pad ? str + '='.repeat(4 - pad) : str;
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

/**
 * 生成支付 Token (A站用)
 * Token 格式: base64url(payload).signature
 */
export async function generatePaymentToken(
  orderId: string,
  orderNo: string
): Promise<string> {
  const secret = envConfigs.payment_token_secret;
  if (!secret) {
    throw new Error('PAYMENT_TOKEN_SECRET is not configured');
  }

  const payload: PaymentTokenPayload = {
    orderId,
    orderNo,
    exp: Date.now() + TOKEN_EXPIRY_MS,
  };

  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadStr);
  const signature = await hmacSign(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

/**
 * 验证支付 Token (B站用)
 * 返回 payload 或 null（如果验证失败或过期）
 */
export async function verifyPaymentToken(
  token: string
): Promise<PaymentTokenPayload | null> {
  const secret = envConfigs.payment_token_secret;
  if (!secret) {
    console.error('PAYMENT_TOKEN_SECRET is not configured');
    return null;
  }

  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) {
      return null;
    }

    // 验证签名
    const expectedSignature = await hmacSign(encodedPayload, secret);
    if (signature !== expectedSignature) {
      console.error('Payment token signature mismatch');
      return null;
    }

    // 解码 payload
    const payloadStr = base64UrlDecode(encodedPayload);
    const payload: PaymentTokenPayload = JSON.parse(payloadStr);

    // 检查过期
    if (Date.now() > payload.exp) {
      console.error('Payment token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Payment token verification failed:', error);
    return null;
  }
}
