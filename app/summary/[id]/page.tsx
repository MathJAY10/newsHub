import SummaryPageClient from "./SummaryPageClient";

// ✅ define PageProps inline (no conflict with generated types)
export default async function SummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ wait for the params (since Next 15 types treat it as a Promise)
  const { id } = await params;
  return <SummaryPageClient id={id} />;
}
