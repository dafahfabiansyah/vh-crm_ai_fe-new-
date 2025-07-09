import { whatsappService } from "@/services";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle, Loader2, QrCode } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// Create Session Component
const CreateSessionComponent = ({ onSessionCreated }: { onSessionCreated: (data: any) => void }) => {
  const [sessionName, setSessionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionName.trim()) {
      setError("Session name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await whatsappService.createSession(sessionName);
      onSessionCreated(result);
    } catch (err: any) {
      setError(err.message || "Failed to create session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Create WhatsApp Platform Name
        </CardTitle>
        <CardDescription>
          Enter a session name to create a new WhatsApp connection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateSession} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="sessionName">Platforms Inbox Name</Label>
            <Input
              id="sessionName"
              placeholder="Buat session name (e.g., Tumbuhin WhatsApp)"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Session...
              </>
            ) : (
              "Create Session"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateSessionComponent;