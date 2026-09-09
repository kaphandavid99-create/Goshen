"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Minimal, safe Markdown-ish renderer for assistant replies. Supports paragraphs,
 * `- ` bullet lists, `**bold**`, `` `code` `` and `[text](href)` links. No raw HTML,
 * no dangerouslySetInnerHTML. Internal links (starting with "/") navigate in-app.
 */
export function MessageContent({
  text,
  onNavigate,
}: {
  text: string;
  onNavigate?: () => void;
}) {
  const blocks = text.trim().split(/\n{2,}/);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((line) => /^\s*[-*]\s+/.test(line));

        if (isList) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-4">
              {lines.map((line, j) => (
                <li key={j}>{renderInline(line.replace(/^\s*[-*]\s+/, ""), onNavigate)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i}>
            {lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 ? <br /> : null}
                {renderInline(line, onNavigate)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

const TOKEN =
  /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s)]+)/g;

function renderInline(text: string, onNavigate?: () => void): ReactNode[] {
  const parts = text.split(TOKEN).filter((part) => part !== "");

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-muted px-1 py-0.5 text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }

    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2 break-all"
        >
          {part.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>
      );
    }

    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith("/")) {
        return (
          <Link
            key={i}
            href={href}
            onClick={onNavigate}
            className="font-medium text-primary underline underline-offset-2"
          >
            {label}
          </Link>
        );
      }
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2"
        >
          {label}
        </a>
      );
    }

    return <Fragment key={i}>{part}</Fragment>;
  });
}
