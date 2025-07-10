import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { KnowledgeService } from "@/services/knowledgeService";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { productService } from "@/services/productService";
import React from "react";

interface KnowledgeTabProps {
  agentId: string;
}

export default function KnowledgeTab({ agentId }: KnowledgeTabProps) {
  // Text Knowledge State
  const [textTitle, setTextTitle] = useState("");
  const [textDescription, setTextDescription] = useState("");
  const [textContent, setTextContent] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [textSuccess, setTextSuccess] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);

  const handleAddTextKnowledge = async () => {
    if (!textTitle.trim() || !textDescription.trim() || !textContent.trim()) {
      setTextError("Title, description, and content are required");
      return;
    }

    setTextLoading(true);
    setTextError(null);
    setTextSuccess(false);

    try {
      await KnowledgeService.createTextKnowledge(
        agentId,
        textTitle,
        textContent,
        textDescription
      );
      setTextSuccess(true);
      setTextTitle("");
      setTextDescription("");
      setTextContent("");

      // Clear success message after 3 seconds
      setTimeout(() => setTextSuccess(false), 3000);
    } catch (error: any) {
      setTextError(error.message || "Failed to add text knowledge");
    } finally {
      setTextLoading(false);
    }
  };

  // Product Knowledge State
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productId, setProductId] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const [productSuccess, setProductSuccess] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Fetch products on mount
  React.useEffect(() => {
    setProductsLoading(true);
    setProductsError(null);
    productService.getProducts()
      .then((data) => setProducts(data))
      .catch((err) => setProductsError(err.message || "Failed to fetch products"))
      .finally(() => setProductsLoading(false));
  }, []);

  const handleAddProductKnowledge = async () => {
    if (!productName.trim() || !productDescription.trim() || !productId) {
      setProductError("Name, description, and product are required");
      return;
    }
    setProductLoading(true);
    setProductError(null);
    setProductSuccess(false);
    try {
      await KnowledgeService.createKnowledge(agentId, {
        name: productName,
        description: productDescription,
        status: true,
        content: {
          type: "Product",
          product: {
            product_id: productId,
          },
        },
      });
      setProductSuccess(true);
      setProductName("");
      setProductDescription("");
      setProductId("");
      setTimeout(() => setProductSuccess(false), 3000);
    } catch (error: any) {
      setProductError(error.message || "Failed to add product knowledge");
    } finally {
      setProductLoading(false);
    }
  };

  return (
    <>
      {/* text knowledge */}
      <TabsContent value="text" className="mt-0">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Text Knowledge Source
            </h4>
            <p className="text-muted-foreground mb-4">
              Tambahkan pengetahuan berbasis teks langsung ke AI Anda.
            </p>
          </div>

          {/* Error Display */}
          {textError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{textError}</span>
            </div>
          )}

          {/* Success Display */}
          {textSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">
                Text knowledge added successfully!
              </span>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="textTitle" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="textTitle"
              placeholder="Enter knowledge title"
              className="w-full"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              disabled={textLoading}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="textDescription" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="textDescription"
              placeholder="Enter knowledge description"
              className="w-full"
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              disabled={textLoading}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="textContent" className="text-sm font-medium">
              Content
            </Label>
            <Textarea
              id="textContent"
              placeholder="Enter your knowledge content here..."
              className="min-h-[200px] resize-none"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              disabled={textLoading}
            />
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleAddTextKnowledge}
            disabled={
              textLoading ||
              !textTitle.trim() ||
              !textDescription.trim() ||
              !textContent.trim()
            }
          >
            {textLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Text Knowledge"
            )}
          </Button>
        </div>
      </TabsContent>

      {/* website knowledge  */}
      <TabsContent value="website" className="mt-0">
        <div className="text-center py-12">
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Coming Soon
          </h4>
          <p className="text-muted-foreground">
            Website knowledge import feature is coming soon
          </p>
        </div>
        
       
      </TabsContent>

      {/* product knowledge */}
      <TabsContent value="product" className="mt-0">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Product Knowledge Source
            </h4>
            <p className="text-muted-foreground mb-4">
              Tambahkan pengetahuan produk ke AI Anda.
            </p>
          </div>
          {/* Error Display */}
          {productError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{productError}</span>
            </div>
          )}
          {/* Success Display */}
          {productSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">
                Product knowledge added successfully!
              </span>
            </div>
          )}
          <div className="space-y-3">
            <Label htmlFor="productName" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="productName"
              placeholder="Enter knowledge name"
              className="w-full"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={productLoading}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="productDescription" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="productDescription"
              placeholder="Enter knowledge description"
              className="w-full"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              disabled={productLoading}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="productSelect" className="text-sm font-medium">
              Product
            </Label>
            {productsLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading products...</div>
            ) : productsError ? (
              <div className="text-red-500 text-sm">{productsError}</div>
            ) : (
              <Select value={productId} onValueChange={setProductId} disabled={productLoading}>
                <SelectTrigger className="w-full" id="productSelect">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleAddProductKnowledge}
            disabled={
              productLoading ||
              !productName.trim() ||
              !productDescription.trim() ||
              !productId
            }
          >
            {productLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Product Knowledge"
            )}
          </Button>
        </div>
      </TabsContent>

      {/* file knowledge */}
      <TabsContent value="file" className="mt-0">
        <div className="text-center py-12">
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Coming Soon
          </h4>
          <p className="text-muted-foreground">
            File upload feature is coming soon
          </p>
        </div>
        
        
      </TabsContent>

      {/* Q&A knowledge */}
      <TabsContent value="qa" className="mt-0">
        <div className="text-center py-12">
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Coming Soon
          </h4>
          <p className="text-muted-foreground">
            Q&A knowledge feature is coming soon
          </p>
        </div>
       
      </TabsContent>
    </>
  );
}
