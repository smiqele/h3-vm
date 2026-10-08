import { LabShell } from "@/components/LabShell";
import { Tags } from "@/components/SpecCard";
import { getCatalog } from "@/lib/catalog";

export default function CjmPage() {
  const journey = getCatalog().ux.journeys.journeys[0] as Record<string, unknown>;
  const stages = journey.stages as Array<Record<string, unknown>>;
  return <LabShell title="CJM" description={`${journey.name}: ${journey.goal}`}><div className="journey-grid">{stages.map((stage, index) => <article className="journey-stage" key={String(stage.id)}><span className="number">0{index + 1}</span><p className="section-label">{String(stage.id)}</p><h2>{String(stage.name)}</h2><p>{String(stage.userGoal)}</p><p className="section-label">Touchpoint</p><Tags items={[stage.touchpoint]}/><p className="section-label">Вопросы</p><ul>{(stage.questions as string[]).map((question) => <li key={question}>{question}</li>)}</ul><Tags items={stage.signals as unknown[]}/></article>)}</div></LabShell>;
}
