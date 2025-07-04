import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Component untuk demo error - bisa digunakan untuk testing error boundary
export function ErrorDemo() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Demo error untuk testing Error Boundary');
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Error Boundary Demo</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Klik tombol di bawah untuk memicu error dan melihat ErrorPage bekerja.
        </p>
        <Button 
          onClick={() => setShouldError(true)}
          variant="destructive"
        >
          Trigger Error
        </Button>
      </CardContent>
    </Card>
  );
}

export default ErrorDemo;
