import { AppRoutes } from './app/routes'
import { AWSProvider } from '@/context/AWSContext'
import '@/styles/globals.css'

/**
 * App — top-level component. Wraps router with AWSProvider.
 */
export default function App() {
  return (
    <AWSProvider>
      <AppRoutes />
    </AWSProvider>
  )
}
