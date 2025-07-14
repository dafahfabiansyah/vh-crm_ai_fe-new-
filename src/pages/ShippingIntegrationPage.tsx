import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MainLayout from "@/main-layout";
import { useState } from "react";

export default function ShippingIntegrationPage() {
  const [province, setProvince] = useState("");
  const [address, setAddress] = useState("");
  const [courier, setCourier] = useState("");

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
              onChange={e => setProvince(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address">Alamat Pengirim</Label>
            <Input
              id="address"
              placeholder="Masukkan alamat pengirim"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="courier">Pilih Kurir</Label>
            <Select value={courier} onValueChange={setCourier}>
              <SelectTrigger id="courier" className="mt-1 w-full">
                <SelectValue placeholder="Pilih kurir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jne">JNE</SelectItem>
                <SelectItem value="tiki">TIKI</SelectItem>
                <SelectItem value="pos">POS Indonesia</SelectItem>
                <SelectItem value="sicepat">SiCepat</SelectItem>
                <SelectItem value="anteraja">AnterAja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button type="submit" className="w-full">Save Integration Data</Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
