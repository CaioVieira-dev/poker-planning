import type { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-slate-500">
      <div className="w-md bg-slate-300">{children}</div>
    </div>
  );
}
