"use client"

import SignInClient from "../SignInClient";

export default function Page() {
  return (
    <div className="flex justify-center items-start min-h-screen pt-24 py-12 px-4">
      <div className="w-full max-w-md mt-6">
        <SignInClient />
      </div>
    </div>
  );
}
