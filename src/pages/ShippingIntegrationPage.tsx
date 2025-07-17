import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import MainLayout from "@/main-layout";
import { useState, useEffect } from "react";
import { AgentsService } from "@/services/agentsService";
import { RajaOngkirService, type Province, type City, type District } from "@/services/rajaOngkirService";
import type { AIAgent } from "@/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ShippingIntegrationPage() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [courier, setCourier] = useState<string[]>([]);
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [aiAgentId, setAiAgentId] = useState("");
  
  // Removed popover states as we're now using Select components
  
  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [savingIntegration, setSavingIntegration] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [agentsData, provincesData] = await Promise.all([
          AgentsService.getAgents(),
          (async () => {
            setLoadingProvinces(true);
            try {
              return await RajaOngkirService.getProvinces();
            } finally {
              setLoadingProvinces(false);
            }
          })()
        ]);
        
        // Ensure agentsData is always an array
        const safeAgentsData = Array.isArray(agentsData) ? agentsData : [];
        setAiAgents(safeAgentsData);
        
        // Ensure provincesData is always an array
        const safeProvincesData = Array.isArray(provincesData) ? provincesData : [];
        setProvinces(safeProvincesData);
        
        console.log('Loaded provinces:', safeProvincesData);
        console.log('Loaded agents:', safeAgentsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setProvinces([]);
        setAiAgents([]);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Load cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      const loadCities = async () => {
        setLoadingCities(true);
        try {
          const citiesData = await RajaOngkirService.getCities(selectedProvince.id);
          // Ensure citiesData is always an array
          const safeCitiesData = Array.isArray(citiesData) ? citiesData : [];
          setCities(safeCitiesData);
          setSelectedCity(null);
          setSelectedDistrict(null);
          setDistricts([]);
          console.log('Loaded cities for province', selectedProvince.id, ':', safeCitiesData);
        } catch (error) {
          console.error('Error loading cities:', error);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      };
      
      loadCities();
    } else {
      setCities([]);
      setSelectedCity(null);
      setSelectedDistrict(null);
      setDistricts([]);
    }
  }, [selectedProvince]);
  
  // Load districts when city changes
  useEffect(() => {
    if (selectedCity) {
      const loadDistricts = async () => {
        setLoadingDistricts(true);
        try {
          const districtsData = await RajaOngkirService.getDistricts(selectedCity.id);
          // Ensure districtsData is always an array
          const safeDistrictsData = Array.isArray(districtsData) ? districtsData : [];
          setDistricts(safeDistrictsData);
          setSelectedDistrict(null);
          console.log('Loaded districts for city', selectedCity.id, ':', safeDistrictsData);
        } catch (error) {
          console.error('Error loading districts:', error);
          setDistricts([]);
        } finally {
          setLoadingDistricts(false);
        }
      };
      
      loadDistricts();
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
    }
  }, [selectedCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDistrict || !aiAgentId || courier.length === 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSavingIntegration(true);
    
    try {
      // Format couriers as lowercase colon-separated string
      const formattedCouriers = courier.map(c => c.toLowerCase()).join(':');
      
      const requestBody = {
        rajaongkir_enabled: true,
        rajaongkir_origin_district: selectedDistrict.id.toString(),
        rajaongkir_couriers: formattedCouriers
      };
      
      console.log('Submitting integration data:', requestBody);
      
      // Make API call to update agent settings
      await AgentsService.updateAgentSettings(aiAgentId, requestBody);
      
      alert('Integration data saved successfully!');
      
    } catch (error: any) {
      console.error('Error saving integration data:', error);
      alert(error.message || 'Failed to save integration data');
    } finally {
      setSavingIntegration(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto mt-8 bg-white border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Pilih Provinsi</Label>
            <Select
              value={selectedProvince?.id.toString() || ""}
              onValueChange={(value) => {
                const province = provinces.find(p => p.id.toString() === value);
                console.log('Province selected:', value, province);
                setSelectedProvince(province || null);
              }}
              disabled={loadingProvinces}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={loadingProvinces ? "Loading provinces..." : "Pilih provinsi..."} />
              </SelectTrigger>
              <SelectContent>
                {(provinces || []).map((province) => (
                  <SelectItem key={province.id} value={province.id.toString()}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pilih Kota/Kabupaten</Label>
            <Select
              value={selectedCity?.id.toString() || ""}
              onValueChange={(value) => {
                const city = cities.find(c => c.id.toString() === value);
                console.log('City selected:', value, city);
                setSelectedCity(city || null);
              }}
              disabled={!selectedProvince || loadingCities}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={
                  loadingCities
                    ? "Loading cities..."
                    : !selectedProvince
                    ? "Pilih provinsi terlebih dahulu"
                    : "Pilih kota/kabupaten..."
                } />
              </SelectTrigger>
              <SelectContent>
                {(cities || []).map((city) => (
                  <SelectItem key={city.id} value={city.id.toString()}>
                    {city.type} {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pilih Kecamatan</Label>
            <Select
              value={selectedDistrict?.id.toString() || ""}
              onValueChange={(value) => {
                const district = districts.find(d => d.id.toString() === value);
                console.log('District selected:', value, district);
                setSelectedDistrict(district || null);
              }}
              disabled={!selectedCity || loadingDistricts}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={
                  loadingDistricts
                    ? "Loading districts..."
                    : !selectedCity
                    ? "Pilih kota/kabupaten terlebih dahulu"
                    : "Pilih kecamatan..."
                } />
              </SelectTrigger>
              <SelectContent>
                {(districts || []).map((district) => (
                  <SelectItem key={district.id} value={district.id.toString()}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                    ? courier.map((c) => c.toUpperCase()).join(":")
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
                    ? ((aiAgents || []).find(a => a.id === aiAgentId)?.name || "Pilih AI Agent")
                    : "Pilih AI Agent"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[var(--radix-popper-anchor-width)]">
                {(aiAgents || []).map(agent => (
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
            <Button type="submit" className="w-full" disabled={savingIntegration}>
              {savingIntegration ? 'Saving...' : 'Save Integration Data'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
