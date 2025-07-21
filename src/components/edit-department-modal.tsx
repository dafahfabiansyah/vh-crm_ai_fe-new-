import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { DepartmentService } from "@/services/departmentService";

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: any | null;
  onDepartmentUpdated?: () => void;
}

export default function EditDepartmentModal({ isOpen, onClose, department, onDepartmentUpdated }: EditDepartmentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        description: department.description || "",
        is_active: department.is_active !== undefined ? department.is_active : true,
      });
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department) return;
    setIsLoading(true);
    setError(null);
    try {
      await DepartmentService.updateDepartment(department.id, {
        name: formData.name,
        description: formData.description,
        is_active: formData.is_active,
      });
      onClose();
      if (onDepartmentUpdated) onDepartmentUpdated();
    } catch (err: any) {
      setError(err.message || "Failed to update department");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!department) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="dept-name-edit">Name *</Label>
            <Input
              id="dept-name-edit"
              placeholder="Department Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept-desc-edit">Description</Label>
            <Input
              id="dept-desc-edit"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dept-active-edit"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", !!checked)}
              disabled={isLoading}
            />
            <Label htmlFor="dept-active-edit">Active</Label>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="px-6">CANCEL</Button>
            <Button type="submit" disabled={isLoading} className="bg-primary text-white px-6 flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "UPDATING..." : "UPDATE"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 