"use server";

import { redirect } from "next/navigation";
import { buildDirectorCaseWorkspaceHref } from "@/lib/director/navigation";
import { createDirectorCase } from "@/lib/director/directorStore";

export async function createDirectorCaseAction(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  const created = createDirectorCase({ title });
  redirect(buildDirectorCaseWorkspaceHref(created.id));
}
