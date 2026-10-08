import { notFound } from "next/navigation";
import { getDocument, listDocuments } from "@/lib/docs";
import { AppSidebar } from "@/components/AppSidebar";
import { MarkdownDocument } from "@/components/MarkdownDocument";
export function generateStaticParams(){return listDocuments().map(item=>({path:item.slug.split("/")}));}
export default async function DocsPage({params}:{params:Promise<{path:string[]}>}){const{path:segments}=await params;const slug=segments.join("/");const documents=listDocuments();const entry=documents.find(item=>item.slug===slug);const source=getDocument(slug);if(!source||!entry)notFound();return <><AppSidebar variant="docs" documents={documents}/><main className="docs-page"><MarkdownDocument source={source} metadata={entry.metadata}/></main></>;}
