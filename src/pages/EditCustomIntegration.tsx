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
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import {
  getCustomIntegrationById,
  editCustomIntegration,
  type CustomIntegrationPayload,
} from "@/services/customIntegrationService";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
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
    max_tool_calls: 1,
    api_key: "",
    trigger_condition: "",
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
          max_tool_calls: 1,
          api_key: "",
          trigger_condition: "",
          fields: data.fields.map(
            (field: {
              field_name: string;
              field_type: string;
              description: string;
              enum_values: string;
              is_required: boolean;
            }) => ({
              field_name: field.field_name,
              field_type: field.field_type as any,
              description: field.description,
              enum_values: field.enum_values,
              is_required: field.is_required,
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

  const handleFieldChange = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      ),
    }));
  };

  const addField = () => {
    setFormData((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          field_name: "",
          field_type: "text",
          description: "",
          enum_values: "",
          is_required: false,
        },
      ],
    }));
  };

  const removeField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
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

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Integration
            </h1>
            <p className="text-gray-600 mt-2">
              Update your custom integration settings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
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
            </Card>

            {/* Webhook Configuration */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Webhook Configuration
              </h2>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="max_tool_calls">Max Tool Calls</Label>
                    <Input
                      id="max_tool_calls"
                      type="number"
                      value={formData.max_tool_calls}
                      onChange={(e) =>
                        handleInputChange(
                          "max_tool_calls",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    value={formData.api_key}
                    onChange={(e) =>
                      handleInputChange("api_key", e.target.value)
                    }
                    placeholder="Enter API key"
                    type="password"
                  />
                </div>
                <div>
                  <Label htmlFor="trigger_condition">Trigger Condition</Label>
                  <Textarea
                    id="trigger_condition"
                    value={formData.trigger_condition}
                    onChange={(e) =>
                      handleInputChange("trigger_condition", e.target.value)
                    }
                    placeholder="Enter trigger condition"
                  />
                </div>
              </div>
            </Card>

            {/* Fields Configuration */}
            <Card className="p-6">
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
            </Card>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/integration/api/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditCustomIntegration;
