import type { ReactNode } from "react";

export function Card({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="flex h-16 w-12 justify-center bg-slate-100 p-4 align-middle"
      onClick={onClick}
    >
      {children}
    </div>
  );
}
