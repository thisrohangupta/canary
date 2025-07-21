"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter/dist/esm/prism'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          
          const isInline = node?.tagName === 'code' && node?.position?.start?.line === node?.position?.end?.line
          
          if (!isInline && language) {
            return (
              <SyntaxHighlighter
                style={oneLight as { [key: string]: React.CSSProperties }}
                language={language}
                PreTag="div"
                className="rounded-lg border border-gray-200"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          }
          
          return (
            <code 
              className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" 
              {...props}
            >
              {children}
            </code>
          )
        },
        h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-900 mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold text-gray-900 mb-2">{children}</h3>,
        p: ({ children }) => <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside text-gray-700 mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside text-gray-700 mb-3 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-gray-700">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
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
}