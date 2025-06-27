
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function LoadingUserDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" /> {/* Back button skeleton */}
        <div>
          <Skeleton className="h-8 w-60 mb-1" /> {/* Title skeleton */}
          <Skeleton className="h-4 w-48" /> {/* Subtitle skeleton */}
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Skeleton className="h-16 w-16 rounded-full" /> {/* Avatar skeleton */}
          <div>
            <Skeleton className="h-7 w-40 mb-1" /> {/* Name skeleton */}
            <Skeleton className="h-4 w-56" /> {/* Email skeleton */}
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={`info-item-skeleton-${i}`} className="flex flex-col">
                <Skeleton className="h-4 w-24 mb-1" /> {/* Label skeleton */}
                <Skeleton className="h-6 w-full" /> {/* Value skeleton */}
              </div>
            ))}
          </div>

          <Skeleton className="h-px w-full my-4" /> {/* Separator skeleton */}

          <div>
            <Skeleton className="h-6 w-32 mb-2" /> {/* Section title skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={`address-item-skeleton-${i}`} className="flex flex-col">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>

          <Skeleton className="h-px w-full my-4" /> 

           <div>
            <Skeleton className="h-6 w-40 mb-2" /> 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={`account-info-item-skeleton-${i}`} className="flex flex-col">
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    