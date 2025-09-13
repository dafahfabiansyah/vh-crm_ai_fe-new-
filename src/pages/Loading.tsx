import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

export default function Loading() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev + 10) % 100)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Progress value={progress} />
      </div>
    </div>
  )
}
