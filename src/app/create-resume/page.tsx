import SiteChrome from "@/components/SiteChrome";
import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { getResumeDraftById } from "../actions";
import CreateResumeForm from "./CreateResumeForm";

type CreateResumePageProps = {
  searchParams: Promise<{ draftId?: string | string[] }>;
};

export default async function CreateResumePage({ searchParams }: CreateResumePageProps) {
  await requireUserOrRedirect();
  const params = await searchParams;
  const draftId = Array.isArray(params.draftId) ? params.draftId[0] : params.draftId;
  const draft = draftId ? await getResumeDraftById(draftId) : null;

  return (
    <SiteChrome
      title="Create Resume"
      eyebrow="Draft studio"
      description="Start with a template, save a draft, and sync it to your dashboard when you sign in."
      primaryHref="/dashboard"
      primaryLabel="Dashboard"
      secondaryHref="/analyzer"
      secondaryLabel="Analyzer"
    >
      <main>
        <CreateResumeForm
          initialDraft={
            draft
              ? {
                  id: draft.id,
                  title: draft.title,
                  summary: draft.summary ?? "",
                  skills: draft.skills ?? "",
                  content: draft.content,
                  templateName: draft.template_name ?? "Modern",
                }
              : null
          }
        />
      </main>
    </SiteChrome>
  );
}
