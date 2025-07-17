import MainLayout from "@/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { createCustomIntegration } from "@/services/customIntegrationService";
import axios from 'axios'

interface AiInput {
  name: string;
  type: string;
  description: string;
  enum: string;
  required: boolean;
}

const apiMethods = [
  { value: "POST", label: "POST" },
  { value: "GET", label: "GET" },
];

const CreateApiIntegrationPage = () => {
  const [method, setMethod] = useState("POST");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [webhook, setWebhook] = useState("");
  const [maxCalls, setMaxCalls] = useState("30");
  const [apiKey, setApiKey] = useState("");
  const [payloadType, setPayloadType] = useState("text");
  const [payloadKey, setPayloadKey] = useState("");
  const [payloadValue, setPayloadValue] = useState("");
  const [aiInputs, setAiInputs] = useState<AiInput[]>([]);
  const [triggerCondition, setTriggerCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [testParams, setTestParams] = useState<Record<string, string>>({})
  const [testResult, setTestResult] = useState<string>('')
  const [testLoading, setTestLoading] = useState(false)

  const handleAddInput = () => {
    setAiInputs([
      ...aiInputs,
      {
        name: "",
        type: "text",
        description: "",
        enum: "",
        required: false,
      },
    ]);
  };

  const handleInputChange = (idx: number, field: keyof AiInput, value: any) => {
    setAiInputs(
      aiInputs.map((input, i) =>
        i === idx ? { ...input, [field]: value } : input
      )
    );
  };

  const handleRemoveInput = (idx: number) => {
    setAiInputs(aiInputs.filter((_, i) => i !== idx));
  };

  const handleCreateTool = async () => {
    setLoading(true);
    try {
      const payload = {
        name,
        description,
        webhook_url: webhook,
        http_method: method as "POST" | "GET",
        max_tool_calls: Number(maxCalls),
        api_key: apiKey,
        trigger_condition: triggerCondition,
        fields: aiInputs.map((input) => ({
          field_name: input.name,
          field_type: input.type as
            | "text"
            | "number"
            | "boolean"
            | "email"
            | "url"
            | "date"
            | "enum",
          description: input.description,
          enum_values: input.type === "enum" ? input.enum : undefined,
          is_required: input.required,
        })),
      };
      await createCustomIntegration(payload);
      alert("Tool created successfully!");
      // Optionally reset form or redirect
    } catch (e) {
      alert("Failed to create tool!");
    } finally {
      setLoading(false);
    }
  };

  const handleTestParamChange = (name: string, value: string) => {
    setTestParams(prev => ({ ...prev, [name]: value }))
  }

  const handleSendTestRequest = async () => {
    setTestLoading(true)
    setTestResult('')
    try {
      let url = webhook
      let data: any = {}
      let params: any = {}
      aiInputs.forEach(input => {
        if (method === 'GET') {
          params[input.name] = testParams[input.name] || ''
        } else {
          data[input.name] = testParams[input.name] || ''
        }
      })
      const config = {
        method: method as 'POST' | 'GET',
        url,
        params: method === 'GET' ? params : undefined,
        data: method === 'POST' ? data : undefined,
      }
      const res = await axios(config)
      setTestResult(JSON.stringify(res.data, null, 2))
    } catch (e: any) {
      setTestResult(e?.response ? JSON.stringify(e.response.data, null, 2) : e.message)
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="p-0 min-h-screen bg-gray-50">
        {/* Back to tools */}
        <div className="max-w-6xl mx-auto pt-6 pb-2 px-2">
          <Button
            variant="outline"
            size="sm"
            className="mb-2"
            onClick={() => window.history.back()}
          >
            ← Back to tools
          </Button>
        </div>
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 px-2 pb-10">
          {/* Left: Form */}
          <div className="bg-white rounded-lg p-6 flex flex-col gap-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Create Tool</h2>
              <div className="flex gap-2">
                <Button variant="secondary">Cancel</Button>
                <Button className="bg-primary text-white">Save</Button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">
                    HTTP Method
                  </label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {apiMethods.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-1/2"></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description <span className="text-gray-400">?</span>
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Webhook Address <span className="text-gray-400">?</span>
                </label>
                <Input
                  value={webhook}
                  onChange={(e) => setWebhook(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Trigger Condition <span className="text-gray-400">?</span>
                </label>
                <Textarea
                  value={triggerCondition}
                  onChange={(e) => setTriggerCondition(e.target.value)}
                  placeholder="When customer asks about..."
                />
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">
                    Max Tool Calls
                  </label>
                  <Input
                    value={maxCalls}
                    onChange={(e) => setMaxCalls(e.target.value)}
                    type="number"
                  />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium mb-1">
                    API Key (Bearer) <span className="text-gray-400">?</span>
                  </label>
                  <div className="flex gap-2">
                    <Select value="Authorization" onValueChange={() => {}}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Authorization">
                          Authorization
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  AI Inputs <span className="text-gray-400">?</span>
                </label>
                {aiInputs.map((input, idx) => (
                  <div key={idx} className="bg-gray-50 border rounded p-4 mb-4">
                    <div className="flex gap-4 mb-2">
                      <div className="w-1/2">
                        <label className="block text-xs font-medium mb-1">
                          Name
                        </label>
                        <Input
                          value={input.name}
                          onChange={(e) =>
                            handleInputChange(idx, "name", e.target.value)
                          }
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-xs font-medium mb-1">
                          Type
                        </label>
                        <Select
                          value={input.type}
                          onValueChange={(val) =>
                            handleInputChange(idx, "type", val)
                          }
                        >
                          <SelectTrigger className="w-full">
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
                    <div className="mb-2">
                      <label className="block text-xs font-medium mb-1">
                        Description
                      </label>
                      <Textarea
                        value={input.description}
                        onChange={(e) =>
                          handleInputChange(idx, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-xs font-medium mb-1">
                        Enum (comma separated){" "}
                        <span className="text-gray-400">?</span>
                      </label>
                      <Textarea
                        value={input.enum}
                        onChange={(e) =>
                          handleInputChange(idx, "enum", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id={`required-${idx}`}
                        checked={input.required}
                        onChange={(e) =>
                          handleInputChange(idx, "required", e.target.checked)
                        }
                        className="mr-2"
                      />
                      <label htmlFor={`required-${idx}`} className="text-xs">
                        Required
                      </label>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-auto"
                        onClick={() => handleRemoveInput(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="default"
                  className="mt-2 bg-primary"
                  type="button"
                  onClick={handleAddInput}
                >
                  Add Inputs
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Additional Payload
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Key"
                    value={payloadKey}
                    onChange={(e) => setPayloadKey(e.target.value)}
                    className="w-1/2"
                  />
                  <Select value={payloadType} onValueChange={setPayloadType}>
                    <SelectTrigger className="w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="object">Object</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="secondary" size="sm">
                    Add Custom Payload
                  </Button>
                  <Button variant="secondary" size="sm">
                    Add Contact Info
                  </Button>
                </div>
                <Textarea
                  placeholder="Payload value..."
                  value={payloadValue}
                  onChange={(e) => setPayloadValue(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="w-full mt-4 bg-primary text-white"
              onClick={handleCreateTool}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Tool"}
            </Button>
          </div>
          {/* Right: Preview/Request */}
          <div className="bg-gray-900 rounded-lg p-6 flex flex-col gap-4 border border-gray-800 min-h-[300px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500 text-xs px-2 py-0.5 rounded">{method}</span>
              <Input
                value={webhook}
                readOnly
                className="bg-gray-800 text-white font-mono border-none p-1 h-8 opacity-80 cursor-not-allowed"
                placeholder="Webhook address..."
              />
            </div>
            <div className="text-xs text-gray-400 mb-1">POST Body</div>
            <div className="bg-gray-800 rounded p-4 font-mono text-sm text-white mb-2 relative">
              {'{'}
              <br />
              &nbsp;&nbsp;"kota": <input
                type="text"
                className="bg-gray-500 text-green-100 px-2 py-1 rounded border-none outline-none font-mono"
                style={{ minWidth: 120, display: 'inline-block' }}
                value={testParams['kota'] || ''}
                onChange={e => handleTestParamChange('kota', e.target.value)}
              />
              <br />
              <span className="text-gray-400 text-xs">&nbsp;&nbsp;nama kota atau nama kecamatan. jika client menjawab selain nama kota pastikan wilayah tersebut dari kota mana.</span>
              <br />
              {'}'}
            </div>
            {/* <Button
              className="self-end bg-primary"
              onClick={handleSendTestRequest}
              disabled={!address || aiInputs.some(i => i.required && !testParams[i.name]) || testLoading}
            >
              {testLoading ? 'Testing...' : 'Send Request'}
            </Button> */}
            {/* {testResult && (
              <pre className="bg-gray-800 text-green-300 rounded p-4 mt-2 overflow-x-auto text-xs max-h-60">{testResult}</pre>
            )} */}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateApiIntegrationPage;
