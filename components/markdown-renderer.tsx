"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

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
                style={vscDarkPlus as { [key: string]: React.CSSProperties }}
                language={language}
                PreTag="div"
                className="rounded-lg"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          }
          
          return (
            <code 
              className="bg-gray-700 text-cyan-300 px-1.5 py-0.5 rounded text-sm font-mono" 
              {...props}
            >
              {children}
            </code>
          )
        },
        h1: ({ children }) => <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold text-white mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold text-white mb-2">{children}</h3>,
        p: ({ children }) => <p className="text-gray-100 mb-3 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside text-gray-100 mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside text-gray-100 mb-3 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-gray-100">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
        em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-cyan-500 pl-4 py-2 bg-gray-800 rounded-r-lg mb-3">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a 
            href={href} 
            className="text-cyan-400 hover:text-cyan-300 underline"
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