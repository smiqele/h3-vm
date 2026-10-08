import content from "./catalog.generated.json";

export type DocumentMetadata = {
  status: "draft" | "in-review" | "approved" | "deprecated";
  accuracy: "unverified" | "reviewed" | "verified";
  alignment: "unknown" | "partial" | "aligned";
  reviewedAt?: string | null;
};

export type DocumentEntry = {
  slug: string;
  label: string;
  group?: string;
  metadata: DocumentMetadata;
};

export function listDocuments(): DocumentEntry[] {
  return content.entries as DocumentEntry[];
}

export function getDocument(slug: string): string | undefined {
  return (content.documents as Record<string, string>)[slug];
}
