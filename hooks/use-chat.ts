'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isAnalysis?: boolean
}

export interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
}

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Welcome to Code Quality Assistant. I can help you analyze code for:

**Security:** Vulnerabilities, injection attacks, authentication issues
**Performance:** Bottlenecks, memory leaks, optimization opportunities
**Quality:** Code structure, maintainability, best practices

Paste your code in triple backticks or ask me any coding questions.`,
        timestamp: Date.now(),
      }
    ],
    isLoading: false,
    error: null,
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    }
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }))
    
    return newMessage.id
  }, [])
  
  const updateMessage = useCallback((id: string, content: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === id ? { ...msg, content } : msg
      )
    }))
  }, [])
  
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isLoading) return
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    // Add user message
    addMessage({
      role: 'user',
      content: content.trim(),
    })
    
    // Set loading state
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Use environment variable for API URL, fallback to relative path
      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/agents/simple-code-agent`
        : '/agents/simple-code-agent'
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: content.trim() }]
        }),
        signal: abortControllerRef.current.signal,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const responseData = await response.json() as any
      let assistantContent = ''
      
      // Handle different response formats
      if (responseData.choices && responseData.choices[0]?.delta?.content) {
        assistantContent = responseData.choices[0].delta.content
      } else if (responseData.analysis) {
        assistantContent = responseData.analysis
      } else if (responseData.message) {
        assistantContent = responseData.message
      } else if (typeof responseData === 'string') {
        assistantContent = responseData
      } else {
        console.warn('Unexpected response format:', responseData)
        assistantContent = "I apologize, but I couldn't process your request. Please try again."
      }
      
      // Add assistant response
      addMessage({
        role: 'assistant',
        content: assistantContent,
        isAnalysis: responseData.analysis !== undefined,
      })
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled, don't show error
        return
      }
      
      console.error('Chat error:', error)
      
      setState(prev => ({
        ...prev,
        error: 'Failed to get response. Please check your connection and try again.'
      }))
      
      // Add error message
      addMessage({
        role: 'assistant',
        content: "I encountered an error processing your request. Please check your connection and try again.",
      })
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
      abortControllerRef.current = null
    }
  }, [state.isLoading, addMessage])
  
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])
  
  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.slice(0, 1) // Keep welcome message
    }))
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])
  
  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    addMessage,
    updateMessage,
    clearError,
    clearMessages,
  }
}
