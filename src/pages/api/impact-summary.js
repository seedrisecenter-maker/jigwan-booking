// pages/api/impact-summary.js
// GET /api/impact-summary
//
// 분석 지표 전체를 단일 엔드포인트로 반환
// Sheet2 원시 데이터 → 서버 사이드 집계 → 대시보드에 전달
//
// 향후 확장: 캐시 레이어(Redis) 붙여 Sheets 호출 횟수 절감

import { readRange, SHEETS } from '@/lib/sheets';

// ─── 지역 거주민 비율 (운영자 수동 설정 또는 체크박스 폼 추가) ──
const LOCAL_RESIDENT_RATIO = 0.74;

// ─── 경제적 파급효과 승수 (한국문화관광연구원 기준 인문활동 1.83) ──
const ECON_MULTIPLIER = 1.83;

// ─── Sheet2 컬럼 인덱스 ───────────────────────────────────
const COL = {
  ID: 0, // A
  TIMESTAMP: 1, // B
  APP_ID: 2, // C
  LECTURE_ID: 3, // D
  LECTURE_TITLE: 4, // E
  BASELINE_STATE: 5, // F
  AFTER_STATE: 6, // G
  EMOTION_CHANGE: 7, // H
  SETTLEMENT_SCORE: 8, // I
  WTP_AMOUNT: 9, // J
  COMMENT: 10, // K
  STATE_DELTA: 11, // L
};

// ─── 감정 키워드 추출 (간이 형태소 기반) ─────────────────
const KEYWORD_DICT = [
  '위로',
  '고요함',
  '성찰',
  '연결',
  '치유',
  '쉬어감',
  '감사',
  '뿌리',
  '호흡',
  '깨달음',
  '공동체',
  '지역',
  '평온',
  '따뜻함',
  '생각',
  '변화',
  '행복',
  '안정',
  '여유',
  '집중',
  '명상',
  '멈춤',
];

function extractKeywords(texts) {
  const counts = {};
  KEYWORD_DICT.forEach((kw) => {
    counts[kw] = 0;
  });
  texts.forEach((text) => {
    KEYWORD_DICT.forEach((kw) => {
      if (text.includes(kw)) counts[kw]++;
    });
  });
  return Object.entries(counts)
    .filter(([, c]) => c > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([word, count]) => ({ word, count }));
}

// ─── 핸들러 ───────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Sheet1: 신청 데이터
    const appRows = (await readRange(SHEETS.APPLICATIONS, 'A:K')).slice(1); // 헤더 제외
    // Sheet2: 설문 데이터
    const surveyRows = (await readRange(SHEETS.SURVEYS, 'A:L')).slice(1);

    if (surveyRows.length === 0) {
      return res.status(200).json({
        totalParticipants: appRows.length,
        surveyCount: 0,
        avgWtp: 0,
        socialValueTotal: 0,
        econEffect: 0,
        settlementAvg: 0,
        localRatio: LOCAL_RESIDENT_RATIO,
        emotions: [],
        stateDeltaAvg: null,
        monthlyTrend: [],
        lectureBreakdown: [],
        wtpDistribution: [],
      });
    }

    // ── 기본 집계 ─────────────────────────────────────────
    const wtpValues = surveyRows.map(
      (r) => Number(r[COL.WTP_AMOUNT]) || 0,
    );
    const settlementScores = surveyRows
      .map((r) => Number(r[COL.SETTLEMENT_SCORE]) || 0)
      .filter((v) => v > 0);
    const deltas = surveyRows
      .map((r) => r[COL.STATE_DELTA])
      .filter((v) => v !== '' && v !== undefined)
      .map(Number)
      .filter((v) => !isNaN(v));
    const emotionTexts = surveyRows.map(
      (r) => r[COL.EMOTION_CHANGE] ?? '',
    );

    const avgWtp = Math.round(
      wtpValues.reduce((a, b) => a + b, 0) / wtpValues.length,
    );
    const settlementAvg =
      settlementScores.length > 0
        ? +(
            settlementScores.reduce((a, b) => a + b, 0) /
            settlementScores.length
          ).toFixed(2)
        : 0;
    const stateDeltaAvg =
      deltas.length > 0
        ? +(deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(2)
        : null;

    // ── 사회적 가치 총액 ──────────────────────────────────
    // 공식: 참여자 수 × 평균 WTP × 지역 거주민 비율
    const totalParticipants = appRows.length;
    const socialValueTotal = Math.round(
      totalParticipants * avgWtp * LOCAL_RESIDENT_RATIO,
    );
    const econEffect = Math.round(socialValueTotal * ECON_MULTIPLIER);

    // ── 감정 키워드 ───────────────────────────────────────
    const emotions = extractKeywords(emotionTexts);

    // ── 월별 트렌드 ───────────────────────────────────────
    const monthlyMap = {};
    surveyRows.forEach((r) => {
      const ts = r[COL.TIMESTAMP];
      if (!ts) return;
      const month = ts.slice(0, 7); // "2026-04" (ISO format)
      if (!monthlyMap[month])
        monthlyMap[month] = { count: 0, wtpSum: 0 };
      monthlyMap[month].count++;
      monthlyMap[month].wtpSum += Number(r[COL.WTP_AMOUNT]) || 0;
    });
    const monthlyTrend = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month,
        participants: v.count,
        wtp: Math.round(v.wtpSum / v.count),
      }));

    // ── 강연별 분석 ───────────────────────────────────────
    const lectureMap = {};
    surveyRows.forEach((r) => {
      const title = r[COL.LECTURE_TITLE] || '미확인';
      if (!lectureMap[title])
        lectureMap[title] = {
          count: 0,
          wtpSum: 0,
          settlementSum: 0,
          deltaSum: 0,
          deltaCount: 0,
        };
      lectureMap[title].count++;
      lectureMap[title].wtpSum += Number(r[COL.WTP_AMOUNT]) || 0;
      lectureMap[title].settlementSum +=
        Number(r[COL.SETTLEMENT_SCORE]) || 0;
      const d = Number(r[COL.STATE_DELTA]);
      if (!isNaN(d)) {
        lectureMap[title].deltaSum += d;
        lectureMap[title].deltaCount++;
      }
    });
    const lectureBreakdown = Object.entries(lectureMap)
      .map(([title, v]) => ({
        title,
        surveyCount: v.count,
        avgWtp: Math.round(v.wtpSum / v.count),
        avgSettlement: +(v.settlementSum / v.count).toFixed(2),
        avgStateDelta:
          v.deltaCount > 0
            ? +(v.deltaSum / v.deltaCount).toFixed(2)
            : null,
      }))
      .sort((a, b) => b.surveyCount - a.surveyCount);

    // ── WTP 분포 ──────────────────────────────────────────
    const wtpDistribution = [0, 3000, 5000, 10000, 15000, 20000, 30000].map(
      (amount) => ({
        amount,
        count: wtpValues.filter((v) => v === amount).length,
      }),
    );

    return res.status(200).json({
      totalParticipants,
      surveyCount: surveyRows.length,
      avgWtp,
      localRatio: LOCAL_RESIDENT_RATIO,
      socialValueTotal,
      econMultiplier: ECON_MULTIPLIER,
      econEffect,
      settlementAvg,
      stateDeltaAvg, // 핵심: 심리 상태 변화량 평균 (양수 = 긍정 변화)
      emotions,
      monthlyTrend,
      lectureBreakdown,
      wtpDistribution,
    });
  } catch (err) {
    console.error('[impact-summary] 오류:', err);
    return res.status(500).json({ error: '서버 오류' });
  }
}
