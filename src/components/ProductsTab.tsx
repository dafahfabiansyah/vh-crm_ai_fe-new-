import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import ProductTable from "@/components/product-table";
import type { Product, Category } from "@/types";
import type { CategoryAttribute } from "@/services/productService";

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  categoriesWithAttributes: Map<string, CategoryAttribute[]>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  categories,
  categoriesWithAttributes,
  searchTerm,
  setSearchTerm,
  onEditProduct,
  onDeleteProduct,
}) => {
  return (
    <>
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border shadow-sm mb-6">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name, code, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <ProductTable
          products={products}
          categories={categories}
          categoriesWithAttributes={categoriesWithAttributes}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
        />
      </div>
    </>
  );
};

export default ProductsTab;
