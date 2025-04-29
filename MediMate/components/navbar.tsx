"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Pill } from "lucide-react"

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2">
          <Pill className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">MediMate</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Home
          </Link>
          <Link href="/input" className="text-sm font-medium hover:text-primary">
            Add Prescription
          </Link>
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
            Dashboard
          </Link>
          <Link href="/compare" className="text-sm font-medium hover:text-primary">
            Compare Prices
          </Link>
        </nav>
      </div>
    </motion.header>
  )
}
