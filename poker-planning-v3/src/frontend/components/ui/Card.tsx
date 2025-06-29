import { useState, useEffect, useRef, type ReactNode } from "react";

type CardProps = {
  value: ReactNode;
  open: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

export function Card({ value, open, onClick, disabled }: CardProps) {
  // Estado visual da carta: virada pra cima (frente) ou pra baixo (verso)
  const [flipped, setFlipped] = useState(open);
  // Valor atualmente exibido na carta (para flip animado só quando troca o valor)
  const [displayedValue, setDisplayedValue] = useState(value);

  const prevOpen = useRef(open);
  const prevValue = useRef(value);

  // Mantém o estado visual de frente/verso sincronizado com prop open
  useEffect(() => {
    if (open !== prevOpen.current) {
      setFlipped(open);
      prevOpen.current = open;

      // Caso "revele" a carta, garante que o valor é o último recebido
      if (open && value !== displayedValue) {
        setDisplayedValue(value);
        prevValue.current = value;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Flip animado ao trocar valor, só quando a carta está mostrando a frente
  useEffect(() => {
    if (open && value !== prevValue.current) {
      // (1) Vira pra baixo
      setFlipped(false);

      const timeout = setTimeout(() => {
        // (2) Após a animação, troca o valor
        setDisplayedValue(value);
        prevValue.current = value;

        // (3) E vira pra cima denovo, mostrando novo valor
        setFlipped(true);
      }, 250); // Duração deve bater com sua animação de flip (ms)

      return () => clearTimeout(timeout);
    } else if (!open && value !== prevValue.current) {
      setDisplayedValue(value);
      prevValue.current = value;
    }
  }, [value, open]);

  return (
    <div
      className={`flex h-16 w-12 p-0 transition-transform duration-200 ease-in-out select-none [perspective:600px] ${!disabled ? "cursor-pointer hover:-translate-y-1 hover:scale-105 hover:shadow-xl" : "cursor-default opacity-70"} `}
      onClick={disabled ? undefined : onClick}
    >
      <div
        className={`relative h-full w-full transition-transform duration-300 ${flipped ? "[transform:rotateY(180deg)]" : ""} [transform-style:preserve-3d]`}
      >
        {/* Verso */}
        <div className="absolute flex h-full w-full items-center justify-center rounded-lg border border-slate-400 bg-slate-200 shadow [backface-visibility:hidden]">
          <span className="text-2xl text-slate-400">?</span>
        </div>
        {/* Frente */}
        <div className="absolute flex h-full w-full [transform:rotateY(180deg)] items-center justify-center rounded-lg border border-blue-400 bg-slate-100 shadow-lg [backface-visibility:hidden]">
          <span className="text-2xl font-bold text-blue-800">
            {displayedValue}
          </span>
        </div>
      </div>
    </div>
  );
}
