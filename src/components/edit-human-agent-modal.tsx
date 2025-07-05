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
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface EditHumanAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: any | null;
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful update
      console.log("Agent updated successfully (mock):", formData);
      
      // Close modal and refresh list
      onClose();
      if (onAgentUpdated) {
        onAgentUpdated();
      }
      
      // Show success message
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
