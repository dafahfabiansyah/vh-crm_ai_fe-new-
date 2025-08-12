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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productService, uploadImageToS3, categoryService, type CategoryAttribute } from "@/services/productService";
import { useToast } from "@/hooks";
import type { Category, ProductFormData } from "@/types";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
}) => {
  console.log("CreateProductModal props:", {
    isOpen,
    categories: categories.length,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string>("");
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});

  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    weight: "",
    stock: "",
    colors: "",
    material: "",
    code: "",
    category: "",
    image: "",
  });

  // Utility function for formatting numbers
  const formatNumber = (value: number | string): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0";
    return num.toLocaleString("id-ID");
  };

  // Handle input changes
  const handleInputChange = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: field === "price" || field === "weight" || field === "stock"
        ? value.replace(/\D/g, "")
        : value,
    }));
  };

  // Handle attribute value changes
  const handleAttributeValueChange = (attributeName: string, value: string) => {
    setAttributeValues((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  // Handle image file change
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUploadError("");
    }
  };

  // Handle image upload
  const handleUploadImage = async () => {
    if (!imageFile) return;

    setIsUploadingImage(true);
    setImageUploadError("");

    try {
      const response = await uploadImageToS3(imageFile);
      console.log("Full upload response:", response);
      
      // Handle different possible response structures
      let imageUrl = "";
      if (typeof response === 'string') {
        imageUrl = response;
      } else if (response.url) {
        imageUrl = response.url;
      } else if (response.data && response.data.url) {
        imageUrl = response.data.url;
      } else if (response.image_url) {
        imageUrl = response.image_url;
      } else if (response.link) {
        imageUrl = response.link;
      } else {
        console.warn("Unknown response structure:", response);
        throw new Error("Invalid response from image upload");
      }
      
      console.log("Extracted image URL:", imageUrl);
      
      setFormData((prev) => ({ 
        ...prev, 
        image: imageUrl 
      }));
      
      console.log("Image URL saved to formData.image");
      
      success("Image uploaded successfully");
      setImageFile(null);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setImageUploadError(error.message || "Failed to upload image");
      showError("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare data based on Go struct CreateProductRequest
      const productData: any = {
        id_category: formData.category,                        // uuid.UUID (as string)
        sku: formData.code,                                    // string
        name: formData.name,                                   // string
        description: formData.description || "",               // string (not null)
        stock: formData.stock || "0",                          // string (not null)
        price: formData.price ? parseFloat(formData.price) : 0, // float64 (not null)
        status: true,                                          // bool
        
        // Attributes array - based on CreateProductAttributeRequest struct
        attributes: categoryAttributes.map((attr) => {
          const value = attributeValues[attr.attribute_name] || "";
          console.log(`Mapping attribute: ${attr.attribute_name} (ID: ${attr.id}) = "${value}"`);
          return {
            id_category_attribute: attr.id,  // Use the actual attribute ID
            value: value  // Use attribute name as key
          };
        }),
      };

      // Add image only if it exists
      if (formData.image) {
        productData.image = formData.image;
      }

      console.log("Creating product with data:", productData);
      console.log("Form data image value:", formData.image);
      console.log("Final payload attributes:", productData.attributes);

      await productService.createProduct(productData as any);
      success("Product created successfully");
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating product:", error);
      showError(error.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      weight: "",
      stock: "",
      colors: "",
      material: "",
      code: "",
      category: "",
      image: "",
    });
    setAttributeValues({});
    setImageFile(null);
    setImageUploadError("");
    setCategoryAttributes([]);
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
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">
              SKU / Product Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              placeholder="Enter product code (SKU)"
              value={formData.code}
              onChange={handleInputChange("code")}
              required
            />
          </div>

          <div>
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter the product name"
              value={formData.name}
              onChange={handleInputChange("name")}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter Description"
              value={formData.description}
              onChange={handleInputChange("description")}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={async (value) => {
                setFormData((prev) => ({ ...prev, category: value }));
                setCategoryAttributes([]);
                setAttributeValues({});
                
                console.log("Category selected:", value);
                
                if (value) {
                  try {
                    console.log("Fetching category details for:", value);
                    const detail = await categoryService.getCategoryById(value);
                    console.log("Category detail response:", detail);
                    
                    if (detail.attributes && Array.isArray(detail.attributes)) {
                      console.log("Setting category attributes:", detail.attributes);
                      setCategoryAttributes(detail.attributes);
                      
                      // Initialize empty attribute values
                      const attrInit: Record<string, string> = {};
                      detail.attributes.forEach((attr) => {
                        attrInit[attr.attribute_name] = "";
                      });
                      setAttributeValues(attrInit);
                      console.log("Initialized attribute values:", attrInit);
                    }
                  } catch (err) {
                    console.error("Error fetching category details:", err);
                    setCategoryAttributes([]);
                    setAttributeValues({});
                  }
                }
              }}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Render attribute fields dinamis */}
          {(() => {
            console.log("Rendering attributes, categoryAttributes:", categoryAttributes);
            return null;
          })()}
          {categoryAttributes.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Category Attributes ({categoryAttributes.length})</h4>
              {categoryAttributes
                .sort((a, b) => a.display_order - b.display_order)
                .map((attr) => (
                  <div key={attr.attribute_name}>
                    <Label htmlFor={`attr-${attr.attribute_name}`}>
                      {attr.attribute_name}
                      {attr.is_required && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <Input
                      id={`attr-${attr.attribute_name}`}
                      placeholder={`Enter ${attr.attribute_name}`}
                      value={attributeValues[attr.attribute_name] || ""}
                      onChange={(e) => {
                        console.log(`Attribute ${attr.attribute_name} changed to:`, e.target.value);
                        handleAttributeValueChange(
                          attr.attribute_name,
                          e.target.value
                        );
                      }}
                      required={attr.is_required}
                    />
                  </div>
                ))}
            </div>
          )}

          <div>
            <Label htmlFor="image">Product Image</Label>
            <div className="flex items-center gap-2">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
              <Button
                type="button"
                onClick={handleUploadImage}
                disabled={!imageFile || isUploadingImage}
              >
                {isUploadingImage ? "Uploading..." : "Upload"}
              </Button>
            </div>
            {imageUploadError && (
              <div className="text-red-500 text-sm mt-1">
                {imageUploadError}
              </div>
            )}
            {formData.image && (
              <div className="mt-2">
                {/* <p className="text-sm text-green-600 mb-1">
                  Image uploaded: {formData.image}
                </p> */}
                <img
                  src={formData.image}
                  alt="Product Preview"
                  className="max-h-32 rounded border"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">
                Price <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </span>
                <Input
                  id="price"
                  type="text"
                  placeholder="0"
                  value={formData.price ? formatNumber(formData.price) : ""}
                  onChange={handleInputChange("price")}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="weight">
                Weight (grams) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="weight"
                type="text"
                placeholder="0"
                value={formData.weight ? formatNumber(formData.weight) : ""}
                onChange={handleInputChange("weight")}
                required
              />
            </div>

            <div>
              <Label htmlFor="stock">
                Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="text"
                placeholder="0"
                value={formData.stock ? formatNumber(formData.stock) : ""}
                onChange={handleInputChange("stock")}
                required
              />
            </div>
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

export default CreateProductModal;
