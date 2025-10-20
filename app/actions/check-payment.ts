"use server"
import { getPayment, updatePaymentStatus } from "./create-payment"
import { revalidatePath } from "next/cache"
import { plans } from "@/data/plans"
import { plansPrivate } from "@/data/plans-private"
import { createPanel } from "./create-panel"
import { appConfig } from "@/data/config"

const API_KEY = `${appConfig.apikey}`

interface CiaStatusResponse {
  success: boolean
  data: {
    id: string
    reff_id: string
    nominal: number
    tambahan: number
    fee: number
    get_balance: number
    metode: string
    status: "pending" | "success" | "expired" | "canceled"
    created_at: string
  }
}

export async function checkPaymentStatus(transactionId: string) {
  try {
    const payment = await getPayment(transactionId)
    if (!payment) {
      return { success: false, error: "Pembayaran tidak ditemukan" }
    }

    // ✅ Jika sudah selesai sebelumnya
    if (payment.status === "completed") {
      return { success: true, status: "completed", panelDetails: payment.panelDetails }
    }
    if (payment.status === "paid") {
      return { success: true, status: "paid" }
    }

    // 🔎 Cek status ke CIA Topup
    const params = new URLSearchParams({ id: payment.vpediaId })
    const response = await fetch(`https://ciaatopup.my.id/h2h/deposit/status?${params}`, {
      method: "GET",
      headers: {
        "X-APIKEY": API_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return { success: false, error: "Gagal memeriksa status pembayaran" }
    }

    const data: CiaStatusResponse = await response.json()
    if (!data.success) {
      return { success: false, error: "Gagal memeriksa status pembayaran (API error)" }
    }

    const status = data.data.status

    if (status === "success") {
      // Update ke paid dulu
      await updatePaymentStatus(transactionId, "paid")

      const selectedPlans = payment.panelType === "private" ? plansPrivate : plans
      const plan = selectedPlans.find((p) => p.id === payment.planId)
      if (!plan) {
        return { success: false, error: "Plan tidak ditemukan" }
      }

      try {
        const panelResult = await createPanel({
          username: payment.username,
          email: payment.email,
          memory: plan.memory,
          disk: plan.disk,
          cpu: plan.cpu,
          planId: payment.planId,
          createdAt: payment.createdAt,
          panelType: payment.panelType,
          transactionId,
        })

        if (!panelResult.success) {
          await updatePaymentStatus(transactionId, "failed")
          return { success: false, error: "Gagal membuat panel" }
        }

        const panelDetails = {
          username: payment.username,
          password: panelResult.password,
          serverId: panelResult.serverId,
        }

        await updatePaymentStatus(transactionId, "completed", panelDetails)
        revalidatePath(`/invoice/${transactionId}`)

        return {
          success: true,
          status: "completed",
          panelDetails,
          showWhatsappPopup: true,
          saveToHistory: true,
          historyData: {
            transactionId,
            username: payment.username,
            email: payment.email,
            planName: plan.name,
            total: payment.total,
            createdAt: payment.createdAt,
            status: "completed",
          },
        }
      } catch (error) {
        await updatePaymentStatus(transactionId, "failed")
        return {
          success: false,
          error: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat panel",
        }
      }
    }

    if (status === "expired" || status === "canceled") {
      await updatePaymentStatus(transactionId, "failed")
      return { success: true, status: "failed" }
    }

    return { success: true, status: "pending" }
  } catch (error) {
    console.error("Error checking payment status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat memeriksa status pembayaran",
    }
  }
}