import { getBacklog } from "@cloud/backlog";
import { BacklogBoard } from "./BacklogBoard";

export default function BacklogPage() {
  return <BacklogBoard backlog={getBacklog()} />;
}
