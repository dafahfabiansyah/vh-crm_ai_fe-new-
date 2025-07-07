import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { KnowledgeService } from "@/services/knowledgeService";

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

  // Website Knowledge State
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteTitle, setWebsiteTitle] = useState("");
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const [websiteSuccess, setWebsiteSuccess] = useState(false);
  const [websiteError, setWebsiteError] = useState<string | null>(null);

  // Product Knowledge State
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const [productSuccess, setProductSuccess] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Q&A Knowledge State
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [keywords, setKeywords] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaSuccess, setQaSuccess] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);

  const handleAddTextKnowledge = async () => {
    if (!textTitle.trim() || !textDescription.trim() || !textContent.trim()) {
      setTextError("Title, description, and content are required");
      return;
    }

    setTextLoading(true);
    setTextError(null);
    setTextSuccess(false);

    try {
      await KnowledgeService.createTextKnowledge(agentId, textTitle, textContent, textDescription);
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

  const handleAddWebsiteKnowledge = async () => {
    if (!websiteUrl.trim()) {
      setWebsiteError("Website URL is required");
      return;
    }

    setWebsiteLoading(true);
    setWebsiteError(null);
    setWebsiteSuccess(false);

    try {
      await KnowledgeService.createWebsiteKnowledge(
        agentId,
        websiteTitle || websiteUrl,
        websiteUrl,
        websiteTitle
      );
      setWebsiteSuccess(true);
      setWebsiteUrl("");
      setWebsiteTitle("");
      
      // Clear success message after 3 seconds
      setTimeout(() => setWebsiteSuccess(false), 3000);
    } catch (error: any) {
      setWebsiteError(error.message || "Failed to add website knowledge");
    } finally {
      setWebsiteLoading(false);
    }
  };

  const handleAddProductKnowledge = async () => {
    if (!productName.trim() || !productCategory.trim() || !productDescription.trim()) {
      setProductError("Product name, category, and description are required");
      return;
    }

    setProductLoading(true);
    setProductError(null);
    setProductSuccess(false);

    try {
      await KnowledgeService.createProductKnowledge(
        agentId,
        productName,
        productCategory,
        productDescription
      );
      setProductSuccess(true);
      setProductName("");
      setProductCategory("");
      setProductDescription("");
      
      // Clear success message after 3 seconds
      setTimeout(() => setProductSuccess(false), 3000);
    } catch (error: any) {
      setProductError(error.message || "Failed to add product knowledge");
    } finally {
      setProductLoading(false);
    }
  };

  const handleAddQAKnowledge = async () => {
    if (!question.trim() || !answer.trim()) {
      setQaError("Question and answer are required");
      return;
    }

    setQaLoading(true);
    setQaError(null);
    setQaSuccess(false);

    try {
      await KnowledgeService.createQAKnowledge(agentId, question, answer, keywords);
      setQaSuccess(true);
      setQuestion("");
      setAnswer("");
      setKeywords("");
      
      // Clear success message after 3 seconds
      setTimeout(() => setQaSuccess(false), 3000);
    } catch (error: any) {
      setQaError(error.message || "Failed to add Q&A knowledge");
    } finally {
      setQaLoading(false);
    }
  };
  return (
    <>
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
              <span className="text-sm text-green-700">Text knowledge added successfully!</span>
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
            disabled={textLoading || !textTitle.trim() || !textDescription.trim() || !textContent.trim()}
          >
            {textLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Text Knowledge'
            )}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="website" className="mt-0">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Website Knowledge Source
            </h4>
            <p className="text-muted-foreground mb-4">
              Tambahkan pengetahuan dari situs web eksternal untuk melatih AI
              Anda.
            </p>
          </div>

          {/* Error Display */}
          {websiteError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{websiteError}</span>
            </div>
          )}

          {/* Success Display */}
          {websiteSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">Website knowledge added successfully!</span>
            </div>
          )}

          <div className="space-y-3">
            <Label htmlFor="websiteUrl" className="text-sm font-medium">
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              placeholder="https://example.com"
              className="w-full"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              disabled={websiteLoading}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="websiteTitle" className="text-sm font-medium">
              Title (Optional)
            </Label>
            <Input
              id="websiteTitle"
              placeholder="Custom title for this source"
              className="w-full"
              value={websiteTitle}
              onChange={(e) => setWebsiteTitle(e.target.value)}
              disabled={websiteLoading}
            />
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleAddWebsiteKnowledge}
            disabled={websiteLoading || !websiteUrl.trim()}
          >
            {websiteLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              'Import from Website'
            )}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="product" className="mt-0">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Product Knowledge Source
            </h4>
            <p className="text-muted-foreground mb-4">
              Add product information and specifications.
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
              <span className="text-sm text-green-700">Product knowledge added successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="productName" className="text-sm font-medium">
                Product Name
              </Label>
              <Input
                id="productName"
                placeholder="Enter product name"
                className="w-full"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={productLoading}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="productCategory" className="text-sm font-medium">
                Category
              </Label>
              <Select 
                value={productCategory} 
                onValueChange={setProductCategory}
                disabled={productLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="food">Food & Beverages</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="productDescription" className="text-sm font-medium">
              Product Description
            </Label>
            <Textarea
              id="productDescription"
              placeholder="Detailed product description..."
              className="min-h-[150px] resize-none"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              disabled={productLoading}
            />
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleAddProductKnowledge}
            disabled={productLoading || !productName.trim() || !productCategory.trim() || !productDescription.trim()}
          >
            {productLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Product Knowledge'
            )}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="file" className="mt-0">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              File Knowledge Source
            </h4>
            <p className="text-muted-foreground mb-4">
              Unggah file untuk melatih AI Anda sebagai informasi tambahan.
            </p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h5 className="text-lg font-medium text-foreground mb-2">
              Upload Files
            </h5>
            <p className="text-muted-foreground mb-4">
              Drag and drop files here, or click to browse
            </p>
            {/* <p className="text-sm text-muted-foreground mb-4">
                              Supported formats: PDF, DOC, DOCX, TXT, CSV
                            </p> */}
            <Button variant="outline">Browse Files</Button>
          </div>
          <div className="space-y-3">
            <Label htmlFor="fileTitle" className="text-sm font-medium">
              Custom Title (Optional)
            </Label>
            <Input
              id="fileTitle"
              placeholder="Custom title for uploaded files"
              className="w-full"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="qa" className="mt-0">
        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Q&A Knowledge Source
            </h4>
            <p className="text-muted-foreground mb-4">
              Buat skenario tanya jawab untuk melatih AI Anda.
            </p>
          </div>

          {/* Error Display */}
          {qaError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{qaError}</span>
            </div>
          )}

          {/* Success Display */}
          {qaSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">Q&A knowledge added successfully!</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="question" className="text-sm font-medium">
                Question
              </Label>
              <Input
                id="question"
                placeholder="What question might customers ask?"
                className="w-full"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={qaLoading}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="answer" className="text-sm font-medium">
                Answer
              </Label>
              <Textarea
                id="answer"
                placeholder="Provide the ideal answer for this question..."
                className="min-h-[120px] resize-none"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={qaLoading}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="keywords" className="text-sm font-medium">
                Keywords (Optional)
              </Label>
              <Input
                id="keywords"
                placeholder="Related keywords, separated by commas"
                className="w-full"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={qaLoading}
              />
            </div>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={handleAddQAKnowledge}
            disabled={qaLoading || !question.trim() || !answer.trim()}
          >
            {qaLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Q&A Pair'
            )}
          </Button>
        </div>
      </TabsContent>
    </>
  );
}
