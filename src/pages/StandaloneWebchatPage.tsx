"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router"
import { WebchatWidget } from "@/components/webchat-widget"
import { Loader2, MessageCircle } from "lucide-react"

interface WebchatPlatform {
  id: string
  platform_identifier: string
  agent_id: string
  platform_config: {
    primaryColor: string
    welcomeMessage: string
    placeholderText: string
    position: 'bottom-right' | 'bottom-left'
    showAgentAvatar: boolean
    allowFileUpload: boolean
    askForCustomerInfo: boolean
    description: string
  }
}

export default function StandaloneWebchatPage() {
  const { platformId } = useParams<{ platformId: string }>()
  const [platform, setPlatform] = useState<WebchatPlatform | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!platformId) {
      setError('Platform ID is required')
      setLoading(false)
      return
    }

    // Fetch platform configuration
    const fetchPlatform = async () => {
      try {
        setLoading(true)
        // Try to get platform details from the platforms service
        // For now, we'll create a mock platform based on the platformId
        // In a real implementation, you'd fetch this from your backend
        
        // Extract agent ID from platform identifier if it follows the pattern
        const agentId = platformId.replace('webchat-', '')
        
        const mockPlatform: WebchatPlatform = {
          id: platformId,
          platform_identifier: platformId,
          agent_id: agentId,
          platform_config: {
            primaryColor: '#16A34A',
            welcomeMessage: 'Hello! How can I help you today?',
            placeholderText: 'Type your message...',
            position: 'bottom-right',
            showAgentAvatar: true,
            allowFileUpload: false,
            askForCustomerInfo: false,
            description: 'Live chat widget for website visitors'
          }
        }
        
        setPlatform(mockPlatform)
      } catch (err: any) {
        console.error('Failed to fetch platform:', err)
        setError(err.message || 'Failed to load webchat platform')
      } finally {
        setLoading(false)
      }
    }

    fetchPlatform()
  }, [platformId])

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-green-700">Loading webchat...</p>
        </div>
      </div>
    )
  }

  if (error || !platform) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Webchat Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || 'The requested webchat platform could not be found.'}
          </p>
          <p className="text-sm text-gray-500">
            Platform ID: {platformId}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Webchat Widget - Always open and centered */}
      <WebchatWidget
        agentId={platform.agent_id}
        isOpen={true}
        onToggle={() => {}}
        askForCustomerInfo={platform.platform_config.askForCustomerInfo}
      />
    </div>
  )
}