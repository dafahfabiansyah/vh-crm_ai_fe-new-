import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DepartmentService } from "@/services/departmentService";
import { toast } from "sonner";


interface EditHumanAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: any | null;
  onAgentUpdated?: () => void; // Callback to refresh the list
}

interface EditHumanAgentFormData {
  name: string;
  email: string;
  phone_number: string;
  department: string; // UUID
  active: boolean;
  role: string; // role field
}

export default function EditHumanAgentModal({
  isOpen,
  onClose,
  agent,
  onAgentUpdated,
}: EditHumanAgentModalProps) {
  const [formData, setFormData] = useState<EditHumanAgentFormData>({
    name: "",
    email: "",
    phone_number: "",
    department: "",
    active: true,
    role: "Manager",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Fetch and populate form when agent is available
  useEffect(() => {
    if (agent && agent.id) {
      const fetchAgentDetails = async () => {
        try {
          const agentDetails = await HumanAgentsService.getAgentDetails(agent.id);
          setFormData({
            name: agentDetails.user?.name || agentDetails.name || "",
            email: agentDetails.user?.email || "",
            phone_number: agentDetails.user?.phone_number || "",
            department: agentDetails.department || "",
            active: agentDetails.is_active !== undefined ? agentDetails.is_active : true,
            role: agentDetails.role || "Manager",
          });
        } catch (error) {
          console.error("Error fetching agent details:", error);
          // Fallback to basic agent data if detailed fetch fails
          setFormData({
            name: agent.name || "",
            email: agent.user_email || "",
            phone_number: "",
            department: agent.department || "",
            active: agent.is_active !== undefined ? agent.is_active : true,
            role: agent.role || "Manager",
          });
        }
      };
      
      fetchAgentDetails();
    }
  }, [agent]);

  useEffect(() => {
    if (isOpen) {
      setLoadingDepartments(true);
      DepartmentService.getDepartments()
        .then((data) => setDepartments(data))
        .finally(() => setLoadingDepartments(false));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    setIsLoading(true);
    setError(null);

    try {
      // PATCH update human agent
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        is_active: formData.active,
        role: formData.role,
      };
      
      // Only include department if one is selected
      if (formData.department && formData.department !== "" && formData.department !== "no-departments") {
        payload.department = formData.department;
      }
      
      await HumanAgentsService.updateHumanAgent(agent.id, payload);

      onClose();
      if (onAgentUpdated) {
        onAgentUpdated();
      }
      toast.success("Agent updated successfully!");
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

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-gray-600">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isLoading}
              className="bg-gray-50"
              placeholder="Enter agent name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-gray-600">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isLoading}
              className="bg-gray-50"
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-sm text-gray-600">
              Phone Number
            </Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleInputChange("phone_number", e.target.value)}
              disabled={isLoading}
              className="bg-gray-50"
              placeholder="Enter phone number"
            />
          </div>

          <div className="flex flex-row justify-between space-x-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="role" className="text-sm text-gray-600">
                  Role
                </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-50 w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
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
                disabled={isLoading || loadingDepartments}
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder={loadingDepartments ? "Loading..." : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" disabled>
                    Pilih department...
                  </SelectItem>
                  {departments.length === 0 && !loadingDepartments ? (
                    <SelectItem value="no-departments" disabled>
                      No departments found
                    </SelectItem>
                  ) : (
                    departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))
                  )}
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
