import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
let _auth = null;

function getAuth() {
  if (_auth) return _auth;

  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !privateKey) {
    throw new Error("Google 서비스 계정 환경변수가 설정되지 않았습니다.");
  }

  _auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: SCOPES,
  });

  return _auth;
}

// ─── Sheets 클라이언트 ────────────────────────────────────
export function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

export const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// ─── Sheet 이름 상수 ──────────────────────────────────────
export const SHEETS = {
  APPLICATIONS: "applications",
  SURVEYS: "surveys",
  SUMMARY: "impact_summary",
};

// ─── 유틸: 범위에 행 추가 ─────────────────────────────────
export async function appendRow(sheetName, values) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

// ─── 유틸: 범위 읽기 ──────────────────────────────────────
export async function readRange(sheetName, range = "A1:Z1000") {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!${range}`,
  });
  return res.data.values || [];
}

// ─── 유틸: 타임스탬프 (KST, ISO 형식) ───────────────────
export function nowKST() {
  const d = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
