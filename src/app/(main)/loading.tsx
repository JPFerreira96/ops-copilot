import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoadingDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Skeleton className="h-9 w-[280px] mb-2" />
                    <Skeleton className="h-5 w-[350px]" />
                </div>
                <Skeleton className="h-10 w-[140px]" />
            </div>

            <Card>
                <CardHeader className="pb-3 border-b mb-6">
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-[240px]" />
                        <Skeleton className="h-10 w-[180px]" />
                        <Skeleton className="h-10 w-[180px]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
