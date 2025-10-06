import React, { Suspense } from 'react'
import SubscriptionNewClient from './SubscriptionNewClient'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      {/* O componente abaixo é "use client" e usa useSearchParams */}
      <SubscriptionNewClient />
    </Suspense>
  )
}
