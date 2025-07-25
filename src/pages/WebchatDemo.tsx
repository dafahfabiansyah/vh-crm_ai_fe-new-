"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WebchatWidget } from "@/components/webchat-widget"
import { MessageCircle } from 'lucide-react'

export default function WebchatDemo() {
  const [isWebchatOpen, setIsWebchatOpen] = useState(false)
  const [agentId, setAgentId] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)

  const handleConfigure = () => {
    if (agentId.trim()) {
      setIsConfigured(true)
    } else {
      alert('Please enter an Agent ID')
    }
  }

  const handleToggleWebchat = () => {
    setIsWebchatOpen(!isWebchatOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Webchat Widget Demo
          </h1>
          <p className="text-gray-600">
            Test the webchat widget functionality with AI agents. This demo replicates the same contact and lead creation logic as the WhatsApp gateway.
          </p>
        </div>

        {!isConfigured ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Configure Webchat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentId">AI Agent ID</Label>
                <Input
                  id="agentId"
                  placeholder="Enter AI Agent ID..."
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleConfigure()}
                />
                <p className="text-sm text-gray-500">
                  Enter the ID of the AI agent you want to test with.
                </p>
              </div>
              <Button onClick={handleConfigure} className="w-full">
                Start Webchat Demo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Demo Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Configuration</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Agent ID:</span> {agentId}</p>
                      <p><span className="font-medium">Platform:</span> webchat-{Math.random().toString(36).substr(2, 9)}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Features</h3>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Contact creation without phone number</li>
                      <li>• Lead creation following WhatsApp gateway logic</li>
                      <li>• Existing lead detection and reuse</li>
                      <li>• AI agent assignment and responses</li>
                      <li>• Chat history persistence</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">1. Open the chat widget:</span> Click the chat button in the bottom-right corner.
                  </p>
                  <p>
                    <span className="font-medium">2. Enter your name:</span> Provide a name to start the conversation (this will be used as the contact identifier).
                  </p>
                  <p>
                    <span className="font-medium">3. Start chatting:</span> Send messages and receive AI responses. The system will:
                  </p>
                  <ul className="ml-4 space-y-1">
                    <li>• Create a new contact with your name as the identifier</li>
                    <li>• Check for existing leads for this contact</li>
                    <li>• Create a new lead only if no active lead exists</li>
                    <li>• Assign the specified AI agent</li>
                    <li>• Log all messages in the chat history</li>
                  </ul>
                  <p>
                    <span className="font-medium">4. Test lead reuse:</span> Close and reopen the chat with the same name to see how existing leads are handled.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button 
                onClick={handleToggleWebchat}
                className="inline-flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{isWebchatOpen ? 'Close' : 'Open'} Webchat Widget</span>
              </Button>
            </div>
          </div>
        )}

        {/* Webchat Widget */}
        {isConfigured && (
          <WebchatWidget
            agentId={agentId}
            isOpen={isWebchatOpen}
            onToggle={handleToggleWebchat}
          />
        )}
      </div>
    </div>
  )
}