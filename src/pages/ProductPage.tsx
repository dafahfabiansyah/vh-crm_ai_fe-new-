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
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
} from "lucide-react";
import { Link } from "react-router";
import {
  categoryService,
  productService,
  type CategoryAttribute,
} from "@/services/productService";
import type {
  Category,
  CategoryFormData,
  Product,
  ProductFormData,
} from "@/types";
// import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState<"products" | "categories">(
    "categories"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesWithAttributes, setCategoriesWithAttributes] = useState<Map<string, CategoryAttribute[]>>(new Map());
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

  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const handleInputChange =
    (field: keyof ProductFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
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

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
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
          detail.attributes.forEach(attr => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Siapkan attributes array
      const attributesArr = categoryAttributes.map(attr => ({
        id_category_attribute: attr.id,
        value: attributeValues[attr.attribute_name] || ""
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
        attributes: attributesArr
      };
      // API call
      const response = await productService.createProduct(productData as any);

      console.log("Created product response:", response);

      // Create local product object
      const newProduct: Product = {
        id: response.id,
        code: response.code,
        name: response.name,
        description: response.description,
        price: response.price,
        weight: response.weight,
        stock: response.stock,
        colors: response.colors,
        material: response.material,
        image: response.image,
        category: response.category,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
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
      alert("Please enter a category name");
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
        setCategoriesWithAttributes(prev => {
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
    } catch (error: any) {
      console.error("Error creating category:", error);
      alert(`Failed to create category: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete category function
  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);

      // API call to delete category using service
      await categoryService.deleteCategory(categoryId);

      console.log(`Category ${categoryId} deleted successfully`);

      // Remove from local state
      setCategories((prev) =>
        prev.filter((category) => category.id !== categoryId)
      );

      // Remove attributes from map
      setCategoriesWithAttributes(prev => {
        const newMap = new Map(prev);
        newMap.delete(categoryId);
        return newMap;
      });

      // Show success message
      alert("Category deleted successfully");
    } catch (error: any) {
      console.error("Error deleting category:", error);
      alert(`Failed to delete category: ${error.message}`);
    } finally {
      setIsLoading(false);
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
      } else if (response ) {
        productsData = response;
      }
      // Transform ke state
      setProducts(productsData as any);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      // Don't show alert for fetch errors, just log them
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );

  // Filter functions
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
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
            >
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "products" ? "Add Product" : "Add Category"}
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Package className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Product & Category Management
            </h1>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "categories"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("products")}
              disabled={categories.length === 0}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "products"
                  ? "bg-white text-blue-600 shadow-sm"
                  : categories.length === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Products
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
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

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalProducts}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search categories by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories Table */}
            <Card>
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
                    <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                      <div>Name & Description</div>
                      <div>Created</div>
                      <div>Updated</div>
                      <div>Actions</div>
                    </div>
                    
                    {/* Categories Accordion */}
                    <Accordion type="single" collapsible className="w-full">
                      {filteredCategories.map((category) => {
                        const attributes = categoriesWithAttributes.get(category.id) || [];
                        
                        return (
                          <AccordionItem key={category.id} value={category.id} className="border rounded-lg">
                            <AccordionTrigger className="hover:no-underline px-4">
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="grid grid-cols-4 gap-4 flex-1 text-left">
                                  <div>
                                    <div className="font-medium">{category.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {category.description || "-"}
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(category.created_at).toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(category.updated_at).toLocaleDateString("id-ID", {
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
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="px-4 pb-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <h4 className="font-medium text-sm">Category Attributes</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {attributes.length} attribute{attributes.length !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                {attributes.length === 0 ? (
                                  <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                                    No attributes defined for this category
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {attributes
                                      .sort((a, b) => a.display_order - b.display_order)
                                      .map((attribute, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div>
                                              <div className="font-medium text-sm">
                                                {attribute.attribute_name}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                Display Order: {attribute.display_order}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {attribute.is_required && (
                                              <Badge variant="destructive" className="text-xs">
                                                Required
                                              </Badge>
                                            )}
                                            {!attribute.is_required && (
                                              <Badge variant="secondary" className="text-xs">
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
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalProducts}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Total Inventory Value
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        Rp {totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Package className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalCategories}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products by name, code, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Products ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No products found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Create your first product to get started
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">SKU</th>
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Description</th>
                          <th className="text-left py-3 px-4">Category</th>
                          <th className="text-left py-3 px-4">Price</th>
                          <th className="text-left py-3 px-4">Stock</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Attributes</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product: any) => (
                          <tr
                            key={product.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <Badge variant="outline">{product.sku}</Badge>
                            </td>
                            <td className="py-3 px-4">{product.name}</td>
                            <td className="py-3 px-4">{product.description}</td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">{product.category_name}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium">
                                Rp {Number(product.price).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">{product.stock}</td>
                            <td className="py-3 px-4">
                              <Badge variant={product.status ? "default" : "destructive"}>
                                {product.status ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {Array.isArray(product.attributes) && product.attributes.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {product.attributes.map((attr: any) => (
                                    <Badge key={attr.id} variant="outline" className="text-xs">
                                      {attr.attribute_name}: {attr.value}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
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
                <Label className="py-2" htmlFor="description">Description</Label>
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
                        <Label className="py-2" htmlFor={`attr-${attr.attribute_name}`}>{attr.attribute_name}{attr.is_required && <span className="text-red-500">*</span>}</Label>
                        <Input
                          id={`attr-${attr.attribute_name}`}
                          placeholder={`Enter ${attr.attribute_name}`}
                          value={attributeValues[attr.attribute_name] || ""}
                          onChange={e => handleAttributeValueChange(attr.attribute_name, e.target.value)}
                          required={attr.is_required}
                        />
                      </div>
                    ))}
                </div>
              )}

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
                      type="number"
                      placeholder="0"
                      value={formData.price}
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
                      type="number"
                      placeholder="0"
                      value={formData.weight}
                      onChange={handleInputChange("weight")}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      grams
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="py-2" htmlFor="stock">
                    Stock <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock}
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
      </div>
    </MainLayout>
  );
};

export default ProductPage;
