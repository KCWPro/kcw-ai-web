import { notFound } from "next/navigation";
import DirectorWorkspaceView from "@/components/director/DirectorWorkspaceView";
import { getDirectorCaseById } from "@/lib/director/store";

export default async function DirectorCaseWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = getDirectorCaseById(id);
  if (!bundle) {
    notFound();
  }
  return <DirectorWorkspaceView bundle={bundle} />;
}
