'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen bg-gray-950 text-white items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <button
          className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
