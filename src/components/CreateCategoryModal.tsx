import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { categoryService } from "@/services/productService";
import { useToast } from "@/hooks";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CategoryAttributeForm {
  attribute_name: string;
  is_required: boolean;
  display_order: number;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: showError } = useToast();

  const [categoryFormData, setCategoryFormData] = useState<{
    name: string;
    description: string;
    attributes: CategoryAttributeForm[];
  }>({
    name: "",
    description: "",
    attributes: [],
  });

  // Handle input changes
  const handleCategoryInputChange = (field: "name" | "description") => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCategoryFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Add new attribute
  const addAttribute = () => {
    setCategoryFormData((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        {
          attribute_name: "",
          is_required: false,
          display_order: prev.attributes.length + 1,
        },
      ],
    }));
  };

  // Remove attribute
  const removeAttribute = (index: number) => {
    setCategoryFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  // Update attribute
  const updateAttribute = (index: number, field: string, value: any) => {
    setCategoryFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  // Handle form submit
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const categoryData = {
        name: categoryFormData.name,
        description: categoryFormData.description,
        attributes: categoryFormData.attributes.filter(
          (attr) => attr.attribute_name.trim() !== ""
        ),
      };

      await categoryService.createCategory(categoryData as any);
      success("Category created successfully");
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating category:", error);
      showError(error.message || "Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      attributes: [],
    });
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <Label htmlFor="categoryName">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="categoryName"
              placeholder="Enter category name"
              value={categoryFormData.name}
              onChange={handleCategoryInputChange("name")}
              required
            />
          </div>

          <div>
            <Label htmlFor="categoryDescription">Description</Label>
            <Textarea
              id="categoryDescription"
              placeholder="Enter category description"
              value={categoryFormData.description}
              onChange={handleCategoryInputChange("description")}
              rows={3}
            />
          </div>

          {/* Attributes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Attributes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttribute}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </div>

            {categoryFormData.attributes.map((attribute, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Attribute {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAttribute(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`attribute-name-${index}`}>
                      Attribute Name
                    </Label>
                    <Input
                      id={`attribute-name-${index}`}
                      placeholder="e.g., Size, Color"
                      value={attribute.attribute_name}
                      onChange={(e) =>
                        updateAttribute(index, "attribute_name", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id={`attribute-required-${index}`}
                      checked={attribute.is_required}
                      onChange={(e) =>
                        updateAttribute(index, "is_required", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label
                      htmlFor={`attribute-required-${index}`}
                      className="text-sm"
                    >
                      Required
                    </Label>
                  </div>
                </div>
              </div>
            ))}

            {categoryFormData.attributes.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No attributes added yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click "Add Attribute" to add product attributes
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryModal;
