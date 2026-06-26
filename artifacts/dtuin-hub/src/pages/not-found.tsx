import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-center">
        <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>
        
        <h1 className="text-6xl font-mono font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-mono font-semibold text-secondary-foreground mb-4">
          Module Offline
        </h2>
        <p className="text-muted-foreground max-w-md mb-8">
          The requested system node could not be located in the current infrastructure grid. Please verify the coordinates or return to the main dashboard.
        </p>

        <Link href="/">
          <Button size="lg" className="h-12 px-6 font-mono">
            <Home className="w-5 h-5 mr-2" />
            Return to Hub
          </Button>
        </Link>
      </div>
    </Layout>
  );
}
