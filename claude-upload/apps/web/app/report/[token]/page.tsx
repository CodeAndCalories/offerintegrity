export const runtime = "edge";
import { notFound } from "next/navigation";
import ReportClient from "./ReportClient";

async function getReport(token: string) {
  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";
  try {
    const res = await fetch(`${workerUrl}/api/report/${token}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await getReport(token);
  if (!report) notFound();

  return <ReportClient report={report} token={token} />;
}
