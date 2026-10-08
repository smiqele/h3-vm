import { ScreenRenderer, type ScreenFixture } from "@/components/ScreenRenderer";
import { ConsoleSidebar } from "@/components/ConsoleSidebar";
import { ScreenSpecPanel } from "@/components/ScreenSpecPanel";
import { findById, getConsoleModel } from "@/lib/catalog";
import { AppHeader, AppShell, Button, ContextPath } from "@cloud/ui";

type RuntimeContext = {
  workspace: { id: string; name: string };
  project: { id: string; name: string; workspaceId: string };
};

export function VmListScreen({ metricsVariant = "borderless" }: {
  metricsVariant?: "default" | "borderless";
}) {
  const model = getConsoleModel();
  const screen = findById(model.screens.screens, "screen.compute.vm.list") as unknown as Parameters<typeof ScreenRenderer>[0]["screen"];
  const fixtureId = screen.states?.populated || "fixture.vm.default";
  const fixture = model.fixtures.fixtures[fixtureId] as ScreenFixture;
  const context = model.fixtures.fixtures["fixture.context.default"] as RuntimeContext;

  const contextPath = [
    { label: context.workspace.name },
    { label: context.project.name },
    { label: screen.title },
  ];
  const appHeader = (
    <AppHeader scrolledActions={<Button variant="solid">Создать</Button>}>
      <ContextPath items={contextPath} />
    </AppHeader>
  );

  return (
    <AppShell
      className="console-app-shell"
      sidebar={<ConsoleSidebar />}
      header={appHeader}
      aside={<ScreenSpecPanel screen={screen} />}
    >
      <ScreenRenderer screen={screen} fixture={fixture} metricsVariant={metricsVariant} />
    </AppShell>
  );
}
