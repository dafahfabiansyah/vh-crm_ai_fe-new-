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
import { uploadImageToS3, productService, type CategoryAttribute } from "@/services/productService";
import { useToast } from "@/hooks";
import type { Category, Product } from "@/types";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
  categories: Category[];
  categoriesWithAttributes: Map<string, CategoryAttribute[]>;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
  categories,
  categoriesWithAttributes,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string>("");
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});

  const { success, error: showError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    weight: "",
    stock: "",
    colors: "",
    material: "",
    code: "",
    sku: "",
    category: "",
    image: "",
  });

  // Utility function for formatting numbers
  const formatNumber = (value: number | string): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0";
    return num.toLocaleString("id-ID");
  };

  // Initialize form data when product changes
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        weight: product.weight?.toString() || "",
        stock: product.stock?.toString() || "",
        colors: Array.isArray(product.colors) ? product.colors.join(", ") : "",
        material: product.material || "",
        code: product.code || product.sku || "",
        sku: product.sku || product.code || "",
        category: (product as any).category || (product as any).id_category || "", 
        image: product.image_url || product.image || "", // prioritize image_url
      });

      // Initialize attributes if product has them
      if ((product as any).attributes && Array.isArray((product as any).attributes)) {
        const attrs: Record<string, string> = {};
        (product as any).attributes.forEach((attr: any) => {
          // Use attribute_name as key, value as value
          attrs[attr.attribute_name] = attr.value;
        });
        console.log("Initialized attribute values from product:", attrs);
        setAttributeValues(attrs);
      } else {
        setAttributeValues({});
      }

      // Load category attributes based on product's category
      const productCategoryId = (product as any).id_category || (product as any).category;
      console.log("Product category ID:", productCategoryId);
      if (productCategoryId && categoriesWithAttributes.has(productCategoryId)) {
        const categoryAttrs = categoriesWithAttributes.get(productCategoryId) || [];
        console.log("Loading category attributes for edit:", categoryAttrs);
        setCategoryAttributes(categoryAttrs);
      } else {
        console.log("No category attributes found for:", productCategoryId);
        setCategoryAttributes([]);
      }
    }
  }, [product, isOpen, categories, categoriesWithAttributes]);

  // Handle input changes
  const handleInputChange = (field: string) => (
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
    if (!product) return;

    setIsLoading(true);

    try {
      // Prepare attributes array like in ProductPageRefactored
      const attributesArr = categoryAttributes.map((attr) => {
        const value = attributeValues[attr.attribute_name] || "";
        console.log(`Edit - Mapping attribute: ${attr.attribute_name} (ID: ${attr.id}) = "${value}"`);
        return {
          id_category_attribute: attr.id,
          value: value,
        };
      });
      
      console.log("Final attributes array for update:", attributesArr);

      // Prepare product data for API - based on Go struct UpdateProductRequest
      const productData: any = {};
      
      // String fields (*string in Go)
      if (formData.name) productData.name = formData.name;
      if (formData.description) productData.description = formData.description;
      if (formData.sku || formData.code) productData.sku = formData.sku || formData.code;
      if (formData.stock) productData.stock = formData.stock; // *string
      if (formData.image) productData.image = formData.image; // Send image URL directly
      
      // Number fields (*float64 in Go)
      if (formData.price) productData.price = parseFloat(formData.price) || 0; // *float64
      
      // Bool field (*bool in Go) - assuming product is active when editing
      productData.status = true; // *bool
      
      // Add attributes if available
      if (attributesArr.length > 0) {
        productData.attributes = attributesArr;
      }

      console.log("Updating product with data:", productData);
      console.log("Product ID:", product.id);
      console.log("Form data image value:", formData.image);
      console.log("Image field type:", typeof productData.image);
      console.log("Image field value:", productData.image);
      console.log("Attributes:", attributesArr);

      // Call the update API
      await productService.updateProduct(product.id, productData as any);
      
      success("Product updated successfully");
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating product:", error);
      console.error("Error response:", error.response?.data);
      console.error("Full error object:", error);
      
      let errorMessage = "Failed to update product";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
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
      sku: "",
      category: "",
      image: "",
    });
    setAttributeValues({});
    setImageFile(null);
    setImageUploadError("");
    setCategoryAttributes([]);
  };

  // Load category attributes when category changes
  useEffect(() => {
    if (formData.category && formData.category !== "") {
      // Note: You'll need to implement getCategoryAttributes in categoryService
      // For now, we'll just reset the attributes
      setCategoryAttributes([]);
    }
  }, [formData.category]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">
              SKU / Product Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              placeholder="Enter product code (SKU)"
              value={formData.sku || formData.code}
              onChange={handleInputChange("sku")}
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
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, category: value }));
                // Fetch category attributes when category changes
                const selectedCategory = categories.find(cat => cat.id === value);
                if (selectedCategory && categoriesWithAttributes.has(value)) {
                  setCategoryAttributes(categoriesWithAttributes.get(value) || []);
                } else {
                  setCategoryAttributes([]);
                }
              }}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <SelectItem value="no-categories" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {categories.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                No categories found. Please add categories first.
              </p>
            )}
          </div>

          {/* Render dynamic attribute fields */}
          {categoryAttributes.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Category Attributes</h4>
              {categoryAttributes
                .sort((a, b) => a.display_order - b.display_order)
                .map((attr) => (
                  <div key={attr.attribute_name}>
                    <Label htmlFor={`attr-${attr.attribute_name}`}>
                      {attr.attribute_name} {attr.is_required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id={`attr-${attr.attribute_name}`}
                      placeholder={`Enter ${attr.attribute_name}`}
                      value={attributeValues[attr.attribute_name] || ""}
                      onChange={(e) =>
                        handleAttributeValueChange(
                          attr.attribute_name,
                          e.target.value
                        )
                      }
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
                <p className="text-sm text-green-600 mb-1">
                  Image URL: {formData.image}
                </p>
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
                Weight (grams)
              </Label>
              <Input
                id="weight"
                type="text"
                placeholder="0"
                value={formData.weight ? formatNumber(formData.weight) : ""}
                onChange={handleInputChange("weight")}
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
              {isLoading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
