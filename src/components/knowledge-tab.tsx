import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Loader2, CheckCircle, AlertCircle, UploadCloud } from "lucide-react";
import { KnowledgeService } from "@/services/knowledgeService";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { productService } from "@/services/productService";
import React from "react";
import { useNavigate } from "react-router";

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

  const navigate = useNavigate();

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

  // Website Knowledge State
  const [websiteTab, setWebsiteTab] = useState('batch'); // 'batch' or 'single'
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [searchLink, setSearchLink] = useState('');

  const [dummyLinks, setDummyLinks] = useState([
    { url: "https://example.com/page1", characters: 1234, batch: "Batch A" },
    { url: "https://example.com/page2", characters: 2345, batch: "Batch A" },
    { url: "https://example.com/page3", characters: 3456, batch: "Batch B" },
    { url: "https://example.com/page4", characters: 4567, batch: "Batch B" },
    { url: "https://example.com/page5", characters: 5678, batch: "Batch A" },
    { url: "https://example.com/page6", characters: 6789, batch: "Batch C" },
    { url: "https://example.com/page7", characters: 7890, batch: "Batch A" },
    { url: "https://example.com/page8", characters: 8901, batch: "Batch B" },
    { url: "https://example.com/page9", characters: 9012, batch: "Batch A" },
    { url: "https://example.com/page10", characters: 10123, batch: "Batch C" },
  ]);

  const handleCollectLink = () => {
    if (!websiteUrl.trim()) return;
    const newLink = { url: websiteUrl, characters: Math.floor(Math.random() * 1000) + 100, batch: "Batch A" };
    setDummyLinks((prev: typeof dummyLinks) => [...prev, newLink]);
    setWebsiteUrl('');
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
        <div className="max-w-3xl mx-auto py-8">
          <h4 className="text-lg font-semibold text-foreground mb-2 text-center">
            Provide Link
          </h4>
          <p className="text-muted-foreground mb-4 text-center">
            Provide a link to the page you want the AI to learn from.
          </p>
          <div className="flex gap-2 justify-center mb-6">
            <Button variant={websiteTab === 'batch' ? 'default' : 'outline'} onClick={() => setWebsiteTab('batch')}>Batch Link</Button>
            <Button variant={websiteTab === 'single' ? 'default' : 'outline'} onClick={() => setWebsiteTab('single')}>Single Link</Button>
          </div>
          <div className="mb-6">
            <Label htmlFor="web-link-url" className="block mb-2">Web Link Collector</Label>
            <div className="flex gap-2">
              <Input id="web-link-url" placeholder="Link URL" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} />
              <Button onClick={handleCollectLink} disabled={!websiteUrl.trim()}>Collect Link</Button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>🔵</span>
              <span>Start with URL and this tool will gather up to <b>30 unique</b> links from the site, excluding any files</span>
            </div>
          </div>
          <div className="border rounded-lg p-4 bg-background">
            <h5 className="font-semibold mb-2">Trained Link</h5>
            <div className="flex items-center gap-2 mb-2">
              <Input placeholder="Search Links" className="max-w-xs" value={searchLink} onChange={e => setSearchLink(e.target.value)} />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-1 text-left"><input type="checkbox" /></th>
                    <th className="px-2 py-1 text-left">Link</th>
                    <th className="px-2 py-1 text-left">Characters</th>
                    <th className="px-2 py-1 text-left">Batch</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyLinks.filter(l => l.url.includes(searchLink)).map((link, idx) => (
                    <tr key={link.url} className="border-b hover:bg-accent/30">
                      <td className="px-2 py-1"><input type="checkbox" /></td>
                      <td className="px-2 py-1 text-blue-700 underline flex items-center gap-2"><span>🔗</span><a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a></td>
                      <td className="px-2 py-1">{link.characters.toLocaleString()} characters</td>
                      <td className="px-2 py-1">{link.batch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
          {productsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading products...</div>
          ) : productsError ? (
            <div className="text-red-500 text-sm">{productsError}</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 w-full">
              <h2 className="text-lg font-semibold mb-2 text-foreground text-center capitalize">list product kosong</h2>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                AI agent anda membutuhkan pengetahuan produk untuk dapat membantu pelanggan dengan baik. 
              </p>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate("/products")}
              >
                <UploadCloud className="w-4 h-4" />
                Tambahkan Produk
              </Button>
            </div>
          ) : (
            <>
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
            </>
          )}
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
