"use client";
import { useState } from "react"
import ChatHistoryList from "./chat-history-list"
import ChatConversation from "./chat-conversation"
import ChatInformation from "./chat-information"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockChatSessions, mockMessages, mockChatInfo } from "@/mock/data"

// Default welcome content
function WelcomeContent() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Selamat Datang di Dashboard
          </h2>
          <p className="text-muted-foreground">
            Pilih percakapan dari daftar di sebelah kiri untuk mulai melihat detail chat dan informasi pelanggan.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-card border border-border rounded-lg">
            <h3 className="font-medium text-foreground mb-2">💬 Chat Management</h3>
            <p className="text-sm text-muted-foreground">
              Kelola semua percakapan pelanggan dalam satu dashboard terpusat
            </p>
          </div>
          
          <div className="p-4 bg-card border border-border rounded-lg">
            <h3 className="font-medium text-foreground mb-2">🤖 AI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Bantuan AI tersedia untuk respon otomatis dan analisis percakapan
            </p>
          </div>
          
          <div className="p-4 bg-card border border-border rounded-lg">
            <h3 className="font-medium text-foreground mb-2">📊 Real-time Updates</h3>
            <p className="text-sm text-muted-foreground">
              Pantau status percakapan dan aktivitas pelanggan secara real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChatDashboard() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showInfo, setShowInfo] = useState(false)

  const selectedChat = selectedChatId ? mockChatSessions.find((chat) => chat.id === selectedChatId) : null

  return (
    <div className="flex h-screen bg-background relative">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full">
        {/* Left Sidebar - Chat History */}
        <div className="w-80 border-r border-border bg-card">
          <ChatHistoryList
            chatSessions={mockChatSessions}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Center Content */}
        {selectedChatId ? (
          <div className="flex-1 flex flex-col">
            <ChatConversation 
              messages={mockMessages} 
              selectedChat={selectedChat}
              onToggleInfo={() => {}} // No-op for desktop since info is always visible
              showInfo={false} // Don't show active state on desktop
            />
          </div>
        ) : (
          <WelcomeContent />
        )}

        {/* Right Sidebar - Chat Information - Always visible on desktop when chat is selected */}
        {selectedChatId && (
          <div className="w-80 border-l border-border bg-card">
            <ChatInformation chatInfo={mockChatInfo} />
          </div>
        )}
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden w-full">
        {!selectedChatId ? (
          /* Mobile Chat List - Full Screen */
          <div className="w-full h-full">
            <ChatHistoryList
              chatSessions={mockChatSessions}
              selectedChatId={selectedChatId}
              onSelectChat={setSelectedChatId}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        ) : (
          /* Mobile Chat Conversation - Full Screen */
          <div className="w-full h-full">
            <ChatConversation 
              messages={mockMessages} 
              selectedChat={selectedChat}
              onToggleMobileMenu={() => setSelectedChatId(null)} // Back to chat list
              showBackButton={true}
              onToggleInfo={() => setShowInfo(!showInfo)}
              showInfo={showInfo}
            />
          </div>
        )}

        {/* Mobile Info Modal */}
        <Dialog open={showInfo} onOpenChange={setShowInfo}>
          <DialogContent className="w-[95vw] max-w-md h-[90vh] max-h-[90vh] p-0 overflow-hidden">
            <DialogHeader className="sr-only">
              <DialogTitle>Chat Information</DialogTitle>
            </DialogHeader>
            <div className="h-full overflow-hidden">
              <ChatInformation chatInfo={mockChatInfo} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
