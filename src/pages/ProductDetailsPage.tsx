import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import MainLayout from "@/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EditProductModal from "@/components/EditProductModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Package,
  ZoomIn,
} from "lucide-react";
import { productService, categoryService, type CategoryAttribute, type ProductAttribute } from "@/services/productService";
import type { ProductResponse } from "@/services/productService";
import { useToast } from "@/hooks/useToast";
import type { Category } from "@/types";

// Extend ProductResponse to match our display needs
interface ExtendedProduct extends ProductResponse {
  category_name: string;
  id_category?: string;
  status?: boolean;
  attributes?: ProductAttribute[];
}

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [_categories, setCategories] = useState<Category[]>([]);
  const [_categoriesWithAttributes, setCategoriesWithAttributes] = useState<Map<string, CategoryAttribute[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Reload product data after successful edit
    fetchProduct();
  };

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      if (!id) {
        toast.error("Product ID not found");
        navigate("/products");
        return;
      }
      
      // Fetch product by ID and categories data
      const [productResponse, categoriesResponse] = await Promise.all([
        productService.getProductById(id),
        categoryService.getCategories()
      ]);
      
      // Transform ProductResponse to ExtendedProduct
      const extendedProduct: ExtendedProduct = {
        ...productResponse,
        category_name: productResponse.category_name || "Uncategorized",
        status: productResponse.status ?? true,
        attributes: productResponse.attributes || []
      };

      setProduct(extendedProduct);
      setCategories(categoriesResponse);
      
      // Store category attributes in Map for quick lookup
      const attributesMap = new Map<string, CategoryAttribute[]>();
      categoriesResponse.forEach((cat: any) => {
        if (cat.attributes && cat.attributes.length > 0) {
          attributesMap.set(cat.id, cat.attributes);
        }
      });
      setCategoriesWithAttributes(attributesMap);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading product details...</div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-500">Product not found</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/products")}
              className="h-9 px-3"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              size="sm" 
              onClick={() => setIsEditModalOpen(true)}
              className="h-9 px-4 w-full sm:w-auto"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          {/* Left Column - Product Images (2/5 width) */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Main Image */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                 onClick={() => handleImageClick(product.image_url ||  "")}>
              <div className="aspect-[4/3] w-full relative">
                {product.image_url ? (
                  <>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-80 transition-opacity duration-300" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-xl border-2 border-transparent hover:border-primary cursor-pointer transition-all duration-200 group"
                  onClick={() => handleImageClick(product.image_url || "")}
                >
                  <div className="w-full h-full flex items-center justify-center rounded-xl relative overflow-hidden">
                    {product.image_url ? (
                      <>
                        <img
                          src={product.image_url}
                          alt={`${product.name} thumbnail ${index}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                      </>
                    ) : (
                      <Package className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          {/* Product Attributes */}
            {Array.isArray(product.attributes) && product.attributes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Attributes</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {product.attributes.map((attr: any, index: number) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <span className="font-medium text-gray-600">{attr.attribute_name}</span>
                      <span className="text-gray-900">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          

          {/* Right Column - Product Information (3/5 width) */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-6">
            {/* Product Title & Price */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              <div className="text-3xl font-bold text-primary">
                Rp {formatNumber(product.price)}
              </div>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500 tracking-wider uppercase">
                  SKU
                </div>
                <p className="font-medium text-gray-900">
                  {product.sku}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500 tracking-wider uppercase">
                  Stock
                </div>
                <p className="font-medium text-gray-900">
                  {formatNumber(product.stock)} units
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <Badge 
                variant={product.status ? "default" : "destructive"}
                className="px-3 py-1"
              >
                {product.status ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Description Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description || "No description available"}
              </p>
            </div>

            {/* Product Specifications */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <span className="font-medium text-gray-600">Category</span>
                  <span className="text-gray-900">{product.category_name || "Uncategorized"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <span className="font-medium text-gray-600">Product ID</span>
                  <span className="font-mono text-sm text-gray-900 truncate max-w-[200px]" title={product.id}>{product.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <span className="font-medium text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {product.created_at ? new Date(product.created_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            
          </div>
        </div>

        {/* Image Modal */}
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-lg font-semibold">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6">
              <div className="relative w-full flex justify-center">
                <img
                  src={selectedImage}
                  alt={product.name}
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

        {/* Edit Product Modal */}
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          product={product}
        />
      </div>
    </MainLayout>
  );
};

export default ProductDetailsPage;