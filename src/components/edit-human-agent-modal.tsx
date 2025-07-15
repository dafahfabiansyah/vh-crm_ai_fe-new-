import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { HumanAgentsService } from "@/services";

// Dummy UUID mapping for departments
const DEPARTMENT_OPTIONS = [
  { label: "Customer Support", value: "customer-support" },
  { label: "Technical Support", value: "technical-support" },
  { label: "Management", value: "management" },
  { label: "Sales", value: "sales" },
  { label: "Marketing", value: "marketing" },
];

interface EditHumanAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: any | null;
  onAgentUpdated?: () => void; // Callback to refresh the list
}

interface EditHumanAgentFormData {
  department: string; // UUID
  active: boolean;
  role: string; // agent_type
}

export default function EditHumanAgentModal({
  isOpen,
  onClose,
  agent,
  onAgentUpdated,
}: EditHumanAgentModalProps) {
  const [formData, setFormData] = useState<EditHumanAgentFormData>({
    department: "",
    active: true,
    role: "agent",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when agent data is available
  useEffect(() => {
    if (agent) {
      setFormData({
        department: agent.department|| "",
        active: agent.is_active !== undefined ? agent.is_active : true,
        role: agent.role || "agent",
      });
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    setIsLoading(true);
    setError(null);

    try {
      // PATCH update human agent
      await HumanAgentsService.patchAgent(agent.id, {
        department: formData.department,
        is_active: formData.active,
        agent_type: formData.role,
      });

      onClose();
      if (onAgentUpdated) {
        onAgentUpdated();
      }
      alert("Agent updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update agent");
      console.error("Error updating agent:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof EditHumanAgentFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-row justify-between space-x-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="role" className="text-sm text-gray-600">
                Agent Type
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-50 w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="department" className="text-sm text-gray-600">
                Department
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange("department", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleInputChange("active", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="active" className="text-sm text-gray-600">
              Active
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="px-6"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white px-6 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "UPDATING..." : "UPDATE"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
