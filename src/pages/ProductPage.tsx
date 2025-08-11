import { useState } from "react";
import MainLayout from "@/main-layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProductPage, useProductForms } from "@/hooks";
import ProductsTab from "@/components/ProductsTab";
import CategoriesTab from "@/components/CategoriesTab";
import AddToAITab from "@/components/AddToAITab";
import AIKnowledgeTab from "@/components/AIKnowledgeTab";
// Import your existing modal components here
import CreateProductModal from "@/components/CreateProductModal";
import CreateCategoryModal from "@/components/CreateCategoryModal";
import EditProductModal from "@/components/EditProductModal";
// etc.

const ProductPage = () => {
  const {
    // State
    activeTab,
    setActiveTab,
    products,
    categories,
    categoriesWithAttributes,
    searchTerm,
    setSearchTerm,
    aiAgents,
    selectedAgentId,
    setSelectedAgentId,
    selectedProductIds,
    setSelectedProductIds,
    selectedCategoryId,
    setSelectedCategoryId,
    isLoadingAgents,
    addToAIError,
    addToAILoading,
    
    // Computed
    filteredProducts,
    
    // Functions
    isProductInKnowledge,
    handleAddProductsToAI,
    loadData,
  } = useProductPage();

  const {
    // Modal states
    isModalOpen,
    setIsModalOpen,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    // Add other form states and handlers as needed
  } = useProductForms();

  // State for edit product modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const handleEditProduct = (product: any) => {
    setProductToEdit(product);
    setIsEditModalOpen(true);
  };

  const handleEditProductSuccess = () => {
    setIsEditModalOpen(false);
    setProductToEdit(null);
    loadData(); // Refresh the data
  };

  const handleDeleteProduct = (productId: string) => {
    // Implementation for deleting product
    console.log("Delete product:", productId);
  };

  const handleEditCategory = (category: any) => {
    // Implementation for editing category
    console.log("Edit category:", category);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // Implementation for deleting category
    console.log("Delete category:", categoryId);
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-full mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === "products" && "Products List"}
              {activeTab === "categories" && "Categories Management"}
              {activeTab === "addToAI" && "Add Products to AI"}
              {activeTab === "checkKnowledgeToAI" && "AI Knowledge Management"}
            </h1>
            <p className="text-gray-600">
              {activeTab === "products" &&
                `${products.length} total products`}
              {activeTab === "categories" &&
                `Manage ${categories.length} product categories`}
              {activeTab === "addToAI" &&
                "Upload product information to AI agents"}
              {activeTab === "checkKnowledgeToAI" &&
                "Review and manage AI knowledge base"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Navigation Pills */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={activeTab === "products" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("products")}
                disabled={categories.length === 0 && activeTab !== "products"}
                className="h-8"
              >
                Products
              </Button>
              <Button
                variant={activeTab === "categories" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("categories")}
                className="h-8"
              >
                Categories
              </Button>
              <Button
                variant={activeTab === "addToAI" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("addToAI")}
                className="h-8"
              >
                Add to AI
              </Button>
              <Button
                variant={
                  activeTab === "checkKnowledgeToAI" ? "default" : "ghost"
                }
                size="sm"
                onClick={() => setActiveTab("checkKnowledgeToAI")}
                className="h-8"
              >
                AI Knowledge
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {(activeTab === "products" || activeTab === "categories") && (
                <Button
                  onClick={() =>
                    activeTab === "products"
                      ? setIsModalOpen(true)
                      : setIsCategoryModalOpen(true)
                  }
                  disabled={activeTab === "products" && categories.length === 0}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {activeTab === "products" ? "Add Product" : "Add Category"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "categories" && (
          <CategoriesTab
            categories={categories}
            categoriesWithAttributes={categoriesWithAttributes}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            products={products}
            onAddCategory={() => setIsCategoryModalOpen(true)}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {activeTab === "products" && (
          <ProductsTab
            products={products}
            categories={categories}
            categoriesWithAttributes={categoriesWithAttributes}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === "addToAI" && (
          <AddToAITab
            aiAgents={aiAgents}
            selectedAgentId={selectedAgentId}
            setSelectedAgentId={setSelectedAgentId}
            isLoadingAgents={isLoadingAgents}
            addToAIError={addToAIError}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            filteredProducts={filteredProducts}
            selectedProductIds={selectedProductIds}
            setSelectedProductIds={setSelectedProductIds}
            isProductInKnowledge={isProductInKnowledge}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            addToAILoading={addToAILoading}
            handleAddProductsToAI={handleAddProductsToAI}
          />
        )}

        {activeTab === "checkKnowledgeToAI" && (
          <AIKnowledgeTab
            aiAgents={aiAgents}
            selectedAgentId={selectedAgentId}
            setSelectedAgentId={setSelectedAgentId}
            isLoadingAgents={isLoadingAgents}
            addToAIError={addToAIError}
          />
        )}

        {/* Add your modal components here */}
         
        <CreateProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadData}
          categories={categories}
          categoriesWithAttributes={categoriesWithAttributes}
        />
        
        <CreateCategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSuccess={loadData}
        />

        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditProductSuccess}
          product={productToEdit}
          categories={categories}
          categoriesWithAttributes={categoriesWithAttributes}
        />
      
      </div>
    </MainLayout>
  );
};

export default ProductPage;
