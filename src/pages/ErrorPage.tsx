"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, MessageCircle, Code } from "lucide-react"
import { Link } from "react-router";
import { isVerboseLogging } from "@/config/debug"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Terjadi Kesalahan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan sedang menangani masalah ini.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">Error ID: {error.digest}</p>
            )}
          </div>

          {/* Debug Information */}
          {isVerboseLogging() && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Debug Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Error Message:</p>
                    <p className="text-xs font-mono bg-destructive/10 p-2 rounded text-destructive">
                      {error.message}
                    </p>
                  </div>
                  {error.stack && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Stack Trace:</p>
                      <pre className="text-xs font-mono bg-muted p-2 rounded overflow-auto max-h-32 text-muted-foreground">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <Button onClick={reset} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/dashboard">
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="outline" className="w-full text-green-600 border-green-200 hover:bg-green-50">
                <MessageCircle className="h-4 w-4 mr-2" />
                Support
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Jika masalah berlanjut, silakan{" "}
              <Link to="/contact" className="text-primary hover:underline">
                hubungi tim support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
