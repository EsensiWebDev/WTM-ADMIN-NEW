import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Access Denied</h1>
          <p className="mt-2 text-muted-foreground">
            You don't have permission to access this page
          </p>
        </div>

        <div className="rounded-lg border bg-muted/50 p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-5 w-5" />
            <h2 className="font-semibold">Unauthorized Access</h2>
          </div>
          <div className="pl-7">
            <p className="text-sm text-muted-foreground">
              You do not have the required permissions to view this page. This
              page is restricted to users with specific roles.
            </p>
            <div className="mt-6 flex gap-4">
              <Button asChild>
                <Link href="/">Return to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/logout">Logout</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
