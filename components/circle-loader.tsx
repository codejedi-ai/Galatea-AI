export function CircleLoader() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20">
      <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse"></div>
      <div className="absolute inset-[100px] rounded-full border border-primary/20 animate-pulse animate-delay-500"></div>
      <div className="absolute inset-[200px] rounded-full border border-primary/10 animate-pulse animate-delay-1000"></div>
    </div>
  )
}
