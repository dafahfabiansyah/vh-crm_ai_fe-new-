"use client"

import { Link } from "react-router";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Home, ArrowLeft, Search, MessageCircle, HelpCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="space-y-4">
          <div className="text-8xl font-bold text-primary/20 select-none">404</div>
          <h1 className="text-4xl font-bold text-foreground">Halaman Tidak Ditemukan</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau URL yang Anda
            masukkan salah.
          </p>
        </div>

        {/* Search Box */}
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Cari Halaman</h3>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari halaman atau fitur..." className="pl-10" />
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Options */}
        <div className="grid gap-4 md:grid-cols-2 max-w-lg mx-auto">
          <Link to="/dashboard">
            <Button variant="outline" className="w-full h-auto p-4 flex flex-col gap-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="font-medium">Kembali ke Dashboard</span>
              <span className="text-xs text-muted-foreground">Halaman utama aplikasi</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full h-auto p-4 flex flex-col gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-6 w-6 text-primary" />
            <span className="font-medium">Halaman Sebelumnya</span>
            <span className="text-xs text-muted-foreground">Kembali ke halaman terakhir</span>
          </Button>
        </div>

        {/* Quick Links
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Halaman Populer</h3>
          <div className="grid gap-3 md:grid-cols-3 max-w-2xl mx-auto">
            <Link to="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/pipeline/active">
              <Button variant="ghost" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat Aktif
              </Button>
            </Link>
            <Link to="/ai-agents">
              <Button variant="ghost" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                AI Agents
              </Button>
            </Link>
            <Link to="/human-agents">
              <Button variant="ghost" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Human Agents
              </Button>
            </Link>
            <Link to="/contacts">
              <Button variant="ghost" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Kontak
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Pengaturan
              </Button>
            </Link>
          </div>
        </div> */}

        {/* Help Section
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Butuh Bantuan?</h3>
              <p className="text-sm text-muted-foreground">
                Jika Anda mengalami masalah atau membutuhkan bantuan, tim support kami siap membantu.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Pusat Bantuan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Footer */}
        <div className="text-sm text-muted-foreground">
          <p>
            Jika masalah berlanjut, silakan{" "}
            <Link to="/contact" className="text-primary hover:underline">
              hubungi tim support
            </Link>{" "}
            kami.
          </p>
        </div>
      </div>
    </div>
  )
}
