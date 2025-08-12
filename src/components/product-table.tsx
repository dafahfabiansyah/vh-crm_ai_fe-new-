import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Eye, Package } from "lucide-react";
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
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories,
  categoriesWithAttributes,
  searchTerm,
  onEdit,
  onDelete,
}) => {
  // State untuk force refresh gambar per product
  const [refreshKeys, setRefreshKeys] = useState<Record<string, number>>({});
  
  // State untuk image modal
  const [imageModal, setImageModal] = useState<{
    open: boolean;
    imageUrl: string;
    productName: string;
  }>({
    open: false,
    imageUrl: "",
    productName: "",
  });

  // Handler untuk membuka image modal
  const handleImageClick = (imageUrl: string, productName: string) => {
    setImageModal({
      open: true,
      imageUrl,
      productName,
    });
  };

  // Handler untuk menutup image modal
  const handleCloseImageModal = () => {
    setImageModal({
      open: false,
      imageUrl: "",
      productName: "",
    });
  };
  
  // Force refresh gambar hanya untuk product yang berubah
  useEffect(() => {
    const newRefreshKeys: Record<string, number> = {};
    products.forEach(product => {
      const currentKey = refreshKeys[product.id] || 0;
      const currentTimestampKey = `${product.id}_timestamp`;
      
      if (product.updated_at || product.created_at) {
        // Prioritaskan updated_at, fallback ke created_at
        const timestamp = new Date(product.updated_at || product.created_at).getTime();
        const lastTimestamp = refreshKeys[currentTimestampKey] || 0;
        
        // Jika ini produk baru (tidak ada refreshKey sebelumnya) atau timestamp berubah
        if (!(product.id in refreshKeys) || timestamp > lastTimestamp) {
          newRefreshKeys[product.id] = currentKey + 1;
          newRefreshKeys[currentTimestampKey] = timestamp;
        } else {
          newRefreshKeys[product.id] = currentKey;
          newRefreshKeys[currentTimestampKey] = lastTimestamp;
        }
      } else {
        // Untuk produk tanpa timestamp, berikan refreshKey default
        if (!(product.id in refreshKeys)) {
          newRefreshKeys[product.id] = 1;
        } else {
          newRefreshKeys[product.id] = currentKey;
        }
      }
    });
    
    // Hanya update jika ada perubahan untuk mencegah infinite loop
    const hasChanges = Object.keys(newRefreshKeys).some(key => 
      newRefreshKeys[key] !== refreshKeys[key]
    );
    
    if (hasChanges || Object.keys(refreshKeys).length === 0) {
      setRefreshKeys(newRefreshKeys);
    }
  }, [products]); // Hapus refreshKeys dari dependency array
  
  const filteredProducts = products.filter((product) =>
    (product.name?.toLowerCase?.() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 m-4">
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

      {/* Search and Filter
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
      </Card> */}

      {/* Products Table (desktop/tablet) */}
      <div className="hidden sm:block m-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Attributes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.image_url || product.image ? (
                    <img
                      key={`${product.id}-${product.updated_at}-${refreshKeys[product.id] || 0}`}
                      src={`${product.image_url || product.image}?v=${refreshKeys[product.id] || 0}`}
                      alt={product.name}
                      className="h-10 w-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleImageClick(product.image_url || product.image, product.name)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{product.sku}</Badge>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  {product.description && product.description.length > 30 ? (
                    <Link
                      to={`/products/${product.id}`}
                      className="cursor-pointer hover:underline"
                      title="Lihat detail"
                    >
                      {product.description.slice(0, 30)}...
                    </Link>
                  ) : (
                    <span>{product.description || '-'}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {product.category_name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    Rp {formatNumber(Number(product.price))}
                  </span>
                </TableCell>
                <TableCell>
                  {formatNumber(product.stock)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.status ? "default" : "destructive"
                    }
                  >
                    {product.status ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link to={`/products/${product.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Products Card List (mobile) */}
      <div className="block sm:hidden space-y-4">
        {filteredProducts.map((product: any) => (
          <Card key={product.id} className="rounded-lg shadow-sm">
            <CardContent className="flex gap-3 p-4">
              {product.image_url || product.image ? (
                <img
                  key={`${product.id}-${product.updated_at}-${refreshKeys[product.id] || 0}`}
                  src={`${product.image_url || product.image}?v=${refreshKeys[product.id] || 0}`}
                  alt={product.name}
                  className="h-16 w-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleImageClick(product.image_url || product.image, product.name)}
                  onError={(e) => {
                    // Fallback jika gambar gagal load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded border flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base truncate">{product.name}</div>
                <div className="text-xs text-gray-500 truncate">SKU: {product.sku}</div>
                <div className="text-xs text-gray-500 truncate">{product.category_name}</div>
                <div className="text-sm mt-1 line-clamp-2">{product.description || '-'}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="secondary">Rp {formatNumber(product.price)}</Badge>
                  <Badge variant="outline">Stok: {product.stock}</Badge>
                  <Badge variant={product.status ? "default" : "destructive"}>{product.status ? "Active" : "Inactive"}</Badge>
                </div>
                {/* Attributes */}
                {Array.isArray(product.attributes) && product.attributes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.attributes.map((attr: any) => {
                      const attrName =
                        categoriesWithAttributes
                          .get(product.id_category || product.category)
                          ?.find((a) => a.id === attr.id_category_attribute)?.attribute_name ||
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
                )}
                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/products/${product.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => onEdit?.(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => onDelete?.(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      <Dialog open={imageModal.open} onOpenChange={handleCloseImageModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-lg font-semibold">
              {imageModal.productName}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <div className="relative w-full flex justify-center">
              <img
                src={imageModal.imageUrl}
                alt={imageModal.productName}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.png"; // Fallback image
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductTable;
