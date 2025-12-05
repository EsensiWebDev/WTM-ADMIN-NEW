import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportSummary } from "@/app/(dashboard)/report/types";

interface TrendingIndicatorProps {
  percent: number;
}

function TrendingIndicator({ percent }: TrendingIndicatorProps) {
  if (percent > 0) {
    return (
      <>
        <IconTrendingUp />+{percent}%
      </>
    );
  } else if (percent < 0) {
    return (
      <>
        <IconTrendingDown />
        {percent}%
      </>
    );
  } else {
    return <>0%</>;
  }
}

export function SectionCards({
  data,
}: {
  data: ReportSummary["summary_data"];
}) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs @5xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Confirmed Bookings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.confirmed_booking?.count}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingIndicator percent={data.confirmed_booking?.percent} />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.confirmed_booking?.message}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cancellations Bookings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.cancellation_booking?.count}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingIndicator percent={data.cancellation_booking?.percent} />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.cancellation_booking?.message}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Rejected Bookings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.rejected_booking?.count}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingIndicator percent={data.rejected_booking?.percent} />
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.rejected_booking?.message}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
