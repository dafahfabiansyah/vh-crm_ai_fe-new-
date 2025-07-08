import React, { useState } from "react";
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
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
} from "lucide-react";
import { Link } from "react-router";

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  stock: number;
  colors: string[];
  material: string;
  image: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  weight: string;
  stock: string;
  colors: string;
  material: string;
  image: string;
  category: string;
}

interface CategoryAttribute {
  attribute_name: string;
  is_required: boolean;
  display_order: number;
}

interface CategoryFormData {
  name: string;
  description: string;
  attributes: CategoryAttribute[];
}

const initialProducts: Product[] = [];

const initialCategories: Category[] = [];

const ProductPage = () => {
  const [activeTab, setActiveTab] = useState<"products" | "categories">(
    "categories"
  );
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
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
  });

  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    attributes: [],
  });

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
          attribute_name: "",
          is_required: false,
          display_order: prev.attributes.length + 1,
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

  const generateProductCode = (category: string) => {
    const prefix = category.substring(0, 2).toUpperCase();
    const existingCodes = products
      .filter((p) => p.code.startsWith(prefix))
      .map((p) => parseInt(p.code.split("-")[1]));
    const nextNumber = Math.max(...existingCodes, 0) + 1;
    return `${prefix}-${nextNumber.toString().padStart(3, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.price ||
      !formData.weight ||
      !formData.stock ||
      !formData.category
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newProduct: Product = {
        id: Date.now().toString(),
        code: generateProductCode(formData.category),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        weight: parseFloat(formData.weight),
        stock: parseInt(formData.stock),
        colors: formData.colors
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c),
        material: formData.material,
        image:
          formData.image || "https://via.placeholder.com/300x300?text=No+Image",
        category: formData.category,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
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
      });
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
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

    setIsLoading(true);

    try {
      // API call to create category
      const response = await fetch("/v1/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryFormData.name,
          description: categoryFormData.description,
          attributes: categoryFormData.attributes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const apiCategory = await response.json();

      // Create local category object
      const newCategory: Category = {
        id: apiCategory.id || Date.now().toString(),
        name: categoryFormData.name,
        description: categoryFormData.description,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      setCategories((prev) => [...prev, newCategory]);
      setIsCategoryModalOpen(false);

      // Reset form
      setCategoryFormData({
        name: "",
        description: "",
        attributes: [],
      });
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

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

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
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
                <CardTitle>Categories ({filteredCategories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No categories found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Create your first category to get started
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Description</th>
                          <th className="text-left py-3 px-4">Products</th>
                          <th className="text-left py-3 px-4">Created</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCategories.map((category) => (
                          <tr
                            key={category.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium">{category.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-600">
                                {category.description || "-"}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">
                                {
                                  products.filter(
                                    (p) => p.category === category.name
                                  ).length
                                }{" "}
                                items
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-500">
                                {category.createdAt}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
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
                <CardTitle>Products ({filteredProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredProducts.length === 0 ? (
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
                          <th className="text-left py-3 px-4">Image</th>
                          <th className="text-left py-3 px-4">Code</th>
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">Category</th>
                          <th className="text-left py-3 px-4">Price</th>
                          <th className="text-left py-3 px-4">Stock</th>
                          <th className="text-left py-3 px-4">Weight</th>
                          <th className="text-left py-3 px-4">Colors</th>
                          <th className="text-left py-3 px-4">Material</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr
                            key={product.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://via.placeholder.com/48x48?text=No+Image";
                                }}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline">{product.code}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                  {product.description}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary">
                                {product.category}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium">
                                Rp {product.price.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  product.stock > 0 ? "default" : "destructive"
                                }
                              >
                                {product.stock} pcs
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm">{product.weight}g</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1">
                                {product.colors
                                  .slice(0, 2)
                                  .map((color, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {color}
                                    </Badge>
                                  ))}
                                {product.colors.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{product.colors.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm">
                                {product.material}
                              </span>
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
                <Label htmlFor="categoryDescription" className=" py-2">Description</Label>
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
                        <Label className=" py-2" htmlFor={`attribute-name-${index}`}>
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
                  <Label htmlFor="weight">
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
                  <Label htmlFor="stock">
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

              <div>
                <Label htmlFor="colors">Colors</Label>
                <Input
                  id="colors"
                  placeholder="Enter colors separated by commas (e.g., Red, Blue, Green)"
                  value={formData.colors}
                  onChange={handleInputChange("colors")}
                />
              </div>

              <div>
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  placeholder="Enter material (e.g., Cotton, Polyester, Linen)"
                  value={formData.material}
                  onChange={handleInputChange("material")}
                />
              </div>

              <div>
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange("category")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="Enter image URL"
                  value={formData.image}
                  onChange={handleInputChange("image")}
                />
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
