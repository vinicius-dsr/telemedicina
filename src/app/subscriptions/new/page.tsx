'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, CreditCard, Shield } from 'lucide-react'
import Link from 'next/link'
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
  const { data: session } = useSession()
