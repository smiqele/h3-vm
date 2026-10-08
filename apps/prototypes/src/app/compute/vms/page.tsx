import { VmListScreen } from "@/components/VmListScreen";

export default async function VmListPage({ searchParams }: {
  searchParams: Promise<{ metrics?: string | string[] }>;
}) {
  const metricsVariant = (await searchParams).metrics === "default" ? "default" : "borderless";
  return <VmListScreen metricsVariant={metricsVariant} />;
}
