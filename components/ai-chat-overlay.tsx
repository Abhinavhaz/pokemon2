"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Minimize2,
  Maximize2,
  Loader2,
} from "lucide-react"
import { usePokemonStore } from "@/lib/store"
import { parseCommand, executeCommand, getExampleCommands, type CommandResult } from "@/lib/command-parser"

interface ChatMessage {
  id: string
  type: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  result?: CommandResult
}

interface AIChatOverlayProps {
  isOpen: boolean
  onToggle: () => void
}

export function AIChatOverlay({ isOpen, onToggle }: AIChatOverlayProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "system",
      content: "🤖 AI Data Assistant ready! Use natural language to edit your Pokemon data. Type 'help' for examples.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { pokemon, customColumns, updatePokemon, deletePokemon, bulkUpdatePokemon } = usePokemonStore()

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)

    await new Promise((resolve) => setTimeout(resolve, 300))

    // Handle help command
    if (input.toLowerCase().trim() === "help") {
      const helpMessage: ChatMessage = {
        id: `help-${Date.now()}`,
        type: "assistant",
        content: "Here are some example commands you can try:",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, helpMessage])
      setInput("")
      setIsProcessing(false)
      return
    }

    const command = parseCommand(input.trim(), customColumns)

    if (!command) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content:
          "❌ I couldn't understand that command. Try something like 'set hp to 100 for all pokemon of type grass' or type 'help' for examples.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setInput("")
      setIsProcessing(false)
      return
    }

    // Execute the command
    const result = executeCommand(command, pokemon, customColumns, updatePokemon, deletePokemon, bulkUpdatePokemon)

    const responseMessage: ChatMessage = {
      id: `response-${Date.now()}`,
      type: "assistant",
      content: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
      timestamp: new Date(),
      result,
    }

    setMessages((prev) => [...prev, responseMessage])
    setInput("")
    setIsProcessing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed z-50 shadow-2xl transition-all duration-300 border-2 ${
        isMinimized ? "h-14 sm:h-16" : "h-[65vh] sm:h-[520px]"
      } w-[calc(100%-1.5rem)] sm:w-96 left-3 right-3 sm:left-auto sm:right-6 bottom-3 sm:bottom-6`}
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">AI Data Assistant</span>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
              Beta
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-primary/10"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
              onClick={onToggle}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col p-4 pt-0 h-[calc(65vh-80px)] sm:h-[440px] min-h-0">
          {/* Messages */}
          <ScrollArea className="flex-1 pr-4 mt-4 min-h-0" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={`flex items-start gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.type !== "user" && (
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center ${
                            message.type === "system" ? "bg-muted" : "bg-primary/10"
                          }`}
                        >
                          {message.type === "system" ? (
                            <HelpCircle className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Bot className="h-3 w-3 text-primary" />
                          )}
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground ml-auto shadow-sm"
                          : message.type === "system"
                            ? "bg-muted/50 text-muted-foreground border border-border/50"
                            : "bg-card border border-border/50 shadow-sm"
                      }`}
                    >
                      {message.content}

                      {/* Command result indicator */}
                      {message.result && (
                        <div
                          className={`flex items-center gap-2 mt-3 pt-2 text-xs border-t ${
                            message.result.success
                              ? "text-primary border-primary/20"
                              : "text-destructive border-destructive/20"
                          }`}
                        >
                          {message.result.success ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {message.result.affectedCount && (
                            <span className="font-medium">{message.result.affectedCount} records affected</span>
                          )}
                        </div>
                      )}
                    </div>

                    {message.type === "user" && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Show examples after help message */}
                  {message.content.includes("example commands") && (
                    <div className="ml-9 space-y-2">
                      {getExampleCommands().map((example, index) => (
                        <div
                          key={index}
                          className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors border border-border/30"
                          onClick={() => setInput(example)}
                        >
                          <code className="font-mono">{example}</code>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex items-start gap-3 justify-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-3 w-3 text-primary animate-spin" />
                    </div>
                  </div>
                  <div className="bg-card border border-border/50 shadow-sm rounded-xl px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Processing command...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex items-center gap-3 pt-4 border-t border-border/50">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a command... (e.g., 'set hp to 100 for all grass pokemon')"
              className="flex-1 text-sm border-border/50 focus:border-primary/50 bg-background"
              disabled={isProcessing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isProcessing}
              size="icon"
              className="h-9 w-9 bg-primary hover:bg-primary/90"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {/* Quick stats */}
          <div className="text-xs text-muted-foreground pt-3 text-center bg-muted/20 rounded-lg px-3 py-2 mt-2">
            <span className="font-medium">{pokemon.length.toLocaleString()}</span> Pokemon loaded •
            <span className="font-medium"> {customColumns.length}</span> custom columns • Type{" "}
            <code className="bg-muted px-1 rounded">help</code> for examples
          </div>
        </CardContent>
      )}
    </Card>
  )
}
