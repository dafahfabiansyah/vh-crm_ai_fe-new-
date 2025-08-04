import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DepartmentService } from "@/services/departmentService";
import { HumanAgentsService } from "@/services/humanAgentsService";
import React from "react";

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepartmentCreated?: () => void;
}

export default function CreateDepartmentModal({ isOpen, onClose, onDepartmentCreated }: CreateDepartmentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
    head_id: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setLoadingAgents(true);
      HumanAgentsService.getHumanAgents()
        .then((data) => setAgents(data))
        .finally(() => setLoadingAgents(false));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await DepartmentService.createDepartment({
        name: formData.name,
        description: formData.description,
        head_id: formData.head_id,
        // is_active: formData.is_active,
      });
      setFormData({ name: "", description: "", is_active: true, head_id: "" });
      onClose();
      if (onDepartmentCreated) onDepartmentCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create department");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="dept-name">Name *</Label>
            <Input
              id="dept-name"
              placeholder="Department Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept-desc">Description</Label>
            <Input
              id="dept-desc"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept-head">Head of Department</Label>
            <Select
              value={formData.head_id}
              onValueChange={(value) => handleInputChange("head_id", value)}
              disabled={isLoading || loadingAgents}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select head of department" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.user?.name || agent.name || agent.user_email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dept-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", !!checked)}
              disabled={isLoading}
            />
            <Label htmlFor="dept-active">Active</Label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="px-6">CANCEL</Button>
            <Button type="submit" disabled={isLoading} className="bg-primary text-white px-6 flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "CREATING..." : "CREATE"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 