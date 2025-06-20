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
import { X, Eye, EyeOff } from "lucide-react";

interface CreateHumanAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: (agentData: HumanAgentFormData) => void;
}

interface HumanAgentFormData {
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
  onCreateAgent,
}: CreateHumanAgentModalProps) {
  const [formData, setFormData] = useState<HumanAgentFormData>({
    name: "",
    email: "",
    password: "",
    role: "Agent",
    department: "",
    active: true,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAgent(formData);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Agent",
      department: "",
      active: true,
    });
    onClose();
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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Create Agent</h2>
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
          <div className="space-y-2">
            <Input
              id="name"
              placeholder="Name *"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
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
                className="bg-gray-50 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
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
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Manager</SelectItem>
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
              >
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer Support">
                    Customer Support
                  </SelectItem>
                  <SelectItem value="Technical Support">
                    Technical Support
                  </SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              CREATE
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
