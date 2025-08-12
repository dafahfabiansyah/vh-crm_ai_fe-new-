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

import { uploadImageToS3, productService } from "@/services/productService";
import { useToast } from "@/hooks";
import type { Product } from "@/types";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string>("");

  const { success, error: showError } = useToast();

  // Utility function for formatting numbers
  const formatNumber = (value: number | string): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0";
    return num.toLocaleString("id-ID");
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    code: "",
    sku: "",
    image: "",
    status: "true", // "true" for active, "false" for inactive
  });

  // Initialize form data when product changes
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        code: product.code || product.sku || "",
        sku: product.sku || product.code || "",
        image: product.image_url || "", 
        status: (product as any).status !== undefined ? (product as any).status.toString() : "true",
      });
    }
  }, [product, isOpen]);

  // Handle input changes
  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: field === "price" || field === "stock"
        ? value.replace(/\D/g, "")
        : value,
    }));
  };

  // Handle status select change
  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
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
      // Prepare product data for API - based on Go struct UpdateProductRequest
      // UpdateProductRequest only supports: SKU, Name, Description, Stock, ImageURL, Price, Status
      const productData: any = {
        sku: formData.sku || formData.code,
        name: formData.name,
        description: formData.description || "",
        stock: formData.stock || "0",
        price: formData.price ? parseFloat(formData.price) : 0,
        status: formData.status === "true",
      };
      
      // Add image only if it exists (ImageURL field)
      if (formData.image) {
        productData.image = formData.image;
      }

      console.log("Updating product with data (UpdateProductRequest):", productData);
      console.log("Product ID:", product.id);
      console.log("Note: Attributes and category updates not supported in UpdateProductRequest");

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
      stock: "",
      code: "",
      sku: "",
      image: "",
      status: "true",
    });
    setImageFile(null);
    setImageUploadError("");
  };

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
                  Image URL: {formData.image}
                </p> */}
                <img
                  src={formData.image}
                  alt="Product Preview"
                  className="max-h-32 rounded border"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select product status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
