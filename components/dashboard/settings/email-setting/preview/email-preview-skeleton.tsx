import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const EmailPreviewSkeleton = () => {
  return (
    <Card className="w-full h-full min-h-[320px]">
      <CardContent className="p-6 space-y-4">
        {/* Email body lines */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        <div className="py-4" />

        {/* Email signature lines */}
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
};

export default EmailPreviewSkeleton;
