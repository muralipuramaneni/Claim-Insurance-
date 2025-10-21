import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const router = useRouter()

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <div className="flex items-center space-x-2">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <svg 
                className="w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            )}
            
            {item.href && index < items.length - 1 ? (
              <Link 
                href={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors duration-200 hover:underline"
              >
                {item.icon && <span className="text-gray-500">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-1">
                {item.icon && (
                  <span className={index === items.length - 1 ? "text-primary-600" : "text-gray-500"}>
                    {item.icon}
                  </span>
                )}
                <span 
                  className={`font-medium ${
                    index === items.length - 1 
                      ? 'text-primary-600' 
                      : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  )
}

// Helper function to generate breadcrumbs based on pathname
export const generateBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Home/Dashboard icon
  const homeIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )

  // Claims icon
  const claimsIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )

  // Policies icon
  const policiesIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )

  // Profile icon
  const profileIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  // New/Add icon
  const newIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )

  // Always start with Dashboard
  breadcrumbs.push({
    label: 'Dashboard',
    href: '/dashboard/home',
    icon: homeIcon
  })

  // Map path segments to breadcrumbs
  let currentPath = ''
  
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i]
    currentPath += `/${segment}`
    
    // Skip 'dashboard' segment as it's already handled
    if (segment === 'dashboard') continue
    
    let label = ''
    let icon = null
    let href = currentPath
    
    // Don't add href for the last item (current page)
    if (i === pathSegments.length - 1) {
      href = undefined
    }
    
    switch (segment) {
      case 'home':
        // Skip home as it's the same as dashboard
        continue
      case 'claims':
        label = 'Claims'
        icon = claimsIcon
        break
      case 'policies':
        label = 'Policies'
        icon = policiesIcon
        break
      case 'profile':
        label = 'Profile'
        icon = profileIcon
        break
      case 'new':
        label = 'New'
        icon = newIcon
        break
      default:
        // For dynamic segments (IDs), show as is
        label = segment.charAt(0).toUpperCase() + segment.slice(1)
        break
    }
    
    if (label) {
      breadcrumbs.push({
        label,
        href,
        icon
      })
    }
  }
  
  return breadcrumbs
}