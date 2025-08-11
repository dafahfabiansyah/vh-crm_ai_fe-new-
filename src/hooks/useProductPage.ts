import { useState, useEffect, useCallback } from "react";
import { 
  categoryService, 
  productService, 
  type CategoryAttribute
} from "@/services/productService";
import { AgentsService } from "@/services/agentsService";
import { KnowledgeService, type ExistingKnowledge, type KnowledgeSourceContent } from "@/services/knowledgeService";
import { useToast } from "@/hooks";
import type { 
  Category, 
  Product,
  AIAgent 
} from "@/types";

type KnowledgeWithContent = ExistingKnowledge & {
  content?: KnowledgeSourceContent[];
};

export const useProductPage = () => {
  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "addToAI" | "checkKnowledgeToAI"
  >("products");
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Categories state  
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesWithAttributes, setCategoriesWithAttributes] = useState<
    Map<string, CategoryAttribute[]>
  >(new Map());
  
  // AI Agent state
  const [aiAgents, setAIAgents] = useState<AIAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [addToAIError, setAddToAIError] = useState<string>("");
  const [addToAILoading, setAddToAILoading] = useState(false);
  const [addToAISuccess, setAddToAISuccess] = useState<string>("");
  const [existingKnowledge, setExistingKnowledge] = useState<KnowledgeWithContent[]>([]);
  
  // Category selection for filtering
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  
  const { success, error: showError } = useToast();

  // Filter products by selected category for Add Product to AI tab
  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );
  
  const filteredProducts: Product[] = products
    .filter((p: Product) => {
      // Filter by category
      if (selectedCategoryId && selectedCategoryId !== "all") {
        return selectedCategory ? p.category_name === selectedCategory.name : false;
      }
      return true;
    })
    .filter((p: Product) => {
      // Filter by search term (product name)
      if (searchTerm.trim() === "") return true;
      return (p.name?.toLowerCase?.() || "").includes(searchTerm.toLowerCase());
    });

  // Check if product exists in knowledge base
  const isProductInKnowledge = useCallback(
    (productId: string) => {
      return existingKnowledge.some(
        (knowledge) => {
          // Check if this knowledge has content items related to the product
          return knowledge.content?.some(content => 
            content.content?.product?.product_id === productId
          );
        }
      );
    },
    [existingKnowledge]
  );

  // Fetch AI agents when Add Product to AI tab is active
  useEffect(() => {
    if (activeTab === "addToAI") {
      setIsLoadingAgents(true);
      AgentsService.getAgents()
        .then((agents) => {
          setAIAgents(agents);
          if (agents.length > 0) setSelectedAgentId(agents[0].id);
        })
        .catch((err) => {
          console.error("Error fetching agents:", err);
          setAddToAIError("Failed to load AI agents");
        })
        .finally(() => setIsLoadingAgents(false));
    }
  }, [activeTab]);

  // Fetch existing knowledge when agent is selected
  useEffect(() => {
    if (selectedAgentId) {
      KnowledgeService.getExistingKnowledge(selectedAgentId)
        .then((knowledge) => {
          setExistingKnowledge(knowledge);
        })
        .catch((err) => {
          console.error("Error fetching existing knowledge:", err);
        });
    }
  }, [selectedAgentId]);

  // Load products and categories
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);

      // Load attributes for each category (simplified for now)
      const attributesMap = new Map<string, CategoryAttribute[]>();
      // Note: getCategoryAttributes method needs to be implemented in categoryService
      setCategoriesWithAttributes(attributesMap);
    } catch (error) {
      console.error("Error loading data:", error);
      showError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Add products to AI agent
  const handleAddProductsToAI = async () => {
    if (!selectedAgentId || selectedProductIds.length === 0) return;

    setAddToAILoading(true);
    setAddToAIError("");
    setAddToAISuccess("");

    try {
      const selectedProducts = products.filter((p) =>
        selectedProductIds.includes(p.id)
      );

      for (const product of selectedProducts) {
        await KnowledgeService.createProductKnowledge(
          selectedAgentId, 
          product.name,
          product.id,
          product.description || ""
        );
      }

      setAddToAISuccess(
        `Successfully added ${selectedProducts.length} product${
          selectedProducts.length > 1 ? "s" : ""
        } to AI agent`
      );
      success(
        `Added ${selectedProducts.length} product${
          selectedProducts.length > 1 ? "s" : ""
        } to AI agent`
      );

      // Reset selection and reload knowledge
      setSelectedProductIds([]);
      if (selectedAgentId) {
        const knowledge = await KnowledgeService.getExistingKnowledge(selectedAgentId);
        setExistingKnowledge(knowledge);
      }
    } catch (err: any) {
      console.error("Error adding products to AI:", err);
      setAddToAIError(err?.message || "Failed to add products to AI agent");
      showError(err?.message || "Failed to add products to AI agent");
    } finally {
      setAddToAILoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
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
    addToAISuccess,
    existingKnowledge,
    isLoading,
    
    // Computed
    filteredProducts,
    
    // Functions
    isProductInKnowledge,
    handleAddProductsToAI,
    loadData,
  };
};
