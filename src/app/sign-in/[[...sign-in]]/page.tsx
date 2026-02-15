"use client";

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return (
      <div className="flex justify-center items-center h-screen w-screen">
        <div>Authentication is not configured.</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <SignIn />
    </div>
  );
}
