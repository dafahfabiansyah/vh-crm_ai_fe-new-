"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, Loader2 } from "lucide-react";
import { platformsInboxService } from "@/services/platfrormsInboxService";
import whatsappService from "@/services/whatsappService";

interface StartChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialPhone?: string;
  initialPlatformId?: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface ChatForm {
  phone: string;
  platformId: string;
  message: string;
}

export default function StartChatModal({
  isOpen,
  onOpenChange,
  initialPhone = "",
  initialPlatformId = "",
  onSuccess,
  onError,
}: StartChatModalProps) {
  const [chatForm, setChatForm] = useState<ChatForm>({
    phone: initialPhone,
    platformId: initialPlatformId,
    message: "Hello, this is an initial message.",
  });
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(false);
  const [platformsError, setPlatformsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch platforms when modal opens
  useEffect(() => {
    if (isOpen) {
      setPlatformsLoading(true);
      setPlatformsError(null);
      platformsInboxService
        .getPlatformInbox()
        .then((data) => {
          setPlatforms(Array.isArray(data) ? data : data.items || []);
        })
        .catch((err: any) => {
          setPlatformsError(err.message || "Gagal mengambil data platform");
          setPlatforms([]);
        })
        .finally(() => setPlatformsLoading(false));
    }
  }, [isOpen]);

  // Update form when initial values change
  useEffect(() => {
    setChatForm(prev => ({
      ...prev,
      phone: initialPhone,
      platformId: initialPlatformId,
    }));
  }, [initialPhone, initialPlatformId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatForm.phone || !chatForm.platformId || !chatForm.message) {
      onError?.("Nomor telepon, platform, dan pesan wajib diisi");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await whatsappService.sendMessage({
        session: chatForm.platformId,
        number: chatForm.phone,
        message: chatForm.message,
      });
      
      onSuccess?.("Pesan berhasil dikirim!");
      onOpenChange(false);
      
      // Reset form
      setChatForm({
        phone: "",
        platformId: "",
        message: "Hello, this is an initial message.",
      });
    } catch (err: any) {
      onError?.(err.message || "Gagal mengirim pesan WhatsApp");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-primary text-lg">
            <Send className="h-5 w-5" />
            Mulai Chat WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform" className="text-sm font-medium">
              Platform WhatsApp *
            </Label>
            <Select
              value={chatForm.platformId}
              onValueChange={(value) =>
                setChatForm((prev) => ({
                  ...prev,
                  platformId: value,
                }))
              }
              required
              disabled={isSubmitting}
            >
              <SelectTrigger className="text-sm w-full">
                <SelectValue
                  placeholder={
                    platformsLoading
                      ? "Memuat platform..."
                      : "Pilih platform WhatsApp..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {platformsLoading && (
                  <div className="px-3 py-2 text-muted-foreground text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat...
                  </div>
                )}
                {platformsError && (
                  <div className="px-3 py-2 text-red-500 text-sm">
                    {platformsError}
                  </div>
                )}
                {!platformsLoading &&
                  !platformsError &&
                  platforms.length === 0 && (
                    <div className="px-3 py-2 text-muted-foreground text-sm">
                      Tidak ada platform tersedia
                    </div>
                  )}
                {!platformsLoading &&
                  !platformsError &&
                  platforms.length > 0 &&
                  platforms.map((platform: any) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.platform_name || platform.name || `Platform ${platform.id}`}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Nomor Telepon *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={chatForm.phone}
              onChange={(e) =>
                setChatForm((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              placeholder="628123456789"
              className="font-mono text-sm"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Format: 628xxxxxxxxx (tanpa tanda +)
            </p>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Pesan yang akan Dikirim *
            </Label>
            <Textarea
              id="message"
              value={chatForm.message}
              onChange={(e) =>
                setChatForm((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              placeholder="Hello, this is an initial message."
              rows={4}
              className="text-sm resize-none"
              required
              disabled={isSubmitting}
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Maksimal 1000 karakter</span>
              <span>{chatForm.message.length}/1000</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none"
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary text-white"
              disabled={isSubmitting || !chatForm.phone || !chatForm.platformId || !chatForm.message}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Pesan
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
