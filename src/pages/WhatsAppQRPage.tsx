import { useState } from "react";
import MainLayout from "@/main-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import CreateSessionComponent from "@/components/create-session";
import QRCodeDisplay from "@/components/qr-display";

function WhatsAppQRPage() {
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);

  const handleSessionCreated = (data: any) => {
    setSessionData(data);
    setShowQR(true);
  };

  const handleBack = () => {
    setShowQR(false);
    setSessionData(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick= {()=> {navigate("/connected-platforms")}}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Connected Platforms
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              WhatsApp Integration
            </h1>
            <p className="text-muted-foreground">
              {showQR ? "Scan QR code to connect your WhatsApp" : "Buat nama untuk Whatsapp Session"}
            </p>
          </div>

          {!showQR ? (
            <CreateSessionComponent onSessionCreated={handleSessionCreated} />
          ) : (
            <QRCodeDisplay sessionData={sessionData} onBack={handleBack} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default WhatsAppQRPage;
