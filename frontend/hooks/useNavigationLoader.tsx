'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function useNavigationLoader() {
    const [isNavigating, setIsNavigating] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    // Track pathname changes (navigation completed)
    useEffect(() => {
        // Show loader when pathname changes (navigation started)
        setIsNavigating(true)

        // Hide loader after a short delay (navigation completed)
        const timer = setTimeout(() => {
            setIsNavigating(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [pathname])

    // Wrapper for router.push that shows loader
    const pushWithLoader = (url: string) => {
        setIsNavigating(true)
        router.push(url)
    }

    return { isNavigating, pushWithLoader }
}