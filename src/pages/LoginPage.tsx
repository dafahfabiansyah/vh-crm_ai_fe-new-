import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/login-form";
import { Link } from "react-router";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Tumbuhin</CardTitle>
          <CardDescription className="text-center">
            <span className="text-sm text-muted-foreground">
              Silakan masukkan email dan kata sandi Anda untuk masuk.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground capitalize">
              belum punya akun? mari buat akun baru{" "}
              <Link 
                to="/auth/register" 
                className="text-primary hover:text-primary/80 font-medium underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
