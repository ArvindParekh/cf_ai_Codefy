import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'just now'
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }
  
  // More than 24 hours
  const days = Math.floor(diff / 86400000)
  return `${days}d ago`
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function extractCodeFromMessage(content: string): { code: string; language?: string } | null {
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/
  const match = content.match(codeBlockRegex)
  
  if (match) {
    return {
      code: match[2].trim(),
      language: match[1] || undefined
    }
  }
  
  return null
}

export function isCodeAnalysisRequest(content: string): boolean {
  const codeAnalysisKeywords = [
    'analyze', 'review', 'check', 'audit', 'security', 'performance', 
    'quality', 'vulnerability', 'optimize', 'improve', 'bug', 'issue'
  ]
  
  const hasCode = /```[\s\S]*```/.test(content) || content.includes('function') || content.includes('class')
  const hasAnalysisKeyword = codeAnalysisKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  )

  return hasCode || hasAnalysisKeyword
}

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'text-red-500 bg-red-500/10 border-red-500/20'
    case 'high':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
    case 'medium':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    case 'low':
      return 'text-green-500 bg-green-500/10 border-green-500/20'
    default:
      return 'text-muted-foreground bg-muted/10 border-border/20'
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(null, args)
    }
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
}

export function scrollToBottom(element: HTMLElement, smooth = true) {
  element.scrollTo({
    top: element.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  })
}
