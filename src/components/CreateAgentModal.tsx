import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, ChevronDown } from "lucide-react"

interface CreateAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; template: string }) => void
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [agentName, setAgentName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const templates = [
    { value: "customer-service", label: "Customer Service AI" },
    { value: "sales", label: "Sales AI" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (agentName && selectedTemplate) {
      onSubmit({ name: agentName, template: selectedTemplate })
      setAgentName("")
      setSelectedTemplate("")
      onClose()
    }
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black opacity-25" 
        onClick={onClose}
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
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full p-3 text-left border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex items-center justify-between">
                    <span className={selectedTemplate ? "text-gray-900" : "text-gray-500"}>
                      {selectedTemplate 
                        ? templates.find(t => t.value === selectedTemplate)?.label
                        : "Pilih Template"
                      }
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    {templates.map((template) => (
                      <button
                        key={template.value}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        onClick={() => {
                          setSelectedTemplate(template.value)
                          setIsDropdownOpen(false)
                        }}
                      >
                        {template.label}
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
              disabled={!agentName || !selectedTemplate}
            >
              Buat Agent
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateAgentModal
