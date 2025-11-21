'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Large 404 */}
        <div className="relative">
          <h1 className="text-[150px] sm:text-[200px] font-black leading-none tracking-tighter bg-gradient-to-br from-primary/20 via-primary/10 to-transparent bg-clip-text text-transparent select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 text-muted-foreground/30" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/">
            <Button size="lg" className="gap-2 font-mono">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => window.history.back()}
            className="gap-2 font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>

        {/* Fun Typing Stats */}
        <div className="pt-8 border-t border-border/50 max-w-md mx-auto">
          <p className="text-sm text-muted-foreground mb-4">
            While you're here, did you know?
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <p className="text-2xl font-bold text-primary">40</p>
              <p className="text-xs text-muted-foreground">Average WPM</p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <p className="text-2xl font-bold text-primary">216</p>
              <p className="text-xs text-muted-foreground">World Record</p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg border border-border/50">
              <p className="text-2xl font-bold text-primary">95%</p>
              <p className="text-xs text-muted-foreground">Target Accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
