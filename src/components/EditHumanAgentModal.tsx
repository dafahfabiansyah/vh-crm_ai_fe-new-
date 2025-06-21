import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { HumanAgentsService, type HumanAgent, type UpdateHumanAgentRequest } from "@/services/humanAgentsService";

interface EditHumanAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: HumanAgent | null;
  onAgentUpdated?: () => void; // Callback to refresh the list
}

interface EditHumanAgentFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  active: boolean;
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
    password: "",
    role: "agent",
    department: "",
    active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when agent data is available
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        email: agent.user_email || "",
        password: "", // Don't populate password for security
        role: agent.role || "agent",
        department: agent.department || "",
        active: agent.is_active !== undefined ? agent.is_active : true,
      });
    }
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    setIsLoading(true);
    setError(null);

    try {
      // Transform form data to API format (only include fields that have values)
      const apiData: UpdateHumanAgentRequest = {
        name: formData.name,
        user_email: formData.email,
        role: formData.role,
        department: formData.department,
        is_active: formData.active,
      };

      // Only include password if it's provided
      if (formData.password.trim()) {
        apiData.password = formData.password;
      }

      // Call the API
      await HumanAgentsService.updateHumanAgent(agent.id, apiData);
      
      // Close modal and refresh list
      onClose();
      if (onAgentUpdated) {
        onAgentUpdated();
      }
      
      console.log("Agent updated successfully");
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

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 relative z-10">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Edit Agent</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Input
              id="name"
              placeholder="Name *"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              disabled={isLoading}
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
              disabled={isLoading}
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password (leave empty to keep current)"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
                className="bg-gray-50 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-row justify-between space-x-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm text-gray-600">
                Role *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm text-gray-600">
                Department *
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_support">
                    Customer Support
                  </SelectItem>
                  <SelectItem value="technical_support">
                    Technical Support
                  </SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange("active", e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600"
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "UPDATING..." : "UPDATE"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
