// app/admin/components/AdminPageSkeleton.tsx
export function AdminPageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* 🔽 ヘッダーのスケルトンはAdminPageHeaderのデザインに合わせて調整済み */}
      <div className="text-center mb-12">
        <div className="h-10 bg-gray-200 rounded-md w-1/2 sm:w-1/3 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded-md w-2/3 sm:w-1/2 mx-auto"></div>
        <div className="mt-6 w-24 h-1 bg-gray-200 mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border text-card-foreground shadow-sm h-28 bg-gray-200"></div>
        ))}
      </div>

      <div className="h-10 bg-gray-200 rounded-md w-full mb-6"></div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}