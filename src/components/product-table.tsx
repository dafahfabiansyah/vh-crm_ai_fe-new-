import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, Eye, Package } from "lucide-react";
import type { Category, Product } from "@/types";
import type { CategoryAttribute } from "@/services/productService";

// Utility function untuk format angka dengan pemisah ribuan
const formatNumber = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString("id-ID");
};

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  categoriesWithAttributes: Map<string, CategoryAttribute[]>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onView?: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories,
  categoriesWithAttributes,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  onView,
}) => {
  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      (product.name?.toLowerCase?.() || "").includes(searchTerm.toLowerCase()) ||
      (product.code?.toLowerCase?.() || "").includes(searchTerm.toLowerCase()) ||
      (product.category?.toLowerCase?.() || "").includes(searchTerm.toLowerCase())
  );

  return (
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
                  {products.length}
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
                <p className="text-sm text-gray-600">Total Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {formatNumber(products.reduce((sum, product) => sum + product.price * product.stock, 0))}
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
                  {categories.length}
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
                onChange={(e) => onSearchChange(e.target.value)}
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
                    <th className="text-left py-3 px-4">Image</th>
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
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 object-cover rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{product.sku}</Badge>
                      </td>
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4">{product.description}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">
                          {product.description}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">
                          Rp {formatNumber(Number(product.price))}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {formatNumber(product.stock)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            product.status ? "default" : "destructive"
                          }
                        >
                          {product.status ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {Array.isArray(product.attributes) &&
                        product.attributes.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {product.attributes.map((attr: any) => {
                              const attrName =
                                categoriesWithAttributes
                                  .get(
                                    product.id_category ||
                                      product.category
                                  )
                                  ?.find(
                                    (a) =>
                                      a.id === attr.id_category_attribute
                                  )?.attribute_name ||
                                attr.id_category_attribute;
                              return (
                                <Badge
                                  key={attr.id_category_attribute}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {attrName}: {attr.value}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onView?.(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onEdit?.(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onDelete?.(product.id)}
                          >
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
  );
};

export default ProductTable;
