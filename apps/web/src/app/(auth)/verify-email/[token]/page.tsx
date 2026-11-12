import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmail } from "@/components/verify-email";

export const metadata: Metadata = { title: "Confirm your email" };

export default function Page({ params }: PageProps<"/verify-email/[token]">) {
  return (
    <Suspense>
      <Verify params={params} />
    </Suspense>
  );
}

async function Verify({ params }: Pick<PageProps<"/verify-email/[token]">, "params">) {
  const { token } = await params;
  return <VerifyEmail token={token} />;
}
