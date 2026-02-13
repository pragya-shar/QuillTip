'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface WalletStepCardProps {
  step: number
  icon: LucideIcon
  title: string
  description: string
  children?: React.ReactNode
}

export function WalletStepCard({
  step,
  icon: Icon,
  title,
  description,
  children,
}: WalletStepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: step * 0.1 }}
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-lg font-light text-white">
            {String(step).padStart(2, '0')}
          </span>
        </div>
        <CardContent className="pt-8 pb-6 px-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-neutral-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{description}</p>
            </div>
          </div>
          {children && <div className="mt-4">{children}</div>}
        </CardContent>
      </Card>
    </motion.div>
  )
}
