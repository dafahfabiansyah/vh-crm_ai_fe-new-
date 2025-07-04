import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ChevronDown, Loader2, AlertCircle } from "lucide-react"
import { AgentsService } from "@/services/agentsService"
import type { AgentRole } from "@/types"

interface CreateAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [agentName, setAgentName] = useState("")
  const [selectedRoleId, setSelectedRoleId] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [roles, setRoles] = useState<AgentRole[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rolesLoading, setRolesLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchRoles()
    }
  }, [isOpen])

  const fetchRoles = async () => {
    try {
      setRolesLoading(true)
      const rolesData = await AgentsService.getAgentRoles()
      setRoles(rolesData)
    } catch (err: any) {
      console.error('Error fetching roles:', err)
      // Set default roles if API fails
      setRoles([
        { id: "Customer Service AI", name: "Customer Service AI", description: "AI agent for customer support", created_at: "", updated_at: "" },
        { id: "Sales AI", name: "Sales AI", description: "AI agent for sales operations", created_at: "", updated_at: "" },
      ])    } finally {
      setRolesLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agentName || !selectedRoleId) return

    try {
      setLoading(true)
      setError(null)
      
      const payload = {
        name: agentName,
        role_id: selectedRoleId,
        is_active: true
      }
      
      await AgentsService.createAgent(payload)
      
      // Reset form
      setAgentName("")
      setSelectedRoleId("")
      setIsDropdownOpen(false)
      
      // Close modal and refresh agents list
      onClose()
      onSuccess()
    } catch (err: unknown) {
      const error = err as { message?: string }
      console.error('Error creating agent:', err)
      setError(error.message || 'Failed to create agent')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setAgentName("")
    setSelectedRoleId("")
    setIsDropdownOpen(false)
    setError(null)
    onClose()
  }
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black opacity-25" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">
            Buat AI Agent Baru
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Agent Name Field */}
            <div className="space-y-2">
              <Label htmlFor="agentName" className="text-sm font-medium">
                Nama Agent
              </Label>
              <Input
                id="agentName"
                placeholder="Masukkan nama untuk AI agent Anda"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full"
                disabled={loading}
              />
            </div>

            {/* Template Field */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Template Agent
              </Label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full p-3 text-left border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={loading || rolesLoading}
                >
                  <div className="flex items-center justify-between">
                    <span className={selectedRoleId ? "text-gray-900" : "text-gray-500"}>
                      {rolesLoading ? "Memuat template..." : (
                        selectedRoleId 
                          ? roles.find(r => r.id === selectedRoleId)?.name
                          : "Pilih Template"
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
                
                {isDropdownOpen && !rolesLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        onClick={() => {
                          setSelectedRoleId(role.id)
                          setIsDropdownOpen(false)
                        }}
                      >
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!agentName || !selectedRoleId || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Membuat Agent...
                </>
              ) : (
                'Buat Agent'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateAgentModal
