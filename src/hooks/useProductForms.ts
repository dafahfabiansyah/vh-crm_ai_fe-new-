import { useState, useCallback } from "react";
import { uploadImageToS3 } from "@/services/productService";
import { useToast } from "@/hooks";
import type { 
  Category, 
  CategoryFormData, 
  Product, 
  ProductFormData 
} from "@/types";

export const useProductForms = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string>("");

  const { success, error: showError } = useToast();

  // Product form data
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

  // Edit form data
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    code: "",
  });

  // Category form data
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    attributes: [],
  });

  // Edit category form data
  const [editCategoryFormData, setEditCategoryFormData] = useState({
    name: "",
    description: "",
  });

  // Selected states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState({
    open: false,
    category: null as Category | null,
  });

  // Utility function for formatting numbers
  const formatNumber = (value: number | string): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0";
    return num.toLocaleString("id-ID");
  };

  // Handle input changes for product form
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

  // Handle input changes for category form
  const handleCategoryInputChange = (field: keyof CategoryFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCategoryFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Handle input changes for edit category form
  const handleEditCategoryInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditCategoryFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  // Handle edit form changes
  const handleEditFormChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle attribute value changes
  const handleAttributeValueChange = (attributeName: string, value: string) => {
    setAttributeValues((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  // Image handling
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUploadError("");
    }
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;

    setIsUploadingImage(true);
    setImageUploadError("");

    try {
      const imageUrl = await uploadImageToS3(imageFile);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
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

  // Category attributes management
  const addAttribute = () => {
    setCategoryFormData((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        {
          id: `temp-${Date.now()}`, // Temporary ID for new attributes
          attribute_name: "",
          is_required: false,
          display_order: prev.attributes.length + 1,
          category_id: "",
          created_at: "",
          updated_at: "",
        },
      ],
    }));
  };

  const removeAttribute = (index: number) => {
    setCategoryFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  const updateAttribute = (index: number, field: string, value: any) => {
    setCategoryFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  // Reset functions
  const resetProductForm = useCallback(() => {
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
  }, []);

  const resetCategoryForm = useCallback(() => {
    setCategoryFormData({
      name: "",
      description: "",
      attributes: [],
    });
  }, []);

  return {
    // Modal states
    isModalOpen,
    setIsModalOpen,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isEditCategoryModalOpen,
    setIsEditCategoryModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    
    // Loading states
    isLoading,
    setIsLoading,
    isUploadingImage,
    imageUploadError,
    
    // Form data
    formData,
    setFormData,
    editForm,
    setEditForm,
    categoryFormData,
    setCategoryFormData,
    editCategoryFormData,
    setEditCategoryFormData,
    
    // Selected states
    selectedCategoryId,
    setSelectedCategoryId,
    categoryAttributes,
    setCategoryAttributes,
    attributeValues,
    setAttributeValues,
    deleteProduct,
    setDeleteProduct,
    editingCategory,
    setEditingCategory,
    deleteCategoryDialog,
    setDeleteCategoryDialog,
    
    // Image handling
    imageFile,
    setImageFile,
    handleImageFileChange,
    handleUploadImage,
    
    // Input handlers
    handleInputChange,
    handleCategoryInputChange,
    handleEditCategoryInputChange,
    handleEditFormChange,
    handleAttributeValueChange,
    
    // Attribute management
    addAttribute,
    removeAttribute,
    updateAttribute,
    
    // Reset functions
    resetProductForm,
    resetCategoryForm,
    
    // Utilities
    formatNumber,
  };
};
