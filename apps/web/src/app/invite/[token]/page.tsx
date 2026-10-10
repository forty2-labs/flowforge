import { ROLE_LABELS, type InvitationPreviewDto } from "@flowforge/types";
import { Alert, LogoMark } from "@flowforge/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AcceptInvitation } from "@/components/accept-invitation";
import { api, ApiRequestError } from "@/lib/api";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Invitation" };

export default function InvitePage({ params }: PageProps<"/invite/[token]">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-[440px] flex-col gap-6 rounded-xl border border-line bg-surface p-7">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-base font-semibold">Flowforge</span>
        </div>
        <Suspense fallback={<p className="text-sm text-fg-muted">Loading invitation…</p>}>
          <Invitation params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function Invitation({ params }: Pick<PageProps<"/invite/[token]">, "params">) {
  const { token } = await params;
  let invitation: InvitationPreviewDto;
  try {
    invitation = await api<InvitationPreviewDto>(
      `/invitations/${encodeURIComponent(token)}`,
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return (
        <Message title="This invitation is no longer valid">
          It may have been used, replaced or revoked. Ask the person who invited
          you to send a new one.
        </Message>
      );
    }
    throw error;
  }

  if (invitation.expired) {
    return (
      <Message title="This invitation has expired">
        Invitations work for 7 days. Ask for a new one to join{" "}
        {invitation.workspaceName}.
      </Message>
    );
  }

  const session = await getSession();
  const next = encodeURIComponent(`/invite/${token}`);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.015em]">
          Join {invitation.workspaceName}
        </h1>
        <p className="text-sm text-fg-secondary">
          You’ve been invited as {article(ROLE_LABELS[invitation.role])}{" "}
          <b className="font-semibold text-fg">{ROLE_LABELS[invitation.role]}</b>. The
          invitation was sent to {invitation.email}.
        </p>
      </div>
      {!session ? (
        <div className="flex flex-col gap-3">
          <Link
            href={`/signup?next=${next}`}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-[15px] font-medium text-white hover:bg-primary-hover hover:text-white"
          >
            Create an account to accept
          </Link>
          <p className="text-[13.5px] text-fg-secondary">
            Already have one?{" "}
            <Link href={`/signin?next=${next}`} className="font-medium">
              Sign in
            </Link>
          </p>
        </div>
      ) : session.user.email !== invitation.email ? (
        <Alert tone="warning">
          You’re signed in as {session.user.email}. Sign in as {invitation.email}{" "}
          to accept this invitation.
        </Alert>
      ) : (
        <AcceptInvitation token={token} />
      )}
    </>
  );
}

function Message({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-[22px] leading-8 font-semibold tracking-[-0.01em]">{title}</h1>
      <p className="text-sm text-fg-secondary">{children}</p>
    </div>
  );
}

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}
