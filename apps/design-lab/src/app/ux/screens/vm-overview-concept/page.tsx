import { LabShell } from "@/components/LabShell";
import { VmOverviewConcept } from "./VmOverviewConcept";

export default function VmOverviewConceptPage() {
  return (
    <LabShell
      eyebrow="Discovery · Product concept"
      title="Обзор ресурсов ВМ"
      description="Гипотеза: разделить операционное состояние и квоты, сохранив их в одном контексте."
    >
      <VmOverviewConcept />
    </LabShell>
  );
}
