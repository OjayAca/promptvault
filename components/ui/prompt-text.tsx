export function PromptText({text}: {text: string}) {
  const parts = text.split(/(\[[^\]]+\])/g);

  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("[") && part.endsWith("]") ? (
          <span
            className="mx-0.5 border-b border-gold/30 bg-gold/5 px-1 font-extrabold uppercase text-gold"
            key={`${part}-${index}`}
          >
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}
