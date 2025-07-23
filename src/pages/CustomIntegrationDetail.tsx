import MainLayout from "@/main-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { getCustomIntegrationById, deleteCustomIntegration } from "@/services/customIntegrationService";
import { ArrowLeft, Globe, Clock, Settings, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface CustomIntegrationField {
  id: string;
  field_name: string;
  field_type: string;
  is_required: boolean;
  default_value: string | null;
  description: string;
  display_order: number;
  enum_values: string;
  created_at: string;
}

export interface CustomIntegrationDetail {
  id: string;
  name: string;
  description: string;
  webhook_url: string;
  http_method: string;
  content_type: string;
  timeout_seconds: number;
  is_active: boolean;
  headers: any;
  fields: CustomIntegrationField[];
  created_at: string;
  updated_at: string;
}

const CustomIntegrationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [integration, setIntegration] = useState<CustomIntegrationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    getCustomIntegrationById(id)
      .then((res) => {
        setIntegration(res.data);
      })
      .catch((err) => {
        setError(err?.message || "Failed to fetch integration details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    setDeleting(true);
    try {
      await deleteCustomIntegration(id);
      // Navigate back to tools list after successful deletion
      navigate("/integration/api");
    } catch (err: any) {
      setError(err?.message || "Failed to delete integration");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-8 text-red-500">{error}</div>
        </div>
      </MainLayout>
    );
  }

  if (!integration) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">Integration not found</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/integration/api")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Button>
        </div>

        {/* Integration Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{integration.name}</h1>
              <p className="text-gray-600 mt-2">{integration.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {integration.is_active ? (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Webhook Configuration */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Webhook Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Webhook URL</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded mt-1 font-mono break-all">
                    {integration.webhook_url}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">HTTP Method</label>
                    <Badge variant="outline" className="mt-1">
                      {integration.http_method}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Content Type</label>
                    <p className="text-sm text-gray-900 mt-1">{integration.content_type}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Timeout
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{integration.timeout_seconds} seconds</p>
                </div>
              </div>
            </Card>

            {/* Fields Configuration */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Fields Configuration
              </h2>
              <div className="space-y-4">
                {integration.fields.map((field) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{field.field_name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{field.field_type}</Badge>
                        {field.is_required && (
                          <Badge className="bg-red-100 text-red-800">Required</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{field.description}</p>
                    {field.field_type === 'enum' && field.enum_values && (
                      <div>
                        <label className="text-xs font-medium text-gray-700">Enum Values:</label>
                        <p className="text-xs text-gray-900 bg-gray-50 p-2 rounded mt-1 font-mono break-all">
                          {field.enum_values}
                        </p>
                      </div>
                    )}
                    {field.default_value && (
                      <div>
                        <label className="text-xs font-medium text-gray-700">Default Value:</label>
                        <p className="text-xs text-gray-900 bg-gray-50 p-2 rounded mt-1">
                          {field.default_value}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Integration Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Integration Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Integration ID</label>
                  <p className="text-xs text-gray-900 bg-gray-50 p-2 rounded mt-1 font-mono break-all">
                    {integration.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(integration.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(integration.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate(`/integration/api/${integration.id}/edit`)}
                >
                  Edit Integration
                </Button>
                <Button className="w-full" variant="outline">
                  Test Webhook
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="destructive">
                      Delete Integration
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Delete Integration
                      </DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete "{integration.name}"? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" disabled={deleting}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CustomIntegrationDetail; 