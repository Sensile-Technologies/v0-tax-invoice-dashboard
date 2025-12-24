export default function Loading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-96 bg-slate-200 rounded" />
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="h-64 bg-slate-200 rounded-lg" />
          <div className="h-64 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
