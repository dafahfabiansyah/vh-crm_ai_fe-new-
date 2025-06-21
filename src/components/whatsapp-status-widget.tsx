import { useAppSelector } from '@/hooks/redux';
import {
  selectWhatsAppConnectionData,
  selectWhatsAppConnectionStatus,
  selectIsWhatsAppConnected,
} from '@/store/whatsappSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Smartphone } from 'lucide-react';

/**
 * Contoh komponen yang menggunakan data WhatsApp dari Redux
 * Component ini bisa digunakan di halaman manapun untuk menampilkan status WhatsApp
 */
const WhatsAppStatusWidget = () => {
  // Ambil data WhatsApp dari Redux store
  const connectionData = useAppSelector(selectWhatsAppConnectionData);
  const connectionStatus = useAppSelector(selectWhatsAppConnectionStatus);
  const isConnected = useAppSelector(selectIsWhatsAppConnected);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          WhatsApp Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Connection */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <Badge
            variant={isConnected ? "default" : "destructive"}
            className={
              isConnected
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isConnected ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </>
            )}
          </Badge>
        </div>

        {/* Phone Number */}
        {connectionData.phoneNumber && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Phone:</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              {connectionData.phoneNumber}
            </code>
          </div>
        )}

        {/* Device ID */}
        {connectionData.deviceId && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Device ID:</span>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              {connectionData.deviceId.length > 20 
                ? `${connectionData.deviceId.substring(0, 20)}...` 
                : connectionData.deviceId}
            </code>
          </div>
        )}

        {/* Device Name */}
        {connectionData.deviceName && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Device:</span>
            <span className="text-sm text-gray-600">
              {connectionData.deviceName}
            </span>
          </div>
        )}

        {/* Connection Status Details */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-xs text-gray-500">Connected</div>
            <div className="text-sm font-medium">
              {connectionData.isConnected ? '✅' : '❌'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Logged In</div>
            <div className="text-sm font-medium">
              {connectionData.isLoggedIn ? '✅' : '❌'}
            </div>
          </div>
        </div>

        {/* Last Updated */}
        {connectionData.timestamp && (
          <div className="text-xs text-gray-500 text-center">
            Last updated: {new Date(connectionData.timestamp).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppStatusWidget;
