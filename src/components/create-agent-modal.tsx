import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import { mockAgentRoles } from "@/mock/data"
import type { AgentRole } from "@/types"

interface CreateAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newAgent?: any) => void
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [agentName, setAgentName] = useState("")
  const [selectedRoleId, setSelectedRoleId] = useState("")
  const [roles, setRoles] = useState<AgentRole[]>(mockAgentRoles)
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(mockAgentRoles)
    } catch (err: any) {
      console.error('Error fetching roles:', err)
      setRoles(mockAgentRoles)
    } finally {
      setRolesLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agentName || !selectedRoleId) return

    try {
      setLoading(true)
      setError(null)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the selected role
      const selectedRole = roles.find(role => role.id === selectedRoleId);
      
      // Create new agent object
      const newAgent = {
        id: Date.now().toString(), // Simple ID generation
        name: agentName,
        role_id: selectedRoleId,
        is_active: true,
        role: selectedRole || {
          id: selectedRoleId,
          name: "Unknown Role",
          description: "Role description not available",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Reset form
      setAgentName("")
      setSelectedRoleId("")
      
      // Close modal and notify parent with new agent
      onClose()
      onSuccess(newAgent)
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
    setError(null)
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Buat AI Agent Baru
          </DialogTitle>
        </DialogHeader>
        
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
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={loading || rolesLoading}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={rolesLoading ? "Memuat template..." : "Pilih Template"}
                />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      </DialogContent>
    </Dialog>
  )
}

export default CreateAgentModal
