import MainLayout from "@/main-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import {
  getCustomIntegrationById,
  editCustomIntegration,
  type CustomIntegrationPayload,
  type CustomIntegrationHeader,
} from "@/services/customIntegrationService";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

interface CustomIntegrationDetail {
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

const EditCustomIntegration = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [integration, setIntegration] =
    useState<CustomIntegrationDetail | null>(null);

  // Form state
  const [formData, setFormData] = useState<CustomIntegrationPayload>({
    name: "",
    description: "",
    webhook_url: "",
    http_method: "POST",
    content_type: "application/json",
    timeout_seconds: 30,
    is_active: true,
    headers: [],
    fields: [],
  });

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);
    getCustomIntegrationById(id)
      .then((res) => {
        const data = res.data;
        setIntegration(data);
        // Pre-fill form with existing data
        setFormData({
          name: data.name,
          description: data.description,
          webhook_url: data.webhook_url,
          http_method: data.http_method as "POST" | "GET",
          content_type: data.content_type || "application/json",
          timeout_seconds: data.timeout_seconds || 30,
          is_active: data.is_active,
          headers: Array.isArray(data.headers) ? data.headers : [],
          fields: data.fields.map(
            (field: {
              field_name: string;
              field_type: string;
              description: string;
              enum_values: string;
              is_required: boolean;
              display_order?: number;
            }) => ({
              field_name: field.field_name,
              field_type: field.field_type,
              description: field.description,
              enum_values: field.enum_values,
              is_required: field.is_required,
              display_order: field.display_order || 1,
            })
          ),
        });
      })
      .catch((err) => {
        setError(err?.message || "Failed to fetch integration details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleInputChange = (
    field: keyof CustomIntegrationPayload,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Header management functions
  const addHeader = () => {
    setFormData((prev) => ({
      ...prev,
      headers: [...(prev.headers || []), { header_name: "", header_value: "" }],
    }));
  };

  const removeHeader = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      headers: (prev.headers || []).filter((_, i) => i !== index),
    }));
  };

  const handleHeaderChange = (index: number, field: keyof CustomIntegrationHeader, value: string) => {
    setFormData((prev) => ({
      ...prev,
      headers: (prev.headers || []).map((header, i) => 
        i === index ? { ...header, [field]: value } : header
      ),
    }));
  };

  // Field management functions
  const addField = () => {
    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, {
        field_name: "",
        field_type: "text",
        description: "",
        enum_values: "",
        is_required: false,
        display_order: prev.fields.length + 1,
      }],
    }));
  };

  const removeField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (index: number, field: keyof CustomIntegrationField, value: any) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    try {
      await editCustomIntegration(id, formData);
      toast.success("Integration updated successfully!");
      navigate(`/integration/api/${id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update integration");
    } finally {
      setSaving(false);
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
          <div className="text-center py-8 text-gray-500">
            Integration not found
          </div>
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
            onClick={() => navigate(`/integration/api/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Details
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (Form) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Integration Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter integration name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Enter description"
                      required
                    />
                  </div>
                </div>
              </form>
            </Card>
            {/* Webhook Configuration */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Webhook Configuration</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook_url">Webhook URL</Label>
                    <Input
                      id="webhook_url"
                      value={formData.webhook_url}
                      onChange={(e) =>
                        handleInputChange("webhook_url", e.target.value)
                      }
                      placeholder="https://example.com/webhook"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="http_method">HTTP Method</Label>
                      <Select
                        value={formData.http_method}
                        onValueChange={(value) =>
                          handleInputChange("http_method", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="GET">GET</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="content_type">Content Type</Label>
                      <Select
                        value={formData.content_type}
                        onValueChange={(value) =>
                          handleInputChange("content_type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="application/json">application/json</SelectItem>
                          <SelectItem value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</SelectItem>
                          <SelectItem value="text/plain">text/plain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeout_seconds">Timeout (seconds)</Label>
                      <Input
                        id="timeout_seconds"
                        type="number"
                        value={formData.timeout_seconds}
                        onChange={(e) =>
                          handleInputChange(
                            "timeout_seconds",
                            parseInt(e.target.value)
                          )
                        }
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        handleInputChange("is_active", checked)
                      }
                    />
                    <Label htmlFor="is_active">Active Integration</Label>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Headers</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addHeader}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Header
                      </Button>
                    </div>
                    {formData.headers?.map((header, index) => (
                       <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                         <Input
                           placeholder="Header Name"
                           value={header.header_name}
                           onChange={(e) =>
                             handleHeaderChange(index, "header_name", e.target.value)
                           }
                         />
                         <div className="flex gap-2">
                           <Input
                             placeholder="Header Value"
                             value={header.header_value}
                             onChange={(e) =>
                               handleHeaderChange(index, "header_value", e.target.value)
                             }
                           />
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={() => removeHeader(index)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                     ))}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Fields</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addField}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Field
                      </Button>
                    </div>
                    {formData.fields?.map((field, index) => (
                      <div key={index} className="border p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <Label>Field Name</Label>
                            <Input
                              placeholder="Field Name"
                              value={field.field_name}
                              onChange={(e) =>
                                handleFieldChange(index, "field_name", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label>Field Type</Label>
                            <Select
                              value={field.field_type}
                              onValueChange={(value) =>
                                handleFieldChange(index, "field_type", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="enum">Enum</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <Label>Description</Label>
                            <Input
                              placeholder="Field Description"
                              value={field.description}
                              onChange={(e) =>
                                handleFieldChange(index, "description", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label>Display Order</Label>
                            <Input
                              type="number"
                              placeholder="Display Order"
                              value={field.display_order}
                              onChange={(e) =>
                                handleFieldChange(index, "display_order", parseInt(e.target.value))
                              }
                            />
                          </div>
                        </div>
                        {field.field_type === "enum" && (
                          <div className="mb-2">
                            <Label>Enum Values (comma-separated)</Label>
                            <Input
                              placeholder="low,medium,high"
                              value={field.enum_values}
                              onChange={(e) =>
                                handleFieldChange(index, "enum_values", e.target.value)
                              }
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`required-${index}`}
                              checked={field.is_required}
                              onCheckedChange={(checked) =>
                                handleFieldChange(index, "is_required", checked)
                              }
                            />
                            <Label htmlFor={`required-${index}`}>Required Field</Label>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeField(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove Field
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </Card>
            {/* Fields Configuration */}
            {/* <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Fields Configuration</h2>
                <Button
                  type="button"
                  onClick={addField}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {formData.fields.map((field, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Field {index + 1}</h3>
                        <Button
                          type="button"
                          onClick={() => removeField(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Field Name</Label>
                          <Input
                            value={field.field_name}
                            onChange={(e) =>
                              handleFieldChange(
                                index,
                                "field_name",
                                e.target.value
                              )
                            }
                            placeholder="Enter field name"
                            required
                          />
                        </div>
                        <div>
                          <Label>Field Type</Label>
                          <Select
                            value={field.field_type}
                            onValueChange={(value) =>
                              handleFieldChange(index, "field_type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="url">URL</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="enum">Enum</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>Description</Label>
                        <Textarea
                          value={field.description}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Enter field description"
                          required
                        />
                      </div>
                      {field.field_type === "enum" && (
                        <div className="mt-4">
                          <Label>Enum Values (comma-separated)</Label>
                          <Textarea
                            value={field.enum_values}
                            onChange={(e) =>
                              handleFieldChange(
                                index,
                                "enum_values",
                                e.target.value
                              )
                            }
                            placeholder="value1,value2,value3"
                          />
                        </div>
                      )}
                      <div className="mt-4 flex items-center space-x-2">
                        <Switch
                          id={`required-${index}`}
                          checked={field.is_required}
                          onCheckedChange={(checked) =>
                            handleFieldChange(index, "is_required", checked)
                          }
                        />
                        <Label htmlFor={`required-${index}`}>
                          Required field
                        </Label>
                      </div>
                    </div>
                  ))}
                  {formData.fields.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No fields configured. Click "Add Field" to get started.
                    </div>
                  )}
                </div>
              </form>
            </Card> */}
          </div>
          {/* Sidebar (Info & Actions) */}
          <div className="space-y-6">
            {/* Integration Info */}
            {integration && (
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
            )}
            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  type="submit"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  type="button"
                  onClick={() => navigate(`/integration/api/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditCustomIntegration;
