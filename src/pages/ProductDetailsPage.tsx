import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import MainLayout from "@/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Package,
  ZoomIn,
} from "lucide-react";
import { productService } from "@/services/productService";
import type { ProductResponse } from "@/services/productService";
import { useToast } from "@/hooks/useToast";
import { Label } from "@/components/ui/label";

// Extend ProductResponse to match our display needs
interface ExtendedProduct extends ProductResponse {
  category_name: string;
  id_category?: string;
  status?: boolean;
  attributes?: Array<{
    id: string;
    id_category_attribute: string;
    attribute_name: string;
    value: string;
    created_at: string;
    updated_at: string;
  }>;
}

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    sku: "",
    stock: "",
    description: "",
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await productService.getProducts();
        const foundProduct = response.find((p) => p.id === id);
        
        if (!foundProduct) {
          toast.error("Product not found");
          navigate("/products");
          return;
        }

        // Transform ProductResponse to ExtendedProduct
        const extendedProduct: ExtendedProduct = {
          ...foundProduct,
          category_name: foundProduct.category_name || "Uncategorized",
          id_category: undefined,
          status: true, 
          attributes: []
        };

        setProduct(extendedProduct);
        setEditForm({
          name: foundProduct.name,
          price: foundProduct.price.toString(),
          sku: foundProduct.sku,
          stock: foundProduct.stock.toString(),
          description: foundProduct.description,
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, toast]);

  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      setIsSaving(true);
      
      // Here you would typically call an update API
      // await productService.updateProduct(product.id, editForm);
      
      // For now, just update local state
      setProduct((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          name: editForm.name,
          price: parseFloat(editForm.price) || 0,
          sku: editForm.sku,
          stock: parseInt(editForm.stock) || 0,
          description: editForm.description,
        };
      });

      setIsEditing(false);
      toast.success("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!product) return;
    
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      sku: product.sku,
      stock: product.stock.toString(),
      description: product.description,
    });
    setIsEditing(false);
  };

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
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="h-9 px-4 flex-1 sm:flex-none"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="h-9 px-4 flex-1 sm:flex-none"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="h-9 px-4 w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
          {/* Left Column - Product Images (2/5 width) */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Main Image */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300"
                 onClick={() => handleImageClick(product.image_url || product.image || "")}>
              <div className="aspect-[4/3] w-full relative">
                {product.image_url || product.image ? (
                  <>
                    <img
                      src={product.image_url || product.image}
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
                  onClick={() => handleImageClick(product.image_url || product.image || "")}
                >
                  <div className="w-full h-full flex items-center justify-center rounded-xl relative overflow-hidden">
                    {product.image_url || product.image ? (
                      <>
                        <img
                          src={product.image_url || product.image}
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
          </div>

          {/* Right Column - Product Information (3/5 width) */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-6">
            {/* Product Title & Price */}
            <div className="space-y-4">
              {isEditing ? (
                <Input
                  value={editForm.name}
                  onChange={(e) => handleEditChange("name", e.target.value)}
                  className="text-2xl font-bold border-0 p-0 h-auto bg-transparent focus-visible:ring-0"
                  style={{ fontSize: '1.75rem', lineHeight: '2rem' }}
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
              )}
              
              {isEditing ? (
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => handleEditChange("price", e.target.value)}
                  className="text-2xl font-bold text-primary border-0 p-0 h-auto bg-transparent focus-visible:ring-0"
                />
              ) : (
                <div className="text-3xl font-bold text-primary">
                  Rp {formatNumber(product.price)}
                </div>
              )}
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500 tracking-wider uppercase">
                  SKU
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.sku}
                    onChange={(e) => handleEditChange("sku", e.target.value)}
                    className="font-medium text-gray-900"
                  />
                ) : (
                  <p className="font-medium text-gray-900">
                    {product.sku || product.code}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500 tracking-wider uppercase">
                  Stock
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => handleEditChange("stock", e.target.value)}
                    className="font-medium text-gray-900"
                  />
                ) : (
                  <p className="font-medium text-gray-900">
                    {formatNumber(product.stock)} units
                  </p>
                )}
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
              {isEditing ? (
                <Textarea
                  value={editForm.description}
                  onChange={(e) => handleEditChange("description", e.target.value)}
                  rows={4}
                  className="w-full text-gray-700 leading-relaxed resize-none"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">
                  {product.description || "No description available"}
                </p>
              )}
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
      </div>
    </MainLayout>
  );
};

export default ProductDetailsPage;