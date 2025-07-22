import MainLayout from "@/main-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { getCustomIntegrations } from "@/services/customIntegrationService";
import { ArrowLeft } from "lucide-react";

const ApiIntegrationPage = () => {
  const navigate = useNavigate();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCustomIntegrations()
      .then((res) => {
        setTools(res.data || []);
      })
      .catch((err) => {
        setError(err?.message || "Failed to fetch tools");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="#"
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
          </div>
        </div>
        <h1 className="text-2xl font-bold">Custom Integrations</h1>
        <p className="text-gray-500 mb-4">
          Don't forget to activate tools in AI Agent → Integrations → Custom
          Integration.
        </p>
        {loading && (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        )}
        {error && <div className="text-center py-8 text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add New API Tool Card */}
            <Card
              className="flex items-center justify-center cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 hover:shadow-lg transition"
              onClick={() => navigate("/integration/api/create")}
            >
              <span className="text-lg font-semibold text-blue-700">
                Add New Custom Integration
              </span>
            </Card>
            {/* Tool Cards from API */}
            {tools.map((tool) => (
              <Card
                key={tool.id}
                className="relative p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/30"
              >
                <div className="mb-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Tool
                </div>
                <div className="font-semibold text-lg mb-1">{tool.name}</div>
                <div className="text-gray-600 text-sm mb-8 line-clamp-2">
                  {tool.description}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-4 left-4"
                  onClick={() => navigate(`/integration/api/${tool.id}`)}
                >
                  Detail
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ApiIntegrationPage;
