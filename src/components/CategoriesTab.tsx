import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Package, Plus, Edit, Trash2 } from "lucide-react";
import type { Category } from "@/types";
import type { CategoryAttribute } from "@/services/productService";

interface CategoriesTabProps {
  categories: Category[];
  categoriesWithAttributes: Map<string, CategoryAttribute[]>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  products: any[]; // Products array for counting
  onAddCategory: () => void;
  onEditCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  categoriesWithAttributes,
  searchTerm,
  setSearchTerm,
  products,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const totalCategories = categories.length;
  
  const filteredCategories = categories.filter((category) =>
    (category.name?.toLowerCase?.() || "").includes(searchTerm.toLowerCase()) ||
    (category.description?.toLowerCase?.() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Search Bar */}
      <div className="bg-white rounded-lg border shadow-sm mb-6">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Categories
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCategories}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            <span>Categories ({categories.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No categories found
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first category to get started
              </p>
              <Button onClick={onAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredCategories.map((category) => {
                const attributes =
                  categoriesWithAttributes.get(category.id) || [];

                return (
                  <Accordion
                    key={category.id}
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    <AccordionItem value={category.id} className="border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 text-left">
                            <div className="lg:col-span-2">
                              <div className="font-medium text-gray-900">
                                {category.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {category.description || "No description"}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Badge variant="secondary">
                                {attributes.length} attribute
                                {attributes.length !== 1 ? "s" : ""}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {onEditCategory && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditCategory(category);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {onDeleteCategory && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteCategory(category.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Category Attributes
                          </h4>
                          {attributes.length === 0 ? (
                            <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg">
                              No attributes defined for this category
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {attributes
                                .sort((a, b) => a.display_order - b.display_order)
                                .map((attr) => (
                                  <div
                                    key={attr.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div>
                                      <span className="font-medium text-gray-900">
                                        {attr.attribute_name}
                                      </span>
                                      {attr.is_required && (
                                        <Badge
                                          variant="destructive"
                                          className="ml-2 text-xs"
                                        >
                                          Required
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Order: {attr.display_order}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default CategoriesTab;
