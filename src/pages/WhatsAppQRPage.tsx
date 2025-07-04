import { useState, useEffect } from "react";
import MainLayout from "@/main-layout";
import WhatsAppQRCode from "@/components/whatsapp-qr-code";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Smartphone,
  ArrowLeft,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAppSelector } from "@/hooks/redux";
import {
  selectWhatsAppConnectionData,
  selectWhatsAppConnectionStatus,
  selectWhatsAppError,
} from "@/store/whatsappSlice";

const WhatsAppQRPage = () => {
  const navigate = useNavigate();

  // Get WhatsApp data from Redux store
  const connectionData = useAppSelector(selectWhatsAppConnectionData);
  const connectionStatus = useAppSelector(selectWhatsAppConnectionStatus);
  const reduxError = useAppSelector(selectWhatsAppError);

  // Local state for backward compatibility
  const [errorMessage, setErrorMessage] = useState<string | null>(reduxError);

  // Sync Redux error with local state
  useEffect(() => {
    setErrorMessage(reduxError);
  }, [reduxError]);
  const handleDeviceConnected = (deviceId: string) => {
    setErrorMessage(null);
    console.log("Device connected:", deviceId);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-green-600" />
                WhatsApp Integration
              </h1>
              <p className="text-gray-600 mt-1">
                Connect your WhatsApp Business account to manage conversations
              </p>
            </div>
          </div>{" "}
          {/* Status Banner */}
          {connectionStatus === "connected" && connectionData.deviceId && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                WhatsApp device successfully connected!
                <br />
                Device ID:{" "}
                <code className="bg-green-100 px-1 rounded text-xs">
                  {connectionData.deviceId}
                </code>
                {connectionData.phoneNumber && (
                  <>
                    <br />
                    Phone:{" "}
                    <code className="bg-green-100 px-1 rounded text-xs">
                      {connectionData.phoneNumber}
                    </code>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
          {errorMessage && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="space-y-6">
            <WhatsAppQRCode
              onDeviceConnected={handleDeviceConnected}
              onError={handleError}
            />
          </div>

          {/* Instructions and Info Section */}
          <div className="space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Status:</span>
                  <Badge
                    variant={
                      connectionStatus === "connected" ? "default" : "secondary"
                    }
                    className={
                      connectionStatus === "connected"
                        ? "bg-green-600 hover:bg-green-700"
                        : connectionStatus === "connecting"
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }
                  >
                    {connectionStatus === "connected"
                      ? "Connected"
                      : connectionStatus === "connecting"
                      ? "Connecting..."
                      : "Disconnected"}
                  </Badge>
                </div>
                {/* {connectionData.deviceId && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Device ID:</p>
                    <code className="text-sm font-mono">
                      {connectionData.deviceId}
                    </code>
                    {connectionData.phoneNumber && (
                      <>
                        <p className="text-xs text-gray-600 mt-2">
                          Phone Number:
                        </p>
                        <code className="text-sm font-mono">
                          {connectionData.phoneNumber}
                        </code>
                      </>
                    )}
                    {connectionData.deviceName && (
                      <>
                        <p className="text-xs text-gray-600 mt-2">
                          Device Name:
                        </p>
                        <code className="text-sm font-mono">
                          {connectionData.deviceName}
                        </code>
                      </>
                    )}
                  </div>
                )} */}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>How to Connect</CardTitle>
                <CardDescription>
                  Follow these steps to connect your WhatsApp Business account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      1
                    </span>
                    <span>Open WhatsApp on your phone</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      2
                    </span>
                    <span>Go to Settings → Linked Devices</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      3
                    </span>
                    <span>Tap "Link a Device"</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      4
                    </span>
                    <span>Scan the QR code displayed on the left</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  What you can do once connected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Receive and send WhatsApp messages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Manage customer conversations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>AI-powered chat assistance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Real-time message notifications</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Settings Button */}
            {connectionStatus === "connected" && (
              <Button className="w-full" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                WhatsApp Settings
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default WhatsAppQRPage;
