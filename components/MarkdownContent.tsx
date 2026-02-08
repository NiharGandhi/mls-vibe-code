"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown as formatted content. Supports **bold**, *italic*, headers,
 * lists, links, code, blockquotes, and tables (GFM).
 * Plain text is also rendered correctly (no markdown = normal paragraphs).
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  if (!content?.trim()) return null;

  return (
    <div
      className={cn(
        "markdown-content text-muted-foreground",
        "markdown-content prose-headings:font-semibold markdown-content prose-headings:text-foreground",
        "markdown-content prose-p:leading-relaxed markdown-content prose-ul:my-2 markdown-content prose-ol:my-2",
        "markdown-content prose-li:my-0.5 markdown-content prose-a:text-primary markdown-content prose-a:underline",
        "markdown-content prose-code:rounded markdown-content prose-code:bg-muted markdown-content prose-code:px-1 markdown-content prose-code:py-0.5 markdown-content prose-code:text-sm",
        "markdown-content prose-pre:bg-muted markdown-content prose-pre:rounded-lg markdown-content prose-blockquote:border-primary/30",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-0.5 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-0.5 mb-2">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="text-xl font-semibold text-foreground mt-4 mb-2 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-foreground mt-3 mb-1.5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-2 mb-1">{children}</h3>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-sm my-2">
                  <code {...props}>{children}</code>
                </pre>
              );
            }
            return (
              <code className="rounded bg-muted px-1 py-0.5 text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-border pl-4 my-2 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted/50 px-3 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2">{children}</td>
          ),
          tr: ({ children }) => <tr className="border-border">{children}</tr>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
