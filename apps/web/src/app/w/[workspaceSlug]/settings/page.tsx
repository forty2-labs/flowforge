import { can } from "@flowforge/types";
import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/page-header";
import { RenameWorkspaceForm } from "@/components/rename-workspace-form";
import { ThemeChoiceField } from "@/components/theme-choice";
import { requireWorkspace } from "@/lib/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  params,
}: PageProps<"/w/[workspaceSlug]/settings">) {
  const { workspaceSlug } = await params;
  const { workspace } = await requireWorkspace(workspaceSlug);

  return (
    <>
      <PageHeader title="Settings" />
      <Section title="Workspace details">
        <RenameWorkspaceForm
          slug={workspace.slug}
          name={workspace.name}
          canEdit={can(workspace.role, "workspace.manage")}
        />
      </Section>
      <Section title="Appearance">
        <ThemeChoiceField />
      </Section>
    </>
  );
}
