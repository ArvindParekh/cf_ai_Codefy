'use client'

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageBubble } from "./message-bubble"
import { ChatInput } from "./chat-input"
import { LoadingDots } from "@/components/ui/loading-dots"
import { useChat } from "@/hooks/use-chat"
import { cn, scrollToBottom } from "@/lib/utils"
import { Shield, Zap, CheckCircle, Terminal, Code, AlertCircle } from "lucide-react"

const EXAMPLES = [
  {
    icon: <Shield className="w-4 h-4" />,
    title: "Security Analysis",
    description: "Analyze this code for security vulnerabilities",
    code: "function login(user, pass) { ... }",
    content: `Analyze this JavaScript function for security issues:

\`\`\`javascript
function login(username, password) {
    const query = "SELECT * FROM users WHERE username='" + username + "' AND password='" + password + "'";
    return db.query(query);
}
\`\`\``,
    variant: "destructive" as const
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: "Performance Review",
    description: "Check this React component for performance issues",
    code: "function UserList({ users }) { ... }",
    content: `Check this React component for performance problems:

\`\`\`jsx
function UserList({ users }) {
    return (
        <div>
            {users.map(user => (
                <div key={user.id}>
                    {expensiveCalculation(user.data)}
                </div>
            ))}
        </div>
    );
}
\`\`\``,
    variant: "secondary" as const
  },
  {
    icon: <CheckCircle className="w-4 h-4" />,
    title: "Code Quality",
    description: "Review this Python code for quality improvements",
    code: "def process_data(data): ...",
    content: `Review this Python code for quality improvements:

\`\`\`python
def process_data(data):
    result = []
    for i in range(len(data)):
        if data[i] > 0:
            result.append(data[i] * 2)
    return result
\`\`\``,
    variant: "outline" as const
  },
  {
    icon: <Terminal className="w-4 h-4" />,
    title: "Best Practices",
    description: "Ask questions about code quality and best practices",
    content: "What are the most important security best practices for web applications?",
    variant: "ghost" as const
  }
]

export function ChatContainer() {
  const { messages, isLoading, error, sendMessage, clearError } = useChat()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollToBottom(scrollAreaRef.current)
    }
  }, [messages, isLoading])

  const handleExampleClick = (content: string) => {
    sendMessage(content)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar with examples */}
      <div className="w-80 border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-foreground">Quick Examples</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose an example to get started
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="p-4 space-y-3">
            {EXAMPLES.map((example, index) => (
              <Card
                key={index}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md group",
                  "border-0 bg-background hover:bg-muted/50"
                )}
                onClick={() => handleExampleClick(example.content)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      {example.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                        {example.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {example.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {example.code && (
                  <CardContent className="pt-0">
                    <div className="bg-muted/50 rounded-md px-3 py-2 text-xs font-mono text-muted-foreground border">
                      {example.code}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-foreground">
              Code Quality Assistant
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze your code for security, performance, and quality issues
            </p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={message.id === messages[messages.length - 1]?.id}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Terminal className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="bg-muted rounded-md px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LoadingDots />
                    <span className="text-sm">Analyzing your code...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-destructive/10">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
                <div className="bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3">
                  <div className="text-destructive text-sm">
                    {error}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          placeholder="Paste your code here or ask a question..."
        />
      </div>
    </div>
  )
}
