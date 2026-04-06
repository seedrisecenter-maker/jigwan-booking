// pages/api/surveys.js
// POST /api/surveys
//
// Sheet2 컬럼 구조:
// A: id | B: timestamp_kst | C: application_id | D: lecture_id | E: lecture_title
// F: baseline_state (Sheet1에서 조인) | G: after_state | H: emotion_change
// I: settlement_score (1-5) | J: wtp_amount | K: additional_comment
// L: state_delta (after_state 수치 - baseline 수치, 자동 계산)

import { appendRow, readRange, nowKST, SHEETS } from '@/lib/sheets';
import { nanoid } from 'nanoid';

// ─── WTP 허용값 ───────────────────────────────────────────
const VALID_WTP = new Set([0, 3000, 5000, 10000, 15000, 20000, 30000]);

// ─── 심리 상태 → 수치 매핑 (Baseline·After 비교용) ──────
const STATE_SCORE = {
  // baseline_state
  '📉 지치고 무기력함': 1,
  '🌀 혼란스럽고 복잡함': 2,
  '🤔 막연하고 방향 없음': 2,
  '😶 무감각·무관심 상태': 1,
  '🌿 평온하지만 성장 원함': 4,
  '✨ 좋은 상태, 더 깊이 원함': 5,
  // after_state
  '😐 별 변화 없음': 3,
  '🤔 생각이 많아짐': 3,
  '💙 위로를 받았음': 4,
  '💡 새로운 관점 생김': 4,
  '🌿 약간 편안해짐': 4,
  '🌟 많이 가벼워졌음': 5,
};

function getStateDelta(baseline, after) {
  const b = STATE_SCORE[baseline] ?? null;
  const a = STATE_SCORE[after] ?? null;
  if (b === null || a === null) return '';
  return a - b; // 양수 = 긍정 변화, 음수 = 부정 변화
}

// ─── application_id로 baseline_state 조인 ────────────────
async function fetchBaseline(applicationId) {
  if (!applicationId) return '';
  const rows = (await readRange(SHEETS.APPLICATIONS, 'A:I')).slice(1);
  const match = rows.find((row) => row[0] === applicationId);
  return match?.[8] ?? ''; // I열: baseline_state
}

// ─── 유효성 검사 ──────────────────────────────────────────
function validate(body) {
  const errors = [];
  if (!body.lecture_id?.trim()) errors.push('lecture_id 필수');
  if ((body.emotion_change?.trim()?.length ?? 0) < 10)
    errors.push('emotion_change 10자 이상');
  if (!body.after_state?.trim()) errors.push('after_state 필수');
  const score = Number(body.settlement_score);
  if (!Number.isInteger(score) || score < 1 || score > 5)
    errors.push('settlement_score 1-5 정수');
  if (!VALID_WTP.has(Number(body.wtp_amount)))
    errors.push('wtp_amount 허용값 아님');
  return errors;
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

    const baselineState = await fetchBaseline(body.application_id);
    const delta = getStateDelta(baselineState, body.after_state);

    const id = nanoid(10);
    const row = [
      id,
      nowKST(),
      body.application_id ?? '',
      body.lecture_id,
      body.lecture_title ?? '',
      baselineState, // F: Baseline (조인)
      body.after_state,
      body.emotion_change.trim(),
      Number(body.settlement_score),
      Number(body.wtp_amount),
      body.additional_comment?.trim() ?? '',
      delta, // L: State Delta (수치)
    ];

    await appendRow(SHEETS.SURVEYS, row);

    // 임팩트 요약 캐시 무효화 트리거 (추후: Redis or ISR revalidate)
    // await revalidateSummary();

    return res.status(201).json({
      success: true,
      survey_id: id,
      state_delta: delta,
      social_value_estimate: Number(body.wtp_amount), // 개인 기준 추정치
      message: '설문이 기록되었습니다.',
    });
  } catch (err) {
    console.error('[surveys] 오류:', err);
    return res.status(500).json({ error: '서버 오류' });
  }
}
