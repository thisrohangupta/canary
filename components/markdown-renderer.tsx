"use client"

import { memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Highlight, themes } from "prism-react-renderer"

interface MarkdownRendererProps {
  content: string
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="max-w-none text-gray-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...rest }) {
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""
            const isInline = node?.tagName === "code" && !className

            // Multi-line / fenced code block
            if (!isInline && language) {
              const code = String(children).replace(/\n$/, "")
              return (
                <Highlight theme={themes.oneLight} code={code} language={language}>
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                      className={`${className} rounded-lg border border-gray-200 overflow-x-auto`}
                      style={{ ...style, backgroundColor: "#fafafa", padding: "1rem" }}
                    >
                      {tokens.map((line, lineIndex) => {
                        // remove `key` returned by getLineProps before spreading
                        const { key, ...lineProps } = getLineProps({ line })
                        return (
                          <div key={lineIndex} {...lineProps}>
                            {line.map((token, tokenIndex) => {
                              // remove `key` returned by getTokenProps
                              const { key, ...tokenProps } = getTokenProps({ token })
                              return <span key={tokenIndex} {...tokenProps} />
                            })}
                          </div>
                        )
                      })}
                    </pre>
                  )}
                </Highlight>
              )
            }

            // Inline code
            return (
              <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...rest}>
                {children}
              </code>
            )
          },
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mb-2">{children}</h3>,
          p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong>{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg mb-3">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})
