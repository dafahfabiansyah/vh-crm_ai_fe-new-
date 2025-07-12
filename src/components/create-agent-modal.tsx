import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { AgentsService } from "@/services/agentsService";
import type { AIAgent } from "@/types";

const AGENT_TEMPLATES = {
  customer_service: {
    id: "customer_service",
    name: "Customer Service",
    description: "Layanan pelanggan - keluhan, pertanyaan, bantuan umum",
    settings: {
      behaviour:
        "You are a helpful and friendly customer service AI. Always be polite, professional, and empathetic. Listen carefully to customer concerns and provide clear, helpful solutions. If you cannot solve a problem, escalate it to a human agent. Always ask follow-up questions to ensure customer satisfaction.",
      welcome_message:
        "Halo! Selamat datang di layanan pelanggan kami. Saya siap membantu Anda dengan pertanyaan atau keluhan. Ada yang bisa saya bantu hari ini?",
      transfer_condition:
        "Transfer to human agent when: customer requests to speak with human, has complex technical issues that require specialized knowledge, expresses strong dissatisfaction that requires human intervention, or asks for refund/cancellation beyond AI authority",
      model: "gpt-4.1",
      history_limit: 15,
      context_limit: 2000,
      message_await: 30,
      message_limit: 20,
    },
  },
  admin_sales: {
    id: "admin_sales",
    name: "Admin Sales",
    description: "Admin penjualan - produk, harga, pemesanan",
    settings: {
      behaviour:
        "You are a professional sales admin AI. Focus on helping customers with product inquiries, pricing information, order processing, and sales-related questions. Be persuasive but not pushy, provide accurate product information, and guide customers through the purchasing process. Always upsell appropriately and handle objections professionally.",
      welcome_message:
        "Halo! Saya admin sales yang siap membantu Anda dengan pertanyaan produk dan pemesanan. Apakah Anda sedang mencari produk tertentu atau ingin informasi lebih lanjut tentang penawaran kami?",
      transfer_condition:
        "Transfer to human sales agent when: customer wants to negotiate prices for bulk orders, has complex customization requests, requests detailed product demonstrations, or asks for special payment terms that require approval",
      model: "gpt-4.1",
      history_limit: 20,
      context_limit: 2500,
      message_await: 25,
      message_limit: 25,
    },
  },
};

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAgent?: AIAgent) => void;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setRajaongkirEnabled] = useState(false);
  const [, setRajaongkirOriginCity] = useState("");
  const [, setRajaongkirCouriers] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName || !agentDescription || !selectedTemplate) return;

    try {
      setLoading(true);
      setError(null);

      // Get selected template settings
      const templateSettings = AGENT_TEMPLATES[
        selectedTemplate as keyof typeof AGENT_TEMPLATES
      ]?.settings || {
        behaviour: "You are a helpful AI assistant",
        welcome_message: "Hello! How can I help you today?",
        transfer_condition: "Transfer when customer requests human assistance",
        model: "gpt-4.1",
        history_limit: 10,
        context_limit: 1000,
        message_await: 30,
        message_limit: 15,
      };

      // Create agent with selected template settings
      const settings = {
        ...templateSettings,
        rajaongkir_enabled: false,
        rajaongkir_origin_city: "23",
        rajaongkir_couriers: ["jne"],
      };
      const newAgent = await AgentsService.createAgent({
        name: agentName,
        description: agentDescription,
        settings,
      });

      // Reset form
      setAgentName("");
      setAgentDescription("");
      setSelectedTemplate("");

      // Close modal and notify parent with new agent
      onClose();
      onSuccess(newAgent);
    } catch (err: any) {
      console.error("Error creating agent:", err);
      setError(err.message || "Failed to create agent");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAgentName("");
    setAgentDescription("");
    setSelectedTemplate("");
    setRajaongkirEnabled(false);
    setRajaongkirOriginCity("");
    setRajaongkirCouriers([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Buat AI Agent Baru
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Agent Name Field */}
          <div className="space-y-2">
            <Label htmlFor="agentName" className="text-sm font-medium">
              Nama Agent
            </Label>
            <Input
              id="agentName"
              placeholder="Masukkan nama untuk AI agent Anda"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full"
              disabled={loading}
            />
          </div>

          {/* Agent Description Field */}
          <div className="space-y-2">
            <Label htmlFor="agentDescription" className="text-sm font-medium">
              Deskripsi Agent
            </Label>
            <Textarea
              id="agentDescription"
              placeholder="Masukkan deskripsi singkat tentang AI agent Anda"
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              className="w-full"
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Template Selection Field */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Template Agent</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih template untuk AI agent Anda" />
              </SelectTrigger>
              <SelectContent className="w-full max-w-[calc(100vw-2rem)] sm:min-w-[400px]">
                {Object.entries(AGENT_TEMPLATES).map(([key, template]) => (
                  <SelectItem
                    key={key}
                    value={key}
                    className="w-full py-3 px-3"
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="font-medium text-sm">
                        {template.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 border rounded-lg text-sm space-y-4">
                <div>
                  <span className="font-medium text-gray-800 block mb-2">
                    Welcome Message:
                  </span>
                  <p className="text-gray-600 italic text-sm leading-relaxed bg-white p-3 rounded border-l-4 border-blue-200">
                    "
                    {
                      AGENT_TEMPLATES[
                        selectedTemplate as keyof typeof AGENT_TEMPLATES
                      ]?.settings.welcome_message
                    }
                    "
                  </p>
                </div>
                <div className="flex items-center gap-4 pb-3 border-b">
                  <div>
                    <span className="font-medium text-gray-800">
                      Description:
                    </span>
                    <span className="ml-2 text-gray-600 bg-blue-100 px-2 py-1 rounded text-xs font-mono">
                      {
                        AGENT_TEMPLATES[
                          selectedTemplate as keyof typeof AGENT_TEMPLATES
                        ]?.description
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={
              !agentName || !agentDescription || !selectedTemplate || loading
            }
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Membuat Agent...
              </>
            ) : (
              "Buat Agent"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentModal;
