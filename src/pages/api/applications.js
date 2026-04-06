import { appendRow, readRange, nowKST, SHEETS } from '@/lib/sheets';
import { encrypt } from '@/lib/crypto';
import { nanoid } from 'nanoid';

// ─── 유효성 검사 ──────────────────────────────────────────
function validate(body) {
  const errors = [];
  if (!body.name?.trim()) errors.push('name 필수');
  if (!/^01[0-9]\d{7,8}$/.test(body.phone?.replace(/-/g, '')))
    errors.push('phone 형식 오류');
  if (!body.lecture_id?.trim()) errors.push('lecture_id 필수');
  if (!body.lecture_title?.trim()) errors.push('lecture_title 필수');
  if ((body.motivation?.trim()?.length ?? 0) < 20)
    errors.push('motivation 20자 이상');
  if (!body.baseline_state?.trim()) errors.push('baseline_state 필수');
  return errors;
}

// ─── 전화번호 마스킹 (개인정보 보호) ─────────────────────
function maskPhone(raw) {
  const digits = raw.replace(/-/g, '');
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

// ─── SMS용 실 번호 정규화 ─────────────────────────────────
function normalizePhone(raw) {
  return raw
    .replace(/-/g, '')
    .replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
}

// ─── 중복 신청 체크 (마스킹 번호 뒷4자리 + 강연ID) ───────
async function isDuplicate(phone, lectureId) {
  // D열: phone_masked, F열: lecture_id (E열은 암호화된 번호 — 비교 불필요)
  const rows = (await readRange(SHEETS.APPLICATIONS, 'D:F')).slice(1);
  const newLast4 = phone.replace(/-/g, '').slice(-4);
  return rows.some((row) => {
    return (
      row[2] === lectureId &&
      row[0]?.slice(-4) === newLast4
    );
  });
}

// ─── 핸들러 ───────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body;
    const errors = validate(body);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ error: '유효성 검사 실패', details: errors });
    }

    // 중복 체크 (같은 강연 + 동일 번호 뒷 4자리)
    const dup = await isDuplicate(body.phone, body.lecture_id);
    if (dup) {
      return res
        .status(409)
        .json({ error: '이미 동일 강연에 신청된 번호입니다.' });
    }

    const id = nanoid(10);
    const timestamp = nowKST();
    const row = [
      id,
      timestamp,
      encrypt(body.name.trim()),           // C: 이름 (암호화)
      maskPhone(body.phone),               // D: 마스킹 번호 (표시용)
      encrypt(normalizePhone(body.phone)), // E: 실 번호 (암호화)
      body.lecture_id,
      body.lecture_title,
      body.motivation.trim(),
      body.baseline_state.trim(),
      body.lecture_date ?? '',
      body.location ?? '',
    ];

    await appendRow(SHEETS.APPLICATIONS, row);

    return res.status(201).json({
      success: true,
      application_id: id,
      message: '신청이 완료되었습니다. 강연 당일 안내 SMS가 발송됩니다.',
    });
  } catch (err) {
    console.error('[applications] 오류:', err);
    return res.status(500).json({ error: '서버 오류' });
  }
}
