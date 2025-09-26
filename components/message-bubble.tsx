'use client'

import * as React from "react"
import ReactMarkdown from 'react-markdown'
import { User, Bot } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, formatTimestamp } from "@/lib/utils"
import { CodeBlock, InlineCode } from "@/components/ui/code-block"
import type { Message } from "@/hooks/use-chat"

interface MessageBubbleProps {
  message: Message
  isLatest?: boolean
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const getMessageIcon = () => {
    if (isUser) return <User className="w-4 h-4" />
    return <Bot className="w-4 h-4" />
  }

  const getMessageTitle = () => {
    if (isUser) return "You"
    return "Assistant"
  }

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {getMessageIcon()}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex flex-col space-y-2 max-w-[85%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{getMessageTitle()}</span>
          <span>{formatTimestamp(message.timestamp)}</span>
        </div>

        <div
          className={cn(
            "rounded-lg px-4 py-3 shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border"
          )}
        >
          <MessageContent content={message.content} isUser={isUser} />
        </div>
      </div>
    </div>
  )
}

interface MessageContentProps {
  content: string
  isUser: boolean
}

function MessageContent({ content, isUser }: MessageContentProps) {
  if (isUser) {
    return <div className="whitespace-pre-wrap break-words">{content}</div>
  }

  return (
    <div className="prose prose-sm max-w-none text-foreground">
      <ReactMarkdown
        components={{
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : undefined
            const inline = (props as any).inline

            return !inline ? (
              <CodeBlock
                code={String(children).replace(/\n$/, '')}
                language={language}
                className="my-3"
              />
            ) : (
              <InlineCode {...props}>
                {String(children)}
              </InlineCode>
            )
          },
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 ml-4 list-disc space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 ml-4 list-decimal space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          h1: ({ children }) => (
            <h1 className="text-lg font-semibold mb-3">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mb-2">
              {children}
            </h3>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">
              {String(children)}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-border pl-4 italic my-3 bg-muted/50 py-2 rounded-r-md">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

