"use client";

import {useEffect, useRef, useState} from "react";
import type {ReactNode} from "react";

export function Reveal({children, className = ""}: {children: ReactNode; className?: string}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {threshold: 0.12},
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`transition duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"} ${className}`}
      ref={ref}
    >
      {children}
    </div>
  );
}
