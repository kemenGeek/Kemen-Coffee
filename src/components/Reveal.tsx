import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { easePremium } from '../lib/motion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.9, delay, ease: easePremium }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
