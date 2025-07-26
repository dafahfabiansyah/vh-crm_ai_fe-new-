import React, { useState, useEffect } from "react";
import MainLayout from "@/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Plus, Search, Trash2, Package } from "lucide-react";
import { Link } from "react-router";
import {
  categoryService,
  productService,
  type CategoryAttribute,
  uploadImageToS3,
} from "@/services/productService";
import type {
  Category,
  CategoryFormData,
  Product,
  ProductFormData,
} from "@/types";
import ProductTable from "@/components/product-table";
import { AgentsService } from "@/services/agentsService";
import type { AIAgent } from "@/types";
import { KnowledgeService } from "@/services/knowledgeService";
import { Toast } from "@/components/ui/toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import ExistingKnowledgeList from "@/components/existing-knowledge-list";

// Utility function untuk format angka dengan pemisah ribuan
const formatNumber = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString("id-ID");
};

// Tambahkan type Product sesuai response baru
type ProductAPI = {
  id: string;
  id_category: string;
  category_name: string;
  sku: string;
  name: string;
  description: string;
  stock: string;
  price: number;
  status: boolean;
  attributes: null | Array<{
    id: string;
    id_category_attribute: string;
    attribute_name: string;
    value: string;
    created_at: string;
    updated_at: string;
  }>;
  created_at: string;
  updated_at: string;
};

const ProductPage = () => {
  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "addToAI" | "checkKnowledgeToAI"
  >("categories");
  // State untuk Add Product to AI
  const [aiAgents, setAIAgents] = useState<AIAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [addToAIError, setAddToAIError] = useState<string>("");
  const [addToAILoading, setAddToAILoading] = useState(false);
  const [addToAISuccess, setAddToAISuccess] = useState<string>("");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesWithAttributes, setCategoriesWithAttributes] = useState<
    Map<string, CategoryAttribute[]>
  >(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    weight: "",
    stock: "",
    colors: "",
    material: "",
    image: "",
    category: "",
    code: "",
  });

  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    attributes: [],
  });

  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttribute[]
  >([]);
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string>
  >({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [, setImageUploadUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string>("");

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    code: "",
    name: "",
    description: "",
    stock: "",
    price: "",
    image_url: "",
    status: true,
  });
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState<{
    open: boolean;
    targetId?: string;
  }>({ open: false });
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    description: string;
  } | null>(null);

  const handleInputChange =
    (field: keyof ProductFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      let value = e.target.value;

      // Format khusus untuk field numerik
      if (field === "price" || field === "stock" || field === "weight") {
        // Hapus semua karakter non-digit (termasuk titik pemisah ribuan)
        const numericValue = value.replace(/[^\d]/g, "");
        value = numericValue;
      }

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleCategoryInputChange =
    (field: keyof CategoryFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCategoryFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const addAttribute = () => {
    setCategoryFormData((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        {
          id: Math.random().toString(36).substring(2, 15),
          attribute_name: "",
          is_required: false,
          display_order: prev.attributes.length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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

  const updateAttribute = (
    index: number,
    field: keyof CategoryAttribute,
    value: string | boolean
  ) => {
    setCategoryFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      ),
    }));
  };

  const handleCategoryChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const catId = e.target.value;
    setFormData((prev) => ({ ...prev, category: catId }));
    setSelectedCategoryId(catId);
    setCategoryAttributes([]);
    setAttributeValues({});
    if (catId) {
      try {
        const detail = await categoryService.getCategoryById(catId);
        if (detail.attributes && Array.isArray(detail.attributes)) {
          setCategoryAttributes(detail.attributes);
          // Inisialisasi attributeValues kosong
          const attrInit: Record<string, string> = {};
          detail.attributes.forEach((attr) => {
            attrInit[attr.attribute_name] = "";
          });
          setAttributeValues(attrInit);
        }
      } catch (err) {
        setCategoryAttributes([]);
        setAttributeValues({});
      }
    }
  };

  const handleAttributeValueChange = (attributeName: string, value: string) => {
    setAttributeValues((prev) => ({ ...prev, [attributeName]: value }));
  };

  // Handler untuk file input
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUploadError("");
    }
  };

  // Handler upload image
  const handleUploadImage = async () => {
    if (!imageFile) return;
    setIsUploadingImage(true);
    setImageUploadError("");
    try {
      const res = await uploadImageToS3(imageFile);
      setImageUploadUrl(res.url);
      setFormData((prev) => ({ ...prev, image: res.url }));
    } catch (err: any) {
      setImageUploadError(err?.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Siapkan attributes array
      const attributesArr = categoryAttributes.map((attr) => ({
        id_category_attribute: attr.id,
        value: attributeValues[attr.attribute_name] || "",
      }));
      // Siapkan request body
      const productData = {
        id_category: selectedCategoryId,
        sku: formData.code || "", // SKU dari form
        name: formData.name,
        description: formData.description,
        stock: formData.stock,
        price: parseFloat(formData.price),
        status: true,
        attributes: attributesArr,
        image: formData.image, // <-- kirim image ke backend
      };
      // API call
      const response = await productService.createProduct(productData as any);

      // console.log("Created product response:", response);

      // Create local product object
      const newProduct: Product = {
        id: response.id,
        code: response.code,
        sku: response.sku,
        name: response.name,
        description: response.description,
        price: response.price,
        weight: response.weight,
        stock: response.stock,
        image_url: response.image_url,
        colors: response.colors,
        material: response.material,
        image: response.image, // <-- mapping image dari response
        category_name: response.category,
        created_at: response.created_at,
        updated_at: response.updated_at,
      };

      setProducts((prev) => [...prev, newProduct]);
      setIsModalOpen(false);

      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        weight: "",
        stock: "",
        colors: "",
        material: "",
        image: "",
        category: "",
        code: "",
      });
      setCategoryAttributes([]);
      setAttributeValues({});
      setSelectedCategoryId("");
      setImageFile(null);
      setImageUploadUrl("");
      setImageUploadError("");
    } catch (error: any) {
      console.error("Error creating product:", error);
      alert(`Failed to create product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryFormData.name) {
      setToast({
        show: true,
        type: "error",
        title: "Form Tidak Lengkap",
        description: "Please enter a category name",
      });
      return;
    }

    console.log("Form data before submit:", categoryFormData);

    setIsLoading(true);

    try {
      // API call to create category using service
      const response = await categoryService.createCategory({
        name: categoryFormData.name,
        description: categoryFormData.description,
        attributes: categoryFormData.attributes,
      });

      console.log("Created category response:", response);

      // Create local category object
      const newCategory: Category = {
        id: response.id,
        name: categoryFormData.name,
        description: categoryFormData.description,
        created_at: response.created_at || new Date().toISOString(),
        updated_at: response.updated_at || new Date().toISOString(),
      };

      // Store the attributes for this category
      if (categoryFormData.attributes.length > 0) {
        setCategoriesWithAttributes((prev) => {
          const newMap = new Map(prev);
          newMap.set(response.id, categoryFormData.attributes);
          return newMap;
        });
      }

      setCategories((prev) => [...prev, newCategory]);
      setIsCategoryModalOpen(false);

      // Reset form
      setCategoryFormData({
        name: "",
        description: "",
        attributes: [],
      });
      setToast({
        show: true,
        type: "success",
        title: "Category Created",
        description: "Category created successfully.",
      });
    } catch (error: any) {
      console.error("Error creating category:", error);
      setToast({
        show: true,
        type: "error",
        title: "Create Failed",
        description: error.message || "Failed to create category.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete category function
  const handleDeleteCategory = (categoryId: string) => {
    setDeleteCategoryDialog({ open: true, targetId: categoryId });
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryDialog.targetId) return;
    try {
      setIsLoading(true);
      await categoryService.deleteCategory(deleteCategoryDialog.targetId);
      setCategories((prev) =>
        prev.filter((category) => category.id !== deleteCategoryDialog.targetId)
      );
      setCategoriesWithAttributes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(deleteCategoryDialog.targetId!);
        return newMap;
      });
      setToast({
        show: true,
        type: "success",
        title: "Category Deleted",
        description: "Category deleted successfully.",
      });
    } catch (error: any) {
      setToast({
        show: true,
        type: "error",
        title: "Delete Failed",
        description: error.message || "Failed to delete category.",
      });
    } finally {
      setIsLoading(false);
      setDeleteCategoryDialog({ open: false });
    }
  };

  const handleEditClick = (product: Product) => {
    setEditProduct(product);
    setEditForm({
      code: product.sku || product.code || "", // Prioritaskan SKU
      name: product.name || "",
      description: product.description || "",
      stock: String(product.stock ?? ""),
      price: String(product.price ?? ""),
      image_url: product.image_url || "",
      status: (product as any).status !== false, // fallback for status, if available
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setIsEditLoading(true);
    try {
      const updatePayload: any = {
        sku: editForm.code, // send as sku
        name: editForm.name,
        description: editForm.description,
        stock: editForm.stock, // string
        price: parseFloat(editForm.price), // float
        status: editForm.status, // boolean
        image: editForm.image_url, // <-- gunakan key 'image' sesuai backend
      };
      
      console.log('Updating product with payload:', updatePayload);
      
      const updated = await productService.updateProduct(
        editProduct.id,
        updatePayload
      );
      
      console.log('API response after update:', updated);
      
      // Re-fetch products untuk memastikan data terbaru
      await fetchProducts();
      
      setIsEditModalOpen(false);
      setEditProduct(null);
    } catch (err: any) {
      alert("Failed to update product: " + (err?.message || "Unknown error"));
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleViewClick = (product: Product) => {
    setViewProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    const product = products.find((p) => p.id === productId) || null;
    setDeleteProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteProduct) return;
    setIsDeleteLoading(true);
    try {
      await productService.deleteProduct(deleteProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
      setIsDeleteModalOpen(false);
      setDeleteProduct(null);
    } catch (err: any) {
      alert("Failed to delete product: " + (err?.message || "Unknown error"));
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Handler untuk upload produk ke AI
  const handleAddProductsToAI = async () => {
    if (!selectedAgentId || selectedProductIds.length === 0) return;
    setAddToAILoading(true);
    setAddToAIError("");
    setAddToAISuccess("");
    try {
      // Ambil produk yang dipilih
      const selectedProducts = products.filter((p) =>
        selectedProductIds.includes(p.id)
      );
      // Upload satu per satu (bisa dioptimasi parallel jika mau)
      for (const product of selectedProducts) {
        await KnowledgeService.createProductKnowledge(
          selectedAgentId,
          product.name,
          product.description || `Product Knowledge for ${product.name}`,
          product.id
        );
      }
      setAddToAISuccess("Products successfully added to AI agent.");
      setSelectedProductIds([]);
    } catch (err: any) {
      setAddToAIError(err?.message || "Failed to add products to AI agent");
    } finally {
      setAddToAILoading(false);
    }
  };

  // Fetch categories on component mount
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await categoryService.getCategories();
      console.log("Categories fetched:", categoriesData);

      // Transform API response to local Category interface
      const transformedCategories: Category[] = categoriesData.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        created_at: cat.created_at,
        updated_at: cat.updated_at,
      }));

      // Store category attributes in Map for quick lookup
      const attributesMap = new Map<string, CategoryAttribute[]>();
      categoriesData.forEach((cat) => {
        if (cat.attributes && cat.attributes.length > 0) {
          attributesMap.set(cat.id, cat.attributes);
        }
      });

      setCategories(transformedCategories);
      setCategoriesWithAttributes(attributesMap);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      // Don't show alert for fetch errors, just log them
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products on component mount
  const fetchProducts = async () => {
    try {
      // Ambil response.items
      const response = await productService.getProducts();
      let productsData: ProductAPI[] = [];
      if (Array.isArray(response)) {
        // fallback lama
        productsData = response as any;
      } else if (response) {
        productsData = response;
      }
      // Transform ke state
      setProducts(productsData as any);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      // Don't show alert for fetch errors, just log them
    }
  };

  // Filter products by selected category for Add Product to AI tab
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );
  const filteredProducts: Product[] =
    !selectedCategoryId || selectedCategoryId === "all"
      ? products
      : selectedCategory
      ? products.filter(
          (p: Product) => p.category_name === selectedCategory.name
        )
      : products;

  // Fetch AI agents saat tab Add Product to AI aktif
  useEffect(() => {
    if (activeTab === "addToAI") {
      setIsLoadingAgents(true);
      AgentsService.getAgents()
        .then((agents) => {
          setAIAgents(agents);
          if (agents.length > 0) setSelectedAgentId(agents[0].id);
        })
        .catch((err) => {
          setAddToAIError(err?.message || "Failed to fetch AI agents");
        })
        .finally(() => setIsLoadingAgents(false));
    }
  }, [activeTab]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (addToAISuccess) {
      const timer = setTimeout(() => setAddToAISuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [addToAISuccess]);
  const totalCategories = categories.length;

  // Filter functions
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-4 md:p-6 max-w-full mx-auto w-full">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2 md:gap-0">
            <div className="flex items-center gap-4">
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.back();
                }}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            </div>

            <Button
              onClick={() =>
                activeTab === "products"
                  ? setIsModalOpen(true)
                  : setIsCategoryModalOpen(true)
              }
              disabled={activeTab === "products" && categories.length === 0}
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "products" ? "Add Product" : "Add Category"}
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Package className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Product & Category Management
            </h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-wrap gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[120px] ${
                activeTab === "categories"
                  ? "bg-white text- shadow-sm"
                  : "hover:text-gray-900"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("products")}
              disabled={categories.length === 0}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[120px] ${
                activeTab === "products"
                  ? "bg-white shadow-sm"
                  : categories.length === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("addToAI")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[120px] ${
                activeTab === "addToAI"
                  ? "bg-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Add Product to AI
            </button>
            <button
              onClick={() => setActiveTab("checkKnowledgeToAI")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[120px] ${
                activeTab === "checkKnowledgeToAI"
                  ? "bg-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Check Knowledge to AI
            </button>
          </div>
          {categories.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Create at least one category before adding products
            </p>
          )}
        </div>

        {/* Categories Tab Content */}
        {activeTab === "categories" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <Card className="rounded-lg shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Categories</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalCategories}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {products.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="mb-4 md:mb-6 rounded-lg shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search categories by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories Table */}
            <Card className="rounded-lg shadow-sm">
              <CardHeader>
                <CardTitle>Categories ({categories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No categories found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Create your first category to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 px-2 md:px-4 py-2 md:py-3 bg-gray-50 rounded-lg text-xs md:text-sm font-medium text-gray-700">
                      <div>Name & Description</div>
                      <div>Created</div>
                      <div>Updated</div>
                      <div>Actions</div>
                    </div>

                    {/* Categories Accordion */}
                    <Accordion type="single" collapsible className="w-full">
                      {filteredCategories.map((category) => {
                        const attributes =
                          categoriesWithAttributes.get(category.id) || [];

                        return (
                          <AccordionItem
                            key={category.id}
                            value={category.id}
                            className="border rounded-lg shadow-sm"
                          >
                            <AccordionTrigger className="hover:no-underline px-2 md:px-4">
                              <div className="flex items-center justify-between w-full pr-2 md:pr-4">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 flex-1 text-left">
                                  <div>
                                    <div className="font-medium">
                                      {category.name}
                                    </div>
                                    <div className="text-xs md:text-sm text-gray-600">
                                      {category.description || "-"}
                                    </div>
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-500">
                                    {new Date(
                                      category.created_at
                                    ).toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </div>
                                  <div className="text-xs md:text-sm text-gray-500">
                                    {new Date(
                                      category.updated_at
                                    ).toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCategory(category.id);
                                      }}
                                      disabled={isLoading}
                                      className="w-full md:w-auto"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="px-2 md:px-4 pb-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <h4 className="font-medium text-xs md:text-sm">
                                    Category Attributes
                                  </h4>
                                  <Badge variant="outline" className="text-xs">
                                    {attributes.length} attribute
                                    {attributes.length !== 1 ? "s" : ""}
                                  </Badge>
                                </div>
                                {attributes.length === 0 ? (
                                  <div className="text-xs md:text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                                    No attributes defined for this category
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {attributes
                                      .sort(
                                        (a, b) =>
                                          a.display_order - b.display_order
                                      )
                                      .map((attribute, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div>
                                              <div className="font-medium text-xs md:text-sm">
                                                {attribute.attribute_name}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                Display Order:{" "}
                                                {attribute.display_order}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {attribute.is_required && (
                                              <Badge
                                                variant="destructive"
                                                className="text-xs"
                                              >
                                                Required
                                              </Badge>
                                            )}
                                            {!attribute.is_required && (
                                              <Badge
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                Optional
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Products Tab Content */}
        {activeTab === "products" && (
          <div className="overflow-x-auto rounded-lg shadow-sm bg-white">
            <ProductTable
              products={products}
              categories={categories}
              categoriesWithAttributes={categoriesWithAttributes}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onView={handleViewClick}
            />
          </div>
        )}

        {/* Add Product to AI Tab Content */}
        {activeTab === "addToAI" && (
          <Card className="rounded-lg shadow-sm">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">
                Add Product to AI
              </h2>
              {/* Select AI Agent & Filter by Category */}
              <div className="mb-4 flex flex-col md:flex-row md:items-end md:gap-4 gap-4">
                <div className="flex-1 min-w-0">
                  <label className="block mb-2 font-medium text-xs md:text-sm">
                    Select AI Agent
                  </label>
                  {isLoadingAgents ? (
                    <div className="text-gray-500">Loading agents...</div>
                  ) : addToAIError ? (
                    <div className="text-red-500">{addToAIError}</div>
                  ) : (
                    <Select
                      value={selectedAgentId}
                      onValueChange={setSelectedAgentId}
                      disabled={isLoadingAgents || aiAgents.length === 0}
                    >
                      <SelectTrigger className="w-full max-w-full md:max-w-md">
                        <SelectValue
                          placeholder={
                            aiAgents.length === 0
                              ? "No AI agent found"
                              : "Select AI agent"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {aiAgents.length === 0 ? (
                          <SelectItem value="" disabled>
                            No AI agent found
                          </SelectItem>
                        ) : (
                          aiAgents.map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block mb-2 font-medium text-xs md:text-sm">
                    Filter by Category
                  </label>
                  <Select
                    value={selectedCategoryId || "all"}
                    onValueChange={setSelectedCategoryId}
                  >
                    <SelectTrigger className="w-full max-w-full md:max-w-md">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Product Table with Checkbox */}
              {addToAILoading && (
                <div className="flex justify-center items-center py-4">
                  <svg
                    className="animate-spin h-6 w-6 text-blue-600 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span className="text-blue-600 font-medium">
                    Uploading products to AI...
                  </span>
                </div>
              )}
              {/* Table (desktop/tablet) */}
              <div className="overflow-x-auto mb-4 rounded-lg shadow-sm hidden sm:block">
                <table className="min-w-full bg-white border rounded-lg text-xs md:text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 md:p-3 text-left font-bold">
                        <Checkbox
                          checked={
                            selectedProductIds.length ===
                              filteredProducts.length &&
                            filteredProducts.length > 0
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProductIds(
                                filteredProducts.map((p) => p.id)
                              );
                            } else {
                              setSelectedProductIds([]);
                            }
                          }}
                          aria-label="Select all products"
                        />
                      </th>
                      <th className="p-2 md:p-3 text-left font-bold">Image</th>
                      <th className="p-2 md:p-3 text-left font-bold">Name</th>
                      <th className="p-2 md:p-3 text-left font-bold">SKU</th>
                      <th className="p-2 md:p-3 text-left font-bold">
                        Category
                      </th>
                      <th className="p-2 md:p-3 text-left font-bold">Stock</th>
                      <th className="p-2 md:p-3 text-left font-bold">Price</th>
                      <th className="p-2 md:p-3 text-left font-bold">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-6 text-gray-500"
                        >
                          No products found
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product: Product) => (
                        <tr
                          key={product.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-2 md:p-3">
                            <Checkbox
                              checked={selectedProductIds.includes(product.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedProductIds((prev) => [
                                    ...prev,
                                    product.id,
                                  ]);
                                } else {
                                  setSelectedProductIds((prev) =>
                                    prev.filter((id) => id !== product.id)
                                  );
                                }
                              }}
                              aria-label={`Select product ${product.name}`}
                            />
                          </td>
                          <td className="p-2 md:p-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-10 w-10 md:h-12 md:w-12 object-cover rounded border"
                              />
                            ) : (
                              <div className="h-10 w-10 md:h-12 md:w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                -
                              </div>
                            )}
                          </td>
                          <td className="p-2 md:p-3 font-medium">
                            {product.name}
                          </td>
                          <td className="p-2 md:p-3">
                            {product.sku || product.code || "-"}
                          </td>
                          <td className="p-2 md:p-3">
                            {product.category_name || "-"}
                          </td>
                          <td className="p-2 md:p-3">{product.stock ?? "-"}</td>
                          <td className="p-2 md:p-3">
                            {formatNumber(product.price)}
                          </td>
                          <td className="p-2 md:p-3 text-gray-600 text-xs md:text-sm">
                            {product.description || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Card List (mobile) */}
              <div className="block sm:hidden space-y-4 mb-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center text-gray-500 py-6">
                    No products found
                  </div>
                ) : (
                  filteredProducts.map((product: Product) => (
                    <Card key={product.id} className="rounded-lg shadow-sm">
                      <CardContent className="flex gap-3 p-4 items-start">
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProductIds((prev) => [
                                ...prev,
                                product.id,
                              ]);
                            } else {
                              setSelectedProductIds((prev) =>
                                prev.filter((id) => id !== product.id)
                              );
                            }
                          }}
                          aria-label={`Select product ${product.name}`}
                          className="mt-1"
                        />
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-14 w-14 object-cover rounded border"
                          />
                        ) : (
                          <div className="h-14 w-14 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                            -
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            SKU: {product.sku || product.code || "-"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {product.category_name || "-"}
                          </div>
                          <div className="text-sm mt-1 line-clamp-2">
                            {product.description || "-"}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="secondary">
                              Rp {formatNumber(product.price)}
                            </Badge>
                            <Badge variant="outline">
                              Stok: {product.stock}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <Button
                className="w-full md:w-auto"
                disabled={
                  selectedProductIds.length === 0 ||
                  !selectedAgentId ||
                  addToAILoading
                }
                onClick={handleAddProductsToAI}
              >
                {addToAILoading ? "Adding..." : "Add Selected Products to AI"}
              </Button>
              {/* Toast Success Bottom Left */}
              {addToAISuccess && (
                <div className="fixed bottom-4 left-4 z-50 w-[90vw] max-w-xs md:max-w-sm">
                  <Toast
                    type="success"
                    title="Success"
                    description={addToAISuccess}
                  />
                </div>
              )}
              {addToAIError && (
                <div className="text-red-600 mt-2">{addToAIError}</div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Check Knowledge to AI Tab Content */}
        {activeTab === "checkKnowledgeToAI" && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Check Knowledge to AI</h2>
              <div className="mb-4 max-w-md">
                <label className="block mb-2 font-medium">
                  Select AI Agent
                </label>
                {isLoadingAgents ? (
                  <div className="text-gray-500">Loading agents...</div>
                ) : addToAIError ? (
                  <div className="text-red-500">{addToAIError}</div>
                ) : (
                  <Select
                    value={selectedAgentId}
                    onValueChange={setSelectedAgentId}
                    disabled={isLoadingAgents || aiAgents.length === 0}
                  >
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue
                        placeholder={
                          aiAgents.length === 0
                            ? "No AI agent found"
                            : "Select AI agent"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {aiAgents.length === 0 ? (
                        <SelectItem value="" disabled>
                          No AI agent found
                        </SelectItem>
                      ) : (
                        aiAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {selectedAgentId ? (
                <div className="mt-6">
                  {/* Daftar knowledge milik agent */}
                  <ExistingKnowledgeList agentId={selectedAgentId} />
                </div>
              ) : (
                <div className="text-gray-500 mt-8">
                  Pilih AI agent untuk melihat knowledge.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Category Modal */}
        <Dialog
          open={isCategoryModalOpen}
          onOpenChange={setIsCategoryModalOpen}
        >
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <Label htmlFor="categoryName">
                  Category Name <span className="text-red-500 py-2">*</span>
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
                <Label htmlFor="categoryDescription" className=" py-2">
                  Description
                </Label>
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
                        <Label
                          className=" py-2"
                          htmlFor={`attribute-name-${index}`}
                        >
                          Attribute Name
                        </Label>
                        <Input
                          id={`attribute-name-${index}`}
                          placeholder="e.g., Size, Color"
                          value={attribute.attribute_name}
                          onChange={(e) =>
                            updateAttribute(
                              index,
                              "attribute_name",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id={`attribute-required-${index}`}
                          checked={attribute.is_required}
                          onChange={(e) =>
                            updateAttribute(
                              index,
                              "is_required",
                              e.target.checked
                            )
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
                  onClick={() => setIsCategoryModalOpen(false)}
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

        {/* Create Product Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Product</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="py-2" htmlFor="code">
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
                <Label className="py-2" htmlFor="name">
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
                <Label className="py-2" htmlFor="description">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter Description"
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  rows={4}
                />
              </div>

              <div>
                <Label className="py-2" htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Render attribute fields dinamis */}
              {categoryAttributes.length > 0 && (
                <div className="space-y-4">
                  {categoryAttributes
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((attr) => (
                      <div key={attr.attribute_name}>
                        <Label
                          className="py-2"
                          htmlFor={`attr-${attr.attribute_name}`}
                        >
                          {attr.attribute_name}
                          {attr.is_required && (
                            <span className="text-red-500">*</span>
                          )}
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
                <Label className="py-2" htmlFor="image">
                  Product Image
                </Label>
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
                    {isUploadingImage ? "Uploading..." : "Upload Image"}
                  </Button>
                </div>
                {imageUploadError && (
                  <div className="text-red-500 text-sm mt-1">
                    {imageUploadError}
                  </div>
                )}
                {formData.image && (
                  <div className="mt-2">
                    <img
                      key={`create-${formData.image}-${Date.now()}`}
                      src={formData.image}
                      alt="Product Preview"
                      className="max-h-32 rounded border"
                    />
                    {/* <div className="text-xs text-gray-500 break-all">
                      {formData.image}
                    </div> */}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="py-2" htmlFor="price">
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
                  <Label className="py-2" htmlFor="weight">
                    Weight (grams) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="weight"
                      type="text"
                      placeholder="0"
                      value={
                        formData.weight ? formatNumber(formData.weight) : ""
                      }
                      onChange={handleInputChange("weight")}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="py-2" htmlFor="stock">
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
                  onClick={() => setIsModalOpen(false)}
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

        {/* Edit Product Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="w-full max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label>SKU / Product Code</Label>
                <Input
                  value={editForm.code}
                  onChange={(e) => handleEditFormChange("code", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => handleEditFormChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) =>
                    handleEditFormChange("description", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={editForm.stock}
                  onChange={(e) =>
                    handleEditFormChange("stock", e.target.value)
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Image</Label>
                {editForm.image_url ? (
                  <div>
                    <img
                      key={`edit-${editForm.image_url}-${Date.now()}`}
                      src={editForm.image_url}
                      alt="Product Preview"
                      className="max-h-32 rounded border mb-2"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleEditFormChange("image_url", "")}
                      className="mb-2"
                    >
                      Ganti Gambar
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                          setImageUploadError("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!imageFile) return;
                        setIsUploadingImage(true);
                        setImageUploadError("");
                        try {
                          const res = await uploadImageToS3(imageFile);
                          handleEditFormChange("image_url", res.url);
                          setImageFile(null);
                        } catch (err: any) {
                          setImageUploadError(
                            err?.message || "Failed to upload image"
                          );
                        } finally {
                          setIsUploadingImage(false);
                        }
                      }}
                      disabled={!imageFile || isUploadingImage}
                    >
                      {isUploadingImage ? "Uploading..." : "Upload Image"}
                    </Button>
                  </div>
                )}
                {imageUploadError && (
                  <div className="text-red-500 text-sm mt-1">
                    {imageUploadError}
                  </div>
                )}
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    handleEditFormChange("price", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  value={editForm.status ? "active" : "inactive"}
                  onChange={(e) =>
                    handleEditFormChange("status", e.target.value === "active")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditLoading}
                  className="flex-1"
                >
                  {isEditLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Product Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="w-full max-w-lg">
            <DialogHeader>
              <DialogTitle>Product Details</DialogTitle>
            </DialogHeader>
            {viewProduct && (
              <div className="space-y-4">
                <div>
                  <strong>SKU / Product Code:</strong>{" "}
                  {viewProduct.sku || viewProduct.code || "-"}
                </div>
                <div>
                  <strong>Name:</strong> {viewProduct.name}
                </div>
                <div>
                  <strong>Description:</strong> {viewProduct.description}
                </div>
                <div>
                  <strong>Image:</strong>
                  <div className="mt-2">
                    <img
                      src={viewProduct.image_url}
                      alt={viewProduct.name}
                      className="max-h-32 rounded border"
                    />
                  </div>
                </div>
                <div>
                  <strong>Stock:</strong> {viewProduct.stock}
                </div>
                <div>
                  <strong>Price:</strong> {viewProduct.price}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  {(viewProduct as any).status !== false
                    ? "Active"
                    : "Inactive"}
                </div>
                <div>
                  <strong>Category:</strong> {viewProduct.category_name}
                </div>
                <div>
                  <strong>Created At:</strong>{" "}
                  {viewProduct.created_at
                    ? new Date(viewProduct.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </div>
                <div>
                  <strong>Updated At:</strong>{" "}
                  {viewProduct.updated_at
                    ? new Date(viewProduct.updated_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </div>
                {viewProduct.image && (
                  <div>
                    <strong>Image:</strong>
                    <div className="mt-2">
                      <img
                        src={viewProduct.image}
                        alt={viewProduct.name}
                        className="max-h-32 rounded border"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Product Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
            </DialogHeader>
            {deleteProduct && (
              <div className="space-y-4">
                <p>
                  Are you sure you want to delete the product{" "}
                  <strong>{deleteProduct.name}</strong>?
                </p>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1"
                    disabled={isDeleteLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleConfirmDelete}
                    className="flex-1"
                    disabled={isDeleteLoading}
                  >
                    {isDeleteLoading ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Toast Notification */}
        {toast?.show && (
          <div className="mb-4">
            <Toast
              type={toast.type}
              title={toast.title}
              description={toast.description}
              onClose={() => setToast(null)}
            />
          </div>
        )}
        {/* Delete Category Confirmation Dialog */}
        <Dialog open={deleteCategoryDialog.open} onOpenChange={(open) => setDeleteCategoryDialog((prev) => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to delete this category? This action cannot be undone.</p>
              <div className="flex gap-2 justify-end">
                <Button variant="destructive" onClick={confirmDeleteCategory} disabled={isLoading}>
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setDeleteCategoryDialog({ open: false })} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default ProductPage;
