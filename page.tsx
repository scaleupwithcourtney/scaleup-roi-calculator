"use client";

import { Calculator } from "../page";

export default function Embed() {
  return (
    <main className="px-4 py-6 md:px-6" style={{ background: "transparent" }}>
      <div className="mx-auto max-w-6xl">
        <Calculator compact />
      </div>
    </main>
  );
}
