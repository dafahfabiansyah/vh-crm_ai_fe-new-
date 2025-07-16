import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MainLayout from "@/main-layout";
import { useState, useEffect } from "react";
import { AgentsService } from "@/services/agentsService";
import type { AIAgent } from "@/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function ShippingIntegrationPage() {
  const [province, setProvince] = useState("");
  const [address, setAddress] = useState("");
  const [courier, setCourier] = useState<string[]>([]);
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [aiAgentId, setAiAgentId] = useState("");

  useEffect(() => {
    AgentsService.getAgents().then(setAiAgents);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle save logic here
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto mt-8 bg-white border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="province">Cari Provinsi</Label>
            <Input
              id="province"
              placeholder="Masukkan nama provinsi"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address">Alamat Pengirim</Label>
            <Input
              id="address"
              placeholder="Masukkan alamat pengirim"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="courier">Pilih Kurir</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-1 w-full justify-between"
                  id="courier"
                  type="button"
                >
                  {courier.length > 0
                    ? courier.map((c) => c.toUpperCase()).join("; ")
                    : "Pilih kurir"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[var(--radix-popper-anchor-width)]">
                {[
                  { value: "jne", label: "JNE" },
                  { value: "tiki", label: "TIKI" },
                  { value: "pos", label: "POS Indonesia" },
                  { value: "sicepat", label: "SiCepat" },
                  { value: "anteraja", label: "AnterAja" },
                ].map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={courier.includes(option.value)}
                    onCheckedChange={(checked) => {
                      setCourier((prev) =>
                        checked
                          ? [...prev, option.value]
                          : prev.filter((c) => c !== option.value)
                      );
                    }}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <Label htmlFor="ai-agent">Pilih AI Agent</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-1 w-full justify-between"
                  id="ai-agent"
                  type="button"
                >
                  {aiAgentId
                    ? (aiAgents.find(a => a.id === aiAgentId)?.name || "Pilih AI Agent")
                    : "Pilih AI Agent"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[var(--radix-popper-anchor-width)]">
                {aiAgents.map(agent => (
                  <DropdownMenuItem
                    key={agent.id}
                    onSelect={() => setAiAgentId(agent.id)}
                  >
                    {agent.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <Button type="submit" className="w-full">
              Save Integration Data
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
