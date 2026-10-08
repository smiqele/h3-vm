import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const projectRoot = path.resolve(new URL("..", import.meta.url).pathname);

function readText(filePath) {
  return fs.readFileSync(path.join(projectRoot, filePath), "utf8");
}

function writeJson(filePath, value) {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  fs.writeFileSync(path.join(projectRoot, filePath), content);
}

function findFiles(directory, fileName) {
  const absoluteDirectory = path.join(projectRoot, directory);
  if (!fs.existsSync(absoluteDirectory)) return [];
  return fs.readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? findFiles(entryPath, fileName) : entry.name === fileName ? [entryPath] : [];
  });
}

function collectList(files, key, version = "0.3.0") {
  return { version, [key]: files.flatMap((file) => parse(readText(file))[key] ?? []) };
}

function collectMap(files, key, version = "0.3.0") {
  return { version, [key]: Object.assign({}, ...files.map((file) => parse(readText(file))[key] ?? {})) };
}

function generateUiCatalog() {
  writeJson("packages/ui/src/catalog.generated.json", {
    components: parse(readText("packages/ui/components.yaml")),
    rules: readText("packages/ui/rules.md"),
  });
}

function generateConsoleModel() {
  const domainRoot = "packages/docs/domains";
  const model = {
    navigation: parse(readText("packages/docs/domains/navigation.yaml")),
    contexts: parse(readText("packages/docs/domains/organization/contexts.yaml")),
    resources: collectList(findFiles(domainRoot, "resource.yaml"), "resources"),
    patterns: collectList(["packages/docs/ux/patterns.yaml", ...findFiles(domainRoot, "patterns.yaml")], "patterns"),
    journeys: collectList(findFiles(domainRoot, "journeys.yaml"), "journeys"),
    fixtures: collectMap(findFiles(domainRoot, "fixtures.yaml"), "fixtures"),
    screens: collectList(findFiles(domainRoot, "screens.yaml"), "screens"),
  };

  writeJson("packages/console-runtime/src/model.generated.json", model);
  const statuses = parse(readText("packages/docs/ui/resource-statuses.yaml"));
  const tones = new Set(["positive", "neutral", "progress", "warning", "danger", "unknown"]);
  for (const [resource, entries] of Object.entries(statuses)) {
    if (!entries.unknown) throw new Error(`Missing unknown status for ${resource}`);
    for (const [status, presentation] of Object.entries(entries)) {
      if (!presentation.label || !tones.has(presentation.tone) || typeof presentation.animated !== "boolean") {
        throw new Error(`Invalid status presentation: ${resource}.${status}`);
      }
    }
  }
  fs.writeFileSync(
    path.join(projectRoot, "packages/console-runtime/src/statuses.generated.ts"),
    `// Generated from statuses.yaml. Do not edit by hand.\nexport const resourceStatuses = ${JSON.stringify(statuses, null, 2)} as const;\n`,
  );
}

function generateDocumentation() {
  const primaryDocuments = [
    { slug: "readme", label: "О документации", file: "readme.md" },
    { slug: "product/overview", label: "Обзор", group: "Продукт", file: "product/overview.md" },
    { slug: "product/architecture", label: "Архитектура", group: "Продукт", file: "product/architecture.md" },
    { slug: "product/data-model", label: "Модель сущностей", group: "Продукт", file: "product/data-model.md" },
    { slug: "product/open-questions", label: "Открытые вопросы", group: "Продукт", file: "product/open-questions.md" },
    { slug: "domains/billing", label: "Биллинг", group: "Домены", file: "domains/billing/overview.md" },
    { slug: "domains/compute/virtual-machines", label: "Виртуальные машины", group: "Домены", file: "domains/compute/virtual-machines/overview.md" },
    { slug: "domains/databases/managed-databases", label: "Управляемые базы данных", group: "Домены", file: "domains/databases/managed-databases/overview.md" },
  ];

  const documentGroups = [
    { directory: "ui", label: "UI" },
    { directory: "ux", label: "UX" },
    {
      directory: "agents",
      label: "Для агентов",
      order: ["overview", "component-documentation", "create-component", "update-component", "audit-component", "tokens", "checks"],
      titles: {
        overview: "Обзор",
        "component-documentation": "Стандарт страницы компонента",
        "create-component": "Создание компонента",
        "update-component": "Обновление компонента",
        "audit-component": "Аудит компонента",
        tokens: "Работа с токенами",
        checks: "Проверки и готовность",
      },
    },
  ];

  const groupedDocuments = documentGroups.flatMap(({ directory, label, titles = {}, order = [] }) => {
    const directoryPath = path.join(projectRoot, "packages/docs", directory);

    return fs
      .readdirSync(directoryPath)
      .filter((file) => file.endsWith(".md"))
      .sort((a, b) => {
        const aName = a.slice(0, -3);
        const bName = b.slice(0, -3);
        const aIndex = order.indexOf(aName);
        const bIndex = order.indexOf(bName);
        if (aIndex >= 0 || bIndex >= 0) return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
        return a.localeCompare(b);
      })
      .map((file) => {
        const name = file.slice(0, -3);

        return {
          slug: `${directory}/${name}`,
          label: titles[name] ?? name.replaceAll("-", " "),
          group: label,
          file: `${directory}/${file}`,
        };
      });
  });

  const documents = [...primaryDocuments, ...groupedDocuments];
  const maturityValues = new Set(["draft", "in-review", "approved", "deprecated"]);
  const verificationValues = new Set(["unverified", "reviewed", "verified"]);
  const alignmentValues = new Set(["unknown", "partial", "aligned"]);
  const parsedDocuments = documents.map(({ slug, label, group, file }) => {
    const source = readText(`packages/docs/${file}`);
    const match = source.match(/^---\n([\s\S]*?)\n---\n/);
    if (!match) throw new Error(`Documentation metadata is missing: ${file}`);
    const metadata = parse(match[1]);
    if (!maturityValues.has(metadata.status)) throw new Error(`Invalid documentation status in ${file}`);
    if (!verificationValues.has(metadata.accuracy)) throw new Error(`Invalid documentation accuracy in ${file}`);
    if (!alignmentValues.has(metadata.alignment)) throw new Error(`Invalid documentation alignment in ${file}`);
    return { entry: { slug, label, group, metadata }, source: source.slice(match[0].length) };
  });
  const entries = parsedDocuments.map(({ entry }) => entry);
  const content = Object.fromEntries(parsedDocuments.map(({ entry, source }) => [entry.slug, source]));

  writeJson("apps/design-lab/src/lib/docs/catalog.generated.json", {
    entries,
    documents: content,
  });
}

function generateBacklog() {
  const tasks = parse(readText("packages/backlog/tasks.yaml"));
  const hypotheses = parse(readText("packages/backlog/hypotheses.yaml"));
  writeJson(
    "packages/backlog/src/backlog.generated.json",
    {
      ...tasks,
      hypothesisVersion: hypotheses.version,
      hypothesisStatuses: hypotheses.statuses,
      hypotheses: hypotheses.hypotheses,
    },
  );
}

generateUiCatalog();
generateConsoleModel();
generateDocumentation();
generateBacklog();

console.log("Generated UI catalog, console runtime, docs and backlog modules");
