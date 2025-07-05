import { useState } from "react";
import MainLayout from "@/main-layout";
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
  QrCode,
} from "lucide-react";
import { useNavigate } from "react-router";

// Mock data for WhatsApp connection
const mockConnectionData = {
  deviceId: "1082fe3c_device_1750494274779_67xmoijuo",
  phoneNumber: "+628526000993731",
  deviceName: "DISTCCTV Business Phone",
  sessionId: "mock_session_123",
  isConnected: true,
  isLoggedIn: true,
};

// Mock QR Code Component
const DummyQRCode = ({ onDeviceConnected, onError }: { 
  onDeviceConnected: (deviceId: string) => void; 
  onError: (error: string) => void; 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [qrCodeData] = useState("https://web.whatsapp.com/qr/ABC123XYZ789");

  const handleSimulateConnection = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsConnected(true);
      onDeviceConnected(mockConnectionData.deviceId);
    }, 2000);
  };

  const handleSimulateDisconnection = () => {
    setIsConnected(false);
    onError("Device disconnected for testing");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
          WhatsApp QR Code
        </CardTitle>
        <CardDescription className="text-sm">
          {isConnected ? "Device is connected" : "Scan this QR code with your WhatsApp mobile app"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gray-100 border-2 border-gray-200 rounded-lg flex items-center justify-center">
            {isScanning ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-xs sm:text-sm text-gray-600">Connecting...</p>
              </div>
            ) : isConnected ? (
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-green-600 font-medium">Connected</p>
                <p className="text-xs text-gray-500 mt-1 px-2 text-center">
                  Device: {mockConnectionData.deviceName}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <QrCode className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-gray-600">Dummy QR Code</p>
                <p className="text-xs text-gray-500 mt-1 px-2 text-center break-all">
                  {qrCodeData}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-2 w-full">
            {!isConnected && (
              <Button 
                onClick={handleSimulateConnection}
                disabled={isScanning}
                className="flex-1 text-sm touch-manipulation"
              >
                {isScanning ? "Connecting..." : "Simulate Connection"}
              </Button>
            )}
            {isConnected && (
              <Button 
                onClick={handleSimulateDisconnection}
                variant="outline"
                className="flex-1 text-sm touch-manipulation"
              >
                Simulate Disconnect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const WhatsAppQRPage = () => {
  const navigate = useNavigate();

  // Mock connection state
  const [connectionData] = useState(mockConnectionData);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleDeviceConnected = (deviceId: string) => {
    setErrorMessage(null);
    setConnectionStatus("connected");
    console.log("Device connected:", deviceId);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setConnectionStatus("disconnected");
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 self-start touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <div className="flex-1">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                WhatsApp Integration
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Connect your WhatsApp Business account to manage conversations
              </p>
            </div>
          </div>{" "}
          {/* Status Banner */}
          {connectionStatus === "connected" && connectionData.deviceId && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="text-sm sm:text-base">
                  WhatsApp device successfully connected!
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs sm:text-sm">
                    Device ID:{" "}
                    <code className="bg-green-100 px-1 rounded text-xs break-all">
                      {connectionData.deviceId}
                    </code>
                  </div>
                  {connectionData.phoneNumber && (
                    <div className="text-xs sm:text-sm">
                      Phone:{" "}
                      <code className="bg-green-100 px-1 rounded text-xs">
                        {connectionData.phoneNumber}
                      </code>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
          {errorMessage && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm sm:text-base">{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* QR Code Section */}
          <div className="space-y-4 sm:space-y-6">
            <DummyQRCode
              onDeviceConnected={handleDeviceConnected}
              onError={handleError}
            />
          </div>

          {/* Instructions and Info Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
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
                {connectionData.deviceId && connectionStatus === "connected" && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-600">Device ID:</p>
                        <code className="text-xs sm:text-sm font-mono break-all">
                          {connectionData.deviceId}
                        </code>
                      </div>
                      {connectionData.phoneNumber && (
                        <div>
                          <p className="text-xs text-gray-600">Phone Number:</p>
                          <code className="text-xs sm:text-sm font-mono">
                            {connectionData.phoneNumber}
                          </code>
                        </div>
                      )}
                      {connectionData.deviceName && (
                        <div>
                          <p className="text-xs text-gray-600">Device Name:</p>
                          <code className="text-xs sm:text-sm font-mono break-all">
                            {connectionData.deviceName}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">How to Connect</CardTitle>
                <CardDescription className="text-sm">
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
                    <span>Scan the QR code displayed <span className="sm:hidden">above</span><span className="hidden sm:inline">on the left</span></span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Features</CardTitle>
                <CardDescription className="text-sm">
                  What you can do once connected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Receive and send WhatsApp messages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Manage customer conversations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>AI-powered chat assistance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Real-time message notifications</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Settings Button */}
            {connectionStatus === "connected" && (
              <Button className="w-full touch-manipulation" variant="outline">
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
