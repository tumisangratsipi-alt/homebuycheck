"use client";

import { useState, useRef, useCallback } from "react";
import { lookupTerm, type GlossaryEntry } from "@/lib/glossary";

interface TermTooltipProps {
  term: string;
  children?: React.ReactNode;
  side?: "top" | "bottom";
}

export function TermTooltip({ term, children, side = "top" }: TermTooltipProps) {
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entry: GlossaryEntry | undefined = lookupTerm(term);

  const open = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(true);
  }, []);

  const close = useCallback(() => {
    timerRef.current = setTimeout(() => setShow(false), 120);
  }, []);

  if (!entry) return <>{children ?? term}</>;

  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        type="button"
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        aria-label={`Define: ${entry.term}`}
        style={{
          display: "inline",
          cursor: "help",
          background: "none",
          border: "none",
          borderBottom: "1px dashed rgba(212,175,55,0.4)",
          padding: 0,
          font: "inherit",
          color: "inherit",
          outline: "none",
        }}
      >
        {children ?? term}
      </button>

      {show && (
        <span
          onMouseEnter={open}
          onMouseLeave={close}
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            ...(side === "top"
              ? { bottom: "calc(100% + 8px)" }
              : { top: "calc(100% + 8px)" }),
            zIndex: 999,
            width: 240,
            pointerEvents: "auto",
          }}
        >
          <span
            style={{
              display: "block",
              background: "#0D1117",
              border: "1px solid rgba(212,175,55,0.18)",
              borderRadius: 12,
              padding: "12px 14px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 10,
                fontFamily: "monospace",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "rgba(212,175,55,0.9)",
                marginBottom: 6,
              }}
            >
              {entry.term}
            </span>
            <span
              style={{
                display: "block",
                fontSize: 12,
                color: "rgba(148,163,184,1)",
                lineHeight: 1.5,
                fontWeight: 300,
              }}
            >
              {entry.definition}
            </span>
          </span>
          <span
            style={{
              position: "absolute",
              left: "50%",
              transform: `translateX(-50%) rotate(45deg)`,
              ...(side === "top"
                ? { bottom: -5, borderRight: "1px solid rgba(212,175,55,0.18)", borderBottom: "1px solid rgba(212,175,55,0.18)" }
                : { top: -5, borderLeft: "1px solid rgba(212,175,55,0.18)", borderTop: "1px solid rgba(212,175,55,0.18)" }),
              width: 10,
              height: 10,
              background: "#0D1117",
            }}
          />
        </span>
      )}
    </span>
  );
}
