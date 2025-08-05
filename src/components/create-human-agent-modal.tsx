import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { HumanAgentsService } from "@/services/humanAgentsService";
import { DepartmentService } from "@/services/departmentService";
import React from "react";
import { useToast } from "@/hooks";

interface CreateHumanAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent?: (agentData: HumanAgentFormData) => void; // Optional for backward compatibility
  onAgentCreated?: () => void; // Callback to refresh the list
}

interface HumanAgentFormData {
  phone_number: string | undefined;
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  active: boolean;
}

export default function CreateHumanAgentModal({
  isOpen,
  onClose,
  onAgentCreated,
}: CreateHumanAgentModalProps) {
  const [formData, setFormData] = useState<HumanAgentFormData>({
    name: "",
    email: "",
    password: "",
    role: "Agent",
    department: "",
    phone_number: "",
    active: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const { success } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      setLoadingDepartments(true);
      DepartmentService.getDepartments()
        .then((data) => setDepartments(data))
        .finally(() => setLoadingDepartments(false));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Panggil API create agent
      const requestData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        agent_type: "Human",
        role: formData.role
      };
      
      // Only include department if one is selected
      if (formData.department && formData.department !== "") {
        requestData.department = formData.department;
      }
      
      await HumanAgentsService.createHumanAgent(requestData);
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Agent",
        phone_number: "",
        department: "",
        active: true,
      });
      // Close modal and refresh list
      onClose();
      if (onAgentCreated) {
        onAgentCreated();
      }
      // Show success message
      success("Agent created successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to create agent");
      console.error("Error creating agent:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof HumanAgentFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Agent</DialogTitle>
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
                placeholder="Password *"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
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
          </div>{" "}
          <div className="space-y-2">
            <div className="relative">
              <Input
                id="phone_number"
                type="text"
                placeholder="Phone Number *"
                value={formData.phone_number}
                onChange={(e) =>
                  handleInputChange("phone_number", e.target.value)
                }
                required
                disabled={isLoading}
                className="bg-gray-50 pr-10"
              />
            </div>
          </div>{" "}
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
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
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
                disabled={isLoading || loadingDepartments}
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder={loadingDepartments ? "Loading..." : "Select department"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="placeholder" disabled>
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
          </div>{" "}
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
              {isLoading ? "CREATING..." : "CREATE"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
