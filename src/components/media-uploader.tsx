import { FileText, Image, X, Paperclip, Smile, Send, Loader2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "./ui/textarea";

interface MediaUploaderProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  isSending: boolean;
  onSendMessage: () => void;
  onSendFiles: (files: File[]) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  newMessage,
  setNewMessage,
  isSending,
  onSendMessage,
  onSendFiles
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Popular emojis list
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
    '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', 
    '🤧', '😷', '🤒', '🤕', '🤑', '💪', '🙏', '✍️', '👍', '👎', 
    '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉','👆',  '👇', 
    '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', 
 
  ];

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(newMessage + emoji);
    setIsEmojiOpen(false);
  };

  // Clean up object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        if (file.type.startsWith('image/')) {
          const objectUrl = URL.createObjectURL(file);
          URL.revokeObjectURL(objectUrl);
        }
      });
    };
  }, [selectedFiles]);

  const handleRemoveFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    // Clean up object URL if it's an image
    if (fileToRemove?.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(fileToRemove);
      URL.revokeObjectURL(objectUrl);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (selectedFiles.length > 0) {
      onSendFiles(selectedFiles);
      setSelectedFiles([]);
    } else {
      onSendMessage();
    }
  };

  const handleFileUpload = () => {
    setIsFileUploadOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(prev => [...prev, ...fileArray]);
      console.log("Selected files:", fileArray);
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setIsFileUploadOpen(false);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx';
      fileInputRef.current.click();
    }
  };
  return (
    <>
      <div className="flex items-start gap-2">
        <div className="flex-1 relative">
          {/* Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {file.type.startsWith("image/") ? (
                        <div className="flex items-center gap-2 justify-between flex-1 min-w-0">
                          <Image className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate block">
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          {/* Image Preview */}
                          <div className="w-12 h-12 rounded border overflow-hidden flex-shrink-0">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onLoad={(e) => {
                                // Clean up the object URL after image loads
                                setTimeout(
                                  () =>
                                    URL.revokeObjectURL(
                                      (e.target as HTMLImageElement).src
                                    ),
                                  1000
                                );
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <FileText className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate block">
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="h-6 w-6 p-0 flex-shrink-0 ml-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="w-full min-h-[40px] max-h-[120px] resize-none rounded-md border border-input bg-background px-3 py-2 pr-20 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto"
            rows={1}
            style={{
              height: "auto",
              minHeight: "40px",
              maxHeight: "120px",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
          <div
            className={`absolute right-2 ${
              selectedFiles.length > 0 ? "top-[calc(100%-2rem)]" : "top-2"
            } flex gap-1`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={isSending}
              onClick={handleFileUpload}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={isSending}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2">
                <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="w-8 h-8 rounded hover:bg-muted flex items-center justify-center text-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={
            (!newMessage.trim() && selectedFiles.length === 0) || isSending
          }
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
        style={{ display: 'none' }}
      />

      {/* File Upload Dialog */}
      <Dialog open={isFileUploadOpen} onOpenChange={setIsFileUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col gap-2"
              onClick={openFileDialog}
            >
              <div className="flex items-center gap-2">
                <Image className="h-6 w-6" />
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-sm">Choose Files</span>
              <span className="text-xs text-muted-foreground">Photos & Documents</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaUploader;
