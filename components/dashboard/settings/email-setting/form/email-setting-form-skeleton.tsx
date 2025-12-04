import { Skeleton } from "@/components/ui/skeleton";

const EmailSettingFormSkeleton = () => {
  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 gap-6 items-end">
        {/* E-mail Body Template */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>

        {/* E-mail Signature */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      {/* Save Button */}
      <Skeleton className="h-10 w-32 mt-6" />
    </div>
  );
};

export default EmailSettingFormSkeleton;
