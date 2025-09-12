import  { useState } from "react";
import MainLayout from "@/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageCircle, ThumbsUp, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const CSATPage = () => {
  const [csatPageMessage, setCsatPageMessage] = useState("Bagaimana pengalaman Anda?");
  const [csatRequestMessage, setCsatRequestMessage] = useState(
    "Terima kasih telah menghubungi kami, Anda dapat memberikan rating dengan cara klik link ini :"
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
            <div className="flex items-center gap-4">
              <Link
                to="#"
                onClick={(e) => { e.preventDefault(); window.history.back(); }}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            </div>
          <h1 className="text-3xl font-bold tracking-tight">CSAT Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Configure your Customer Satisfaction (CSAT) messages and see how they appear to customers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* CSAT Page Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  CSAT Page Message
                </CardTitle>
                <CardDescription>
                  The message shown to users on the CSAT rating page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csat-page-message">Message Content</Label>
                  <Textarea
                    id="csat-page-message"
                    name="csat_page_message"
                    rows={4}
                    value={csatPageMessage}
                    onChange={(e) => setCsatPageMessage(e.target.value)}
                    placeholder="Enter the message that will be displayed on the CSAT page"
                  />
                </div>
                <Button className="w-full">
                  Save CSAT Page Message
                </Button>
              </CardContent>
            </Card>

            {/* CSAT Request Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5" />
                  CSAT Request Message
                </CardTitle>
                <CardDescription>
                  The message sent to users after a conversation is resolved
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csat-request-message">Message Content</Label>
                  <Textarea
                    id="csat-request-message"
                    name="csat_request_message"
                    rows={4}
                    value={csatRequestMessage}
                    onChange={(e) => setCsatRequestMessage(e.target.value)}
                    placeholder="Enter the message that will be sent to request CSAT feedback"
                  />
                </div>
                <Button className="w-full">
                  Save Request Message
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  See how your CSAT messages will appear to customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CSAT Page Preview */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    CSAT Page Preview
                  </Label>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                        <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {csatPageMessage || "Bagaimana pengalaman Anda?"}
                      </p>
                      <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            className="w-10 h-10 rounded-full border-2 border-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 flex items-center justify-center transition-colors"
                          >
                            <Star className="w-5 h-5 text-yellow-500" />
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click a star to rate your experience
                      </p>
                    </div>
                  </div>
                </div>

                {/* CSAT Request Message Preview */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Request Message Preview
                  </Label>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {csatRequestMessage || "Terima kasih telah menghubungi kami, Anda dapat memberikan rating dengan cara klik ini:"}
                        </p>
                        {/* <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Rate Your Experience
                        </Button> */}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {/* <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2">Preview Notes:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• CSAT page appears when customers click the rating link</li>
                    <li>• Request message is sent after conversation resolution</li>
                    <li>• Changes are reflected in real-time in this preview</li>
                  </ul>
                </div> */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CSATPage;
