import { createSign } from "node:crypto";

export type Ga4DashboardStats = {
  configured: true;
  todaySessions: number;
  todayActiveUsers: number;
  usSessionsToday: number;
  topSources: { source: string; sessions: number }[];
};

type Ga4DashboardResult =
  | { configured: false }
  | (Ga4DashboardStats & { configured: true })
  | { configured: true; error: string };

type RunReportResponse = {
  rows?: {
    dimensionValues?: { value?: string }[];
    metricValues?: { value?: string }[];
  }[];
  totals?: { metricValues?: { value?: string }[] }[];
};

const CACHE_MS = 5 * 60 * 1000;

let cachedStats: { at: number; data: Ga4DashboardResult } | null = null;

function base64url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getGa4ServerConfig() {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const clientEmail = process.env.GA4_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (!propertyId || !clientEmail || !privateKey) {
    return null;
  }

  return { propertyId, clientEmail, privateKey };
}

export function isGa4ServerConfigured() {
  return getGa4ServerConfig() !== null;
}

async function getGoogleAccessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );

  const signInput = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signInput);
  signer.end();
  const signature = base64url(signer.sign(privateKey));
  const assertion = `${signInput}.${signature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ?? data.error ?? "Failed to authenticate GA4 service account.",
    );
  }

  return data.access_token;
}

async function runGa4Report(
  accessToken: string,
  propertyId: string,
  body: Record<string, unknown>,
) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = (await response.json()) as RunReportResponse & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message ?? "GA4 report request failed.");
  }

  return data;
}

function readMetricTotal(report: RunReportResponse, index = 0) {
  const value = report.totals?.[0]?.metricValues?.[index]?.value;
  return value ? Number(value) : 0;
}

function readMetricRow(report: RunReportResponse, index = 0) {
  const value = report.rows?.[0]?.metricValues?.[index]?.value;
  return value ? Number(value) : 0;
}

async function fetchGa4DashboardStats(): Promise<Ga4DashboardResult> {
  const config = getGa4ServerConfig();
  if (!config) {
    return { configured: false };
  }

  try {
    const accessToken = await getGoogleAccessToken(
      config.clientEmail,
      config.privateKey,
    );

    const dateRange = [{ startDate: "today", endDate: "today" }];

    const [overview, usSessions, sources] = await Promise.all([
      runGa4Report(accessToken, config.propertyId, {
        dateRanges: dateRange,
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      }),
      runGa4Report(accessToken, config.propertyId, {
        dateRanges: dateRange,
        dimensions: [{ name: "country" }],
        dimensionFilter: {
          filter: {
            fieldName: "country",
            stringFilter: { matchType: "EXACT", value: "United States" },
          },
        },
        metrics: [{ name: "sessions" }],
      }),
      runGa4Report(accessToken, config.propertyId, {
        dateRanges: dateRange,
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 5,
      }),
    ]);

    return {
      configured: true,
      todaySessions: readMetricTotal(overview, 0),
      todayActiveUsers: readMetricTotal(overview, 1),
      usSessionsToday: readMetricRow(usSessions, 0),
      topSources:
        sources.rows?.map((row) => ({
          source: row.dimensionValues?.[0]?.value ?? "(not set)",
          sessions: Number(row.metricValues?.[0]?.value ?? 0),
        })) ?? [],
    };
  } catch (error) {
    return {
      configured: true,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load GA4 dashboard stats.",
    };
  }
}

export async function getGa4DashboardStats(): Promise<Ga4DashboardResult> {
  const now = Date.now();
  if (cachedStats && now - cachedStats.at < CACHE_MS) {
    return cachedStats.data;
  }

  const data = await fetchGa4DashboardStats();
  cachedStats = { at: now, data };
  return data;
}
