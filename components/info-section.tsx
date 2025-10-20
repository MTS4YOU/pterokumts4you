"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Shield, Zap, Clock, CreditCard } from "lucide-react"

export function InfoSection() {
  const features = [
    {
      icon: <Shield className="w-10 h-10 text-red-500" />,
      title: "Keamanan Terjamin",
      description: "Panel Pterodactyl kami menjamin keamanan data dan server Anda dengan sistem keamanan terbaik.",
      delay: 0,
    },
    {
      icon: <Zap className="w-10 h-10 text-red-500" />,
      title: "Performa Tinggi",
      description: "Nikmati performa server yang cepat dan stabil untuk menjalankan aplikasi Anda tanpa kendala.",
      delay: 0.2,
    },
    {
      icon: <Clock className="w-10 h-10 text-red-500" />,
      title: "Uptime 99.9%",
      description: "Kami menjamin uptime server hingga 99.9% sehingga aplikasi Anda selalu online dan dapat diakses.",
      delay: 0.4,
    },
    {
      icon: <CreditCard className="w-10 h-10 text-red-500" />,
      title: "Pembayaran Mudah",
      description: "Proses pembayaran yang mudah dan cepat dengan berbagai metode pembayaran yang tersedia.",
      delay: 0.6,
    },
  ]

  return (
    <div className="py-16 bg-gradient-to-b from-dark-400 to-dark-500">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-white mb-4"
        >
          <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Mengapa Memilih Kami?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center text-gray-300 max-w-2xl mx-auto mb-12"
        >
          Kami menyediakan layanan panel Pterodactyl terbaik dengan fitur lengkap dan harga terjangkau.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
      className="bg-dark-400 rounded-lg p-6 border border-dark-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-red-500/30"
    >
      <div className="flex items-center mb-4">
        <div className="p-3 bg-dark-500 rounded-full mr-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-300">{description}</p>
    </motion.div>
  )
}
