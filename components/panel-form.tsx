"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPayment } from "@/app/actions/create-payment"
import { checkUserExists } from "@/app/actions/check-user-exists"
import { plans } from "@/data/plans"
import { formatRupiah } from "@/lib/utils"
import { Check, Info, User, Mail, Package, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ConfirmationDialog } from "./confirmation-dialog"
import { StatusModal } from "./status-modal"
import { motion } from "framer-motion"

export default function PanelForm() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"success" | "error" | "info" | "loading">("info")
  const [modalTitle, setModalTitle] = useState("")
  const [modalMessage, setModalMessage] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !email || !selectedPlan) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Format email tidak valid",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)

    try {
      // Show loading modal
      setModalType("loading")
      setModalTitle("Memeriksa Ketersediaan")
      setModalMessage("Sedang memeriksa ketersediaan username dan email di panel...")
      setShowModal(true)

      // Check if username or email already exists
      const result = await checkUserExists(username, email)

      if (!result.success) {
        throw new Error(result.error || "Gagal memeriksa ketersediaan username dan email")
      }

      if (result.usernameExists) {
        setModalType("error")
        setModalTitle("Username Sudah Terdaftar")
        setModalMessage("Username yang Anda masukkan sudah terdaftar di panel. Silakan gunakan username lain.")
        return
      }

      if (result.emailExists) {
        setModalType("error")
        setModalTitle("Email Sudah Terdaftar")
        setModalMessage("Email yang Anda masukkan sudah terdaftar di panel. Silakan gunakan email lain.")
        return
      }

      // Close the modal and show confirmation dialog
      setShowModal(false)
      setShowConfirmation(true)
    } catch (error) {
      setModalType("error")
      setModalTitle("Terjadi Kesalahan")
      setModalMessage(error instanceof Error ? error.message : "Terjadi kesalahan saat memeriksa ketersediaan")
    } finally {
      setIsValidating(false)
    }
  }

  const handleConfirm = async () => {
    setIsLoading(true)

    try {
      const result = await createPayment(selectedPlan, username, email)

      if (!result.success) {
        throw new Error(result.error)
      }

      router.push(`/invoice/${result.transactionId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      })
      setShowConfirmation(false)
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-base font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-red-500" />
            Username
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              className="h-14 text-base pl-10 bg-dark-500 border-dark-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
            <Mail className="w-4 h-4 text-red-500" />
            Email
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="w-5 h-5 text-gray-500" />
            </div>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              required
              className="h-14 text-base pl-10 bg-dark-500 border-dark-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plan" className="text-base font-medium flex items-center gap-2">
            <Package className="w-4 h-4 text-red-500" />
            Pilih Paket
          </Label>
          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
            <SelectTrigger id="plan" className="w-full h-14 text-base bg-dark-500 border-dark-300">
              <SelectValue placeholder="Pilih paket" />
            </SelectTrigger>
            <SelectContent className="bg-dark-400 border-dark-300">
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id} className="py-3 focus:bg-dark-500 focus:text-white">
                  <div className="flex justify-between items-center w-full">
                    <span>{plan.name}</span>
                    <span className="text-red-400 font-medium">{formatRupiah(plan.price)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-dark-500 p-5 rounded-lg border border-dark-300"
          >
            <h3 className="font-medium text-white mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-red-500" />
              Detail Paket
            </h3>
            {(() => {
              const plan = plans.find((p) => p.id === selectedPlan)
              if (!plan) return null

              return (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="text-gray-400">RAM:</div>
                    <div className="font-medium text-white">{plan.memory} MB</div>
                    <div className="text-gray-400">Disk:</div>
                    <div className="font-medium text-white">{plan.disk} MB</div>
                    <div className="text-gray-400">CPU:</div>
                    <div className="font-medium text-white">{plan.cpu}%</div>
                    <div className="text-gray-400">Harga:</div>
                    <div className="font-medium text-red-400">{formatRupiah(plan.price)}</div>
                  </div>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-white mb-2">Fitur:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Check className="w-4 h-4 text-red-500 mr-2 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )
            })()}
          </motion.div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 h-14 text-lg font-medium transition-all duration-300 ease-in-out transform hover:scale-[1.02] shadow-lg"
          disabled={isValidating}
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memeriksa...
            </>
          ) : (
            "Beli Sekarang"
          )}
        </Button>
      </form>

      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
      />

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        planId={selectedPlan}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </>
  )
}
