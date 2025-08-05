import { whatsappService } from "@/services";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, Loader2, QrCode, Smartphone } from "lucide-react";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { useToast } from "@/hooks";

// QR Code Display Component
const QRCodeDisplay = ({ sessionData }: { sessionData: any; onBack: () => void }) => {
  const [currentStatus, setCurrentStatus] = useState(sessionData.status);
  const [isChecking, setIsChecking] = useState(false);
  const { success, error: showError } = useToast();

  // Polling otomatis setiap 5 detik
  useEffect(() => {
    if (currentStatus === "ready") return; // Stop polling jika sudah ready
    const interval = setInterval(async () => {
      try {
        const statusResponse = await whatsappService.getStatus(sessionData.session);
        setCurrentStatus(statusResponse.status);
        if (statusResponse.status === "ready") {
          success("WhatsApp berhasil terhubung!");
        }
      } catch (error) {
        // Optional: handle error silently
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentStatus, sessionData.session, success]);

  // Manual check status function
  const handleCheckStatus = async () => {
    try {
      setIsChecking(true);
      const statusResponse = await whatsappService.getStatus(sessionData.session);
      setCurrentStatus(statusResponse.status);
      
      if (statusResponse.status === "ready") {
        // Tampilkan notifikasi sukses
        success("WhatsApp berhasil terhubung!");
      }
    } catch (error) {
      console.error("Error checking status:", error);
      showError("Gagal mengecek status. Silakan coba lagi.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            WhatsApp QR Code
          </CardTitle>
          <CardDescription>
            {currentStatus === "ready" ? "WhatsApp berhasil terhubung!" : "Pindai kode QR ini dengan aplikasi seluler WhatsApp Anda"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStatus !== "ready" && (
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg border">
                <img 
                  src={sessionData.qr} 
                  alt="WhatsApp QR Code" 
                  className="w-48 h-48 object-contain"
                />
              </div>
            </div>
          )}
          
          {currentStatus === "ready" && (
            <div className="flex justify-center">
              <div className="bg-green-50 p-8 rounded-lg border border-green-200">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <p className="text-center text-green-800 font-medium">
                  WhatsApp Successfully Connected!
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Session:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{sessionData.session}</code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex items-center gap-2">
                <Badge variant={currentStatus === "ready" ? "default" : "secondary"}>
                  {currentStatus}
                </Badge>
                {isChecking && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>
            </div>
          </div>
          
          {currentStatus !== "ready" && (
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                <strong>Instruksi:</strong><br />
                1. Buka WhatsApp di ponsel Anda<br />
                2. Buka Pengaturan → Perangkat yang Ditautkan<br />
                3. Klik "Tautkan Perangkat<br />
                4. Pindai kode QR ini
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2">
            {/* <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button> */}
            {currentStatus !== "ready" && (
              <>
                <Button 
                  variant="default" 
                  onClick={handleCheckStatus}
                  disabled={isChecking}
                  className="flex-1"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengecek...
                    </>
                  ) : (
                    "Cek Status"
                  )}
                </Button>
                {/* <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()} 
                  className="flex-1"
                >
                  Refresh QR
                </Button> */}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeDisplay;