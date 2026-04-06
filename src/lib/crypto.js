import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LEN = 12;
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');

// ─── AES-256-GCM 암호화 ─────────────────────────────────
export function encrypt(plaintext) {
  if (!plaintext || KEY.length !== 32) return plaintext;
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${enc.toString('base64')}`;
}

// ─── AES-256-GCM 복호화 ─────────────────────────────────
export function decrypt(ciphertext) {
  if (!ciphertext || !ciphertext.includes('.') || KEY.length !== 32)
    return ciphertext;
  try {
    const [ivB64, tagB64, encB64] = ciphertext.split('.');
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const enc = Buffer.from(encB64, 'base64');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString(
      'utf8',
    );
  } catch {
    return ciphertext; // fallback: unencrypted legacy data
  }
}

// ─── 단방향 해시 (비교용, 복호화 불가) ──────────────────
export function hash(text) {
  return crypto
    .createHash('sha256')
    .update(text)
    .digest('hex')
    .slice(0, 16);
}
