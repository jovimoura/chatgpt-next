"use client";

import React, { FC, memo } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  nightOwl,
  atomDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CheckIcon, CopyIcon } from "lucide-react";

interface CodeBlockProps {
  language: string;
  value: string;
}

interface MarkdownRendererProps {
  message: {
    role: "user" | "assistant";
    content: string;
  };
}

const CodeBlock: FC<CodeBlockProps> = memo(({ language, value }) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="relative w-full font-sans rounded-lg my-4 scrollbar-hide">
      <div className="flex items-center justify-between w-full px-6 py-2 pr-4 rounded-t-lg  border-b border-border">
        <span className="text-xs lowercase flex items-center px-2.5 py-1 bg-neutral-300 rounded">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center px-2.5 py-1 text-xs bg-neutral-300 hover:bg-neutral-400 rounded transition-colors font-base"
        >
          {isCopied ? (
            <>
              <CheckIcon className="size-3.5 mr-1.5" />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="size-3.5 mr-1.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={atomDark}
        PreTag="div"
        showLineNumbers={true}
        customStyle={{
          margin: 0,
          width: "100%",
          background: "#333",
          padding: "1.5rem",
          fontSize: "0.9rem",
          lineHeight: "1.5",
          fontFamily: "JetBrains Mono, monospace",
          scrollbarWidth: "none",
        }}
        lineNumberStyle={{
          minWidth: "2.5em",
          paddingRight: "1em",
          color: "#495162",
          textAlign: "right",
          userSelect: "none",
        }}
        codeTagProps={{
          style: {
            fontFamily: "JetBrains Mono, monospace",
          },
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";

const MarkdownRenderer: FC<MarkdownRendererProps> = memo(({ message }) => {
  const components: Partial<Components> = {
    h1: ({ node, ...props }) => (
      <h1 className="text-3xl lg:text-4xl font-bold mb-6 mt-8" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl lg:text-3xl font-semibold mb-4 mt-8" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-xl lg:text-2xl font-semibold mb-3 mt-6" {...props} />
    ),
    h4: ({ node, ...props }) => (
      <h4 className="text-lg lg:text-xl font-semibold mb-2 mt-6" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p
        className="text-base lg:text-lg mb-4 leading-relaxed whitespace-pre-wrap last:mb-0"
        {...props}
      />
    ),
    // @ts-ignore
    ul: ({ node, ordered, ...props }) => (
      <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
    ),
    // @ts-ignore
    ol: ({ node, ordered, ...props }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
    ),
    // @ts-ignore
    li: ({ node, ordered, ...props }) => (
      <li className="text-base lg:text-lg" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border-l-4 border-neutral-400 pl-4 my-4 italic"
        {...props}
      />
    ),
    a: ({ node, href, ...props }) => (
      <a
        href={href}
        className="text-blue-400 hover:text-blue-300 transition-colors"
        {...props}
      />
    ),
    // @ts-ignore
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const content = String(children).replace(/\n$/, "");

      if (inline || (!match && !content.includes("\n"))) {
        return (
          <code
            className="bg-neutral-400 px-2 py-1 rounded-md font-mono text-sm scrollbar-hide"
            {...props}
          >
            {content}
          </code>
        );
      }

      return <CodeBlock language={(match && match[1]) || ""} value={content} />;
    },
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table
          className="min-w-full divide-y divide-neutral-400 border border-neutral-400"
          {...props}
        />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th
        className="px-4 py-3 text-left text-sm font-semibold bg-neutral-300 border-b border-neutral-400"
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        className="px-4 py-2 text-sm border-t border-neutral-400"
        {...props}
      />
    ),
  };

  return (
    <div className="mb-8 lg:py-8 lg:pb-16 w-full pb-12">
      <div className="px- lg:px-0 prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={components}
        >
          {message?.content || message?.content}
        </ReactMarkdown>
      </div>
    </div>
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";

export default MarkdownRenderer;
