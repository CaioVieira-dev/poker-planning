import type { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-slate-500 px-2">
      <div className="w-xl bg-slate-300">{children}</div>
    </div>
  );
}
