import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Check, Package } from "lucide-react";
import type { Product, Category, AIAgent } from "@/types";

interface AddToAITabProps {
  // AI Agent data
  aiAgents: AIAgent[];
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
  isLoadingAgents: boolean;
  addToAIError: string;
  
  // Category filtering
  categories: Category[];
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  
  // Products data
  filteredProducts: Product[];
  selectedProductIds: string[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
  isProductInKnowledge: (productId: string) => boolean;
  
  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Actions
  addToAILoading: boolean;
  handleAddProductsToAI: () => void;
}

const formatNumber = (value: number | string): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString("id-ID");
};

const AddToAITab: React.FC<AddToAITabProps> = ({
  aiAgents,
  selectedAgentId,
  setSelectedAgentId,
  isLoadingAgents,
  addToAIError,
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  filteredProducts,
  selectedProductIds,
  setSelectedProductIds,
  isProductInKnowledge,
  searchTerm,
  setSearchTerm,
  addToAILoading,
  handleAddProductsToAI,
}) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b">
        <CardTitle>Add Products to AI Agent</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Upload product information to AI agents for enhanced customer support
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {/* AI Agent & Category Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Select AI Agent
            </Label>
            {isLoadingAgents ? (
              <div className="text-gray-500 text-sm">Loading agents...</div>
            ) : addToAIError ? (
              <div className="text-red-500 text-sm">{addToAIError}</div>
            ) : (
              <Select
                value={selectedAgentId}
                onValueChange={setSelectedAgentId}
                disabled={isLoadingAgents || aiAgents.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      aiAgents.length === 0
                        ? "No AI agent found"
                        : "Select AI agent"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {aiAgents.length === 0 ? (
                    <SelectItem value="no-agents" disabled>
                      No AI agent found
                    </SelectItem>
                  ) : (
                    aiAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Filter by Category
            </Label>
            <Select
              value={selectedCategoryId || "all"}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {addToAILoading && (
          <div className="flex justify-center items-center py-8 bg-blue-50 rounded-lg mb-6">
            <svg
              className="animate-spin h-6 w-6 text-blue-600 mr-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-blue-600 font-medium">
              Uploading products to AI agent...
            </span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-lg border shadow-sm mb-6">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>
        </div>

        {/* Products Selection Table */}
        <div className="border rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedProductIds.length ===
                          filteredProducts.filter(
                            (p) => !isProductInKnowledge(p.id)
                          ).length &&
                        filteredProducts.filter(
                          (p) => !isProductInKnowledge(p.id)
                        ).length > 0
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          const availableProducts = filteredProducts.filter(
                            (p) => !isProductInKnowledge(p.id)
                          );
                          setSelectedProductIds(
                            availableProducts.map((p) => p.id)
                          );
                        } else {
                          setSelectedProductIds([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product: Product) => (
                    <TableRow
                      key={product.id}
                      className={`${
                        isProductInKnowledge(product.id)
                          ? "bg-gray-50 opacity-60"
                          : ""
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProductIds((prev) => [
                                ...prev,
                                product.id,
                              ]);
                            } else {
                              setSelectedProductIds((prev) =>
                                prev.filter((id) => id !== product.id)
                              );
                            }
                          }}
                          disabled={isProductInKnowledge(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-10 w-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {product.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.sku || product.code || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {product.category_name || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatNumber(product.stock)}</TableCell>
                      <TableCell>
                        <span className="font-medium">
                          Rp {formatNumber(product.price)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {isProductInKnowledge(product.id) ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Added
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Added</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found
              </div>
            ) : (
              filteredProducts.map((product: Product) => (
                <Card key={product.id} className="rounded-lg shadow-sm">
                  <CardContent
                    className={`flex gap-3 p-4 ${
                      isProductInKnowledge(product.id)
                        ? "bg-gray-50 opacity-60"
                        : ""
                    }`}
                  >
                    <Checkbox
                      checked={selectedProductIds.includes(product.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProductIds((prev) => [
                            ...prev,
                            product.id,
                          ]);
                        } else {
                          setSelectedProductIds((prev) =>
                            prev.filter((id) => id !== product.id)
                          );
                        }
                      }}
                      disabled={isProductInKnowledge(product.id)}
                      className="mt-1"
                    />
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded border flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base truncate">
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        SKU: {product.sku || product.code || "-"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {product.category_name || "-"}
                      </div>
                      <div className="text-sm mt-1 line-clamp-2">
                        {product.description || "No description"}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge variant="secondary">
                          Rp {formatNumber(product.price)}
                        </Badge>
                        <Badge variant="outline">
                          Stok: {formatNumber(product.stock)}
                        </Badge>
                        {isProductInKnowledge(product.id) ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Added to AI
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Added</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <div className="text-sm text-gray-600">
            {selectedProductIds.length} product
            {selectedProductIds.length !== 1 ? "s" : ""} selected
          </div>
          <Button
            disabled={
              selectedProductIds.length === 0 ||
              !selectedAgentId ||
              addToAILoading
            }
            onClick={handleAddProductsToAI}
          >
            {addToAILoading ? "Adding..." : "Add Selected Products to AI"}
          </Button>
        </div>

        {addToAIError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 text-sm">{addToAIError}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddToAITab;
