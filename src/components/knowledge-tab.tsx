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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";
import { useRef } from "react";

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
  const [websiteName, setWebsiteName] = useState('');
  const [websiteDescription, setWebsiteDescription] = useState('');
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const [websiteSuccess, setWebsiteSuccess] = useState(false);
  const [websiteError, setWebsiteError] = useState<string | null>(null);
  const [searchLink, setSearchLink] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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

          {/* Website Knowledge Form */}
          <div className="mb-6 max-w-md mx-auto border rounded-lg p-4 bg-background">
            <h5 className="font-semibold mb-2 text-center">Add Website Knowledge</h5>
            {websiteError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md mb-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{websiteError}</span>
              </div>
            )}
            {websiteSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md mb-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">Website knowledge added successfully!</span>
              </div>
            )}
            <div className="space-y-3">
              <Label htmlFor="websiteName" className="text-sm font-medium">Name</Label>
              <Input
                id="websiteName"
                placeholder="Enter knowledge name"
                className="w-full"
                value={websiteName}
                onChange={e => setWebsiteName(e.target.value)}
                disabled={websiteLoading}
              />
            </div>
            <div className="space-y-3 mt-2">
              <Label htmlFor="websiteDescription" className="text-sm font-medium">Description</Label>
              <Input
                id="websiteDescription"
                placeholder="Enter knowledge description"
                className="w-full"
                value={websiteDescription}
                onChange={e => setWebsiteDescription(e.target.value)}
                disabled={websiteLoading}
              />
            </div>
            <div className="space-y-3 mt-2">
              <Label htmlFor="websiteUrl" className="text-sm font-medium">URL</Label>
              <Input
                id="websiteUrl"
                placeholder="Enter website URL"
                className="w-full"
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                disabled={websiteLoading}
              />
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 mt-4 w-full"
              onClick={async () => {
                if (!websiteName.trim() || !websiteDescription.trim() || !websiteUrl.trim()) {
                  setWebsiteError('Name, description, and URL are required');
                  return;
                }
                setWebsiteLoading(true);
                setWebsiteError(null);
                setWebsiteSuccess(false);
                try {
                  // Auto title dari domain
                  let title = '';
                  try {
                    const urlObj = new URL(websiteUrl);
                    title = urlObj.hostname;
                  } catch {
                    title = websiteUrl;
                  }
                  // Format baru: hanya kirim name, description, status, url, scrape_type, max_links
                  await KnowledgeService.postWebsiteKnowledge(
                    agentId,
                    websiteName,
                    websiteDescription,
                    websiteUrl,
                    'batch', // scrape_type
                    30 // max_links
                  );
                  setWebsiteSuccess(true);
                  setWebsiteName('');
                  setWebsiteDescription('');
                  setWebsiteUrl('');
                  setTimeout(() => setWebsiteSuccess(false), 3000);
                } catch (error: any) {
                  setWebsiteError(error.message || 'Failed to add website knowledge');
                } finally {
                  setWebsiteLoading(false);
                }
              }}
              disabled={websiteLoading || !websiteName.trim() || !websiteDescription.trim() || !websiteUrl.trim()}
            >
              {websiteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Website Knowledge'
              )}
            </Button>
          </div>
          {/* <div className="mb-6">
            <Label htmlFor="web-link-url" className="block mb-2">Web Link Collector</Label>
            <div className="flex gap-2">
              <Input id="web-link-url" placeholder="Link URL" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} />
              <Button disabled>Collect Link</Button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>🔵</span>
              <span>Start with URL and this tool will gather up to <b>30 unique</b> links from the site, excluding any files</span>
            </div>
          </div> */}
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Upload area */}
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-foreground mb-2">Files</h4>
            <div className="border rounded-lg bg-background p-4 mb-4">
              <div
                className="border-2 border-dashed border-muted-foreground rounded-lg min-h-[120px] flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-primary transition-colors"
                // Dummy: no real upload
                onClick={() => fileInputRef.current?.click()}
                onDrop={e => e.preventDefault()}
                onDragOver={e => e.preventDefault()}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" />
                <div className="text-base font-medium mb-1">Drag & drop your files here or click to select files</div>
                <div className="text-xs text-muted-foreground">Supported File Type: <span className="font-semibold">.pdf</span></div>
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                If you are uploading a PDF, make sure you can highlight the text
              </div>
            </div>
            <div className="mb-2 text-sm"><span className="font-medium">Already Included Files:</span> -</div>
            <div className="mb-2 text-sm"><span className="font-medium">To be added:</span> -</div>
          </div>
          {/* Right: Summary */}
          <div className="w-full md:w-64 bg-background rounded-lg border p-6 flex flex-col gap-4 items-center self-start">
            <div className="w-full flex flex-col gap-1 text-sm">
              <div className="flex justify-between"><span>Files</span><span>0</span></div>
              <div className="flex justify-between"><span>Text Input Characters</span><span>0</span></div>
              <div className="flex justify-between"><span>Links</span><span>8</span></div>
              <div className="flex justify-between"><span>Q&A</span><span>8</span></div>
            </div>
            <div className="w-full border-t pt-4 mt-2 flex flex-col items-center">
              <div className="text-xs text-muted-foreground mb-1">Total Detected Characters</div>
              <div className="text-2xl font-bold text-primary">2376</div>
            </div>
            <Button className="w-full mt-2">Save</Button>
          </div>
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
