// POST /api/decrypt
// 운영자 전용: 암호화된 개인정보 복호화 (SMS 발송 등)
// 요청: { application_id, admin_key }

import { readRange, SHEETS } from '@/lib/sheets';
import { decrypt } from '@/lib/crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 관리자 키 검증
  const { application_id, admin_key } = req.body;
  if (admin_key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: '권한 없음' });
  }

  if (!application_id) {
    return res.status(400).json({ error: 'application_id 필수' });
  }

  try {
    const rows = (await readRange(SHEETS.APPLICATIONS, 'A:E')).slice(1);
    const match = rows.find((row) => row[0] === application_id);

    if (!match) {
      return res.status(404).json({ error: '신청 내역 없음' });
    }

    return res.status(200).json({
      application_id,
      name: decrypt(match[2]),  // C열 복호화
      phone: decrypt(match[4]), // E열 복호화
    });
  } catch (err) {
    console.error('[decrypt] 오류:', err);
    return res.status(500).json({ error: '서버 오류' });
  }
}
