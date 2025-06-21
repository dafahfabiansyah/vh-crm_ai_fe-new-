import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import whatsappService from "@/services/whatsappService";
import type { WhatsAppQRCodeProps, WhatsAppQRCodeData } from "@/types";
import type { WhatsAppStatusResponse } from "@/services/whatsappService";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  setConnectionData,
  setSessionId,
  setDeviceId as setWhatsAppDeviceId,
  setError as setWhatsAppError,
  clearError,
  selectWhatsAppConnectionData,
} from "@/store/whatsappSlice";

const WhatsAppQRCode = ({
  onDeviceConnected,
  onError,
}: WhatsAppQRCodeProps) => {
  const dispatch = useAppDispatch();
  const connectionData = useAppSelector(selectWhatsAppConnectionData);
  
  const [qrData, setQrData] = useState<WhatsAppQRCodeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [deviceId, setDeviceId] = useState<string>(connectionData.deviceId || "");
  const [status, setStatus] = useState<WhatsAppStatusResponse["data"] | null>(
    null
  );

  // Generate a unique device ID
  const generateDeviceId = () => {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Calculate time left until expiration
  useEffect(() => {
    if (qrData?.expires_at) {
      const interval = setInterval(() => {
        const expiresAt = new Date(qrData.expires_at).getTime();
        const now = new Date().getTime();
        const difference = expiresAt - now;

        if (difference > 0) {
          setTimeLeft(Math.floor(difference / 1000));
        } else {
          setTimeLeft(0);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [qrData?.expires_at]);
  // Format time remaining
  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };  // Check WhatsApp status
  const checkStatus = useCallback(
    async (device_id: string) => {
      try {
        const response = await whatsappService.getStatus(device_id);

        if (response.success && response.data) {
          setStatus(response.data);

          // Dispatch to Redux store
          dispatch(setConnectionData({ 
            statusData: response.data,
            sessionId: qrData?.session_id 
          }));

          // Clear any existing errors
          dispatch(clearError());

          // If connected and logged in, notify parent
          if (response.data.is_connected && response.data.is_logged_in) {
            onDeviceConnected?.(device_id);
            console.log("✅ WhatsApp connected successfully:", response.data);
          }
        }
      } catch (err: any) {
        console.error("❌ Status check error:", err);
        const errorMessage = err.response?.data?.message || err.message || "Status check failed";
        dispatch(setWhatsAppError(errorMessage));
        // Don't show error for status checks, just log it
      }
    },
    [onDeviceConnected, dispatch, qrData?.session_id]
  );
  // Remove automatic polling - only check status manually
  // useEffect(() => {
  //   if (qrData?.device_id && !status?.is_logged_in) {
  //     setIsPolling(true);

  //     const interval = setInterval(() => {
  //       checkStatus(qrData.device_id);
  //     }, 3000); // Check every 3 seconds

  //     return () => {
  //       clearInterval(interval);
  //       setIsPolling(false);
  //     };
  //   }
  // }, [qrData?.device_id, status?.is_logged_in, checkStatus]);  // Fetch QR code
  const fetchQRCode = useCallback(async () => {
    setLoading(true);
    setError(null);
    dispatch(clearError());

    try {
      // Generate or use existing device ID
      const currentDeviceId = deviceId || generateDeviceId();
      setDeviceId(currentDeviceId);
        // Update device ID in Redux
      dispatch(setWhatsAppDeviceId(currentDeviceId));

      console.log("🔄 Requesting QR code with device ID:", currentDeviceId);

      const response = await whatsappService.getQRCode(currentDeviceId);

      console.log("📱 WhatsApp QR response:", response);

      if (response.success && response.data) {
        setQrData(response.data);
        setStatus(null); // Reset status when getting new QR
        
        // Store session ID in Redux
        dispatch(setSessionId(response.data.session_id));
        
        console.log("✅ QR code data set:", response.data);
      } else {
        throw new Error(response.message || "Failed to generate QR code");
      }
    } catch (err: any) {
      console.error("❌ WhatsApp QR error:", err);
      let errorMessage = "Failed to generate QR code";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      dispatch(setWhatsAppError(errorMessage));
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [deviceId, onError, dispatch]);// Manual fetch QR code on component mount (not automatic)
  useEffect(() => {
    console.log("🚀 WhatsApp QR Component mounted");
    // Don't auto-fetch, let user click to generate QR
  }, []);

  if (loading && !qrData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Smartphone className="h-5 w-5" />
            WhatsApp Connection
          </CardTitle>
          <CardDescription>Generating QR code...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-64 w-64" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          WhatsApp Connection
        </CardTitle>
        <CardDescription>
          Scan the QR code with WhatsApp to connect your device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generate QR Button if no QR data */}
        {!qrData && !loading && (
          <div className="text-center space-y-4">
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Smartphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                Generate QR code to connect WhatsApp
              </p>
              <Button onClick={fetchQRCode} disabled={loading}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Generate QR Code
              </Button>
            </div>
          </div>
        )}

        {qrData && (
          <>
            {" "}
            {/* QR Code Display */}
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              {qrData.qr_code_image ? (
                <img
                  src={qrData.qr_code_image}
                  alt="WhatsApp QR Code"
                  className="w-64 h-64 object-contain"
                  onError={(e) => {
                    console.error("QR code image failed to load:", e);
                    // Hide image and show SVG fallback
                    e.currentTarget.style.display = "none";
                    const svgContainer =
                      e.currentTarget.parentElement?.querySelector(
                        ".qr-svg-fallback"
                      );
                    if (svgContainer) {
                      (svgContainer as HTMLElement).style.display = "block";
                    }
                  }}
                />
              ) : null}

              {/* SVG Fallback - always render but hide if image exists */}
              <div
                className={`qr-svg-fallback ${
                  qrData.qr_code_image ? "hidden" : "block"
                }`}
              >
                {qrData.qr_code ? (
                  <QRCodeSVG
                    value={qrData.qr_code}
                    size={256}
                    level="M"
                    includeMargin={true}
                    className="border rounded"
                  />
                ) : (
                  <div className="w-64 h-64 border rounded flex items-center justify-center bg-gray-50">
                    <div className="text-center text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No QR code data</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Instructions */}
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {qrData.instructions}
              </AlertDescription>
            </Alert>{" "}
            {/* Status and Timer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {status ? (
                  <Badge
                    variant={status.is_logged_in ? "default" : "outline"}
                    className={
                      status.is_logged_in
                        ? "text-green-600 border-green-600 bg-green-50"
                        : status.is_connected
                        ? "text-blue-600 border-blue-600 bg-blue-50"
                        : "text-orange-600 border-orange-600"
                    }
                  >
                    {status.is_logged_in
                      ? "Connected & Logged In"
                      : status.is_connected
                      ? "Connected"
                      : "Waiting for scan"}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-600"
                  >
                    Waiting for scan
                  </Badge>
                )}
              </div>

              {status?.phone_number && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Phone:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {status.phone_number}
                  </code>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Device ID:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {qrData.device_id}
                </code>
              </div>

              {status?.device_name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Device Name:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {status.device_name}
                  </code>
                </div>
              )}

              {timeLeft !== null && timeLeft > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Expires in:
                  </span>
                  <Badge variant="secondary">{formatTimeLeft(timeLeft)}</Badge>
                </div>
              )}

              {timeLeft === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    QR code has expired. Please generate a new one.
                  </AlertDescription>
                </Alert>
              )}
            </div>{" "}
            {/* Action Buttons */}
            <div className="flex gap-2">
              {!status?.is_logged_in ? (
                <>
                  <Button
                    onClick={fetchQRCode}
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh QR
                  </Button>

                  <Button
                    onClick={() => checkStatus(qrData.device_id)}
                    variant="default"
                    className="flex-1"
                    disabled={loading}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        loading ? "animate-spin" : ""
                      }`}
                    />
                    Check Status
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => onDeviceConnected?.(qrData.device_id)}
                  variant="default"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Connection Success
                </Button>
              )}
            </div>
            {/* Success Message */}
            {status?.is_logged_in && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  WhatsApp has been successfully connected! You can now close
                  this window.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppQRCode;
