"use client";

import { Button, useToast } from "@flowforge/ui";
import { useEffect, useState } from "react";

// Email delivery is not connected yet, so the link is handed to the inviter.
export function InviteLink({ email, url }: { email: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div role="status" className="flex flex-col gap-2 rounded-lg bg-success-soft px-3 py-2.5">
      <p className="text-body text-success-strong">
        Invitation ready for {email}. Send them this link; it works for 7 days and
        is only shown now.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md select-all bg-surface px-2 py-1.5 font-mono text-helper">
          {url}
        </code>
        <Button
          variant="secondary"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
            } catch {
              // Clipboard access can be blocked by the browser or settings.
              toast({
                message: "Couldn’t copy the link. Select it and copy it yourself.",
                tone: "error",
              });
            }
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}
