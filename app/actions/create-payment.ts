"use server"

import { calculateFee, generateTransactionId } from "@/lib/utils"
import { plans } from "@/data/plans"
import { revalidatePath } from "next/cache"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import type { ObjectId } from "mongodb"

const API_KEY = `${appConfig.apikey}`

export interface PaymentData {
  _id?: ObjectId
  transactionId: string      
  vpediaId: string            
  planId: string
  username: string
  email: string
  amount: number           
  fee: number               
  total: number               
  qrImageUrl: string
  expirationTime: string      // manual (15 menit)
  status: "pending" | "paid" | "completed" | "failed"
  createdAt: string
  panelDetails?: {
    username: string
    password: string
    serverId: number
  }
}

export async function createPayment(planId: string, username: string, email: string) {
  try {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) {
      throw new Error("Plan tidak ditemukan")
    }

    const fee = calculateFee(plan.price)
    const total = plan.price + fee
    const transactionId = generateTransactionId()

    // Request ke CIA Topup
    const params = new URLSearchParams({
      nominal: total.toString(),
      metode: "QRISFAST",
    })

    const response = await fetch(`https://ciaatopup.my.id/h2h/deposit/create?${params}`, {
      method: "GET",
      headers: {
        "X-APIKEY": API_KEY,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data?.message || "Gagal membuat pembayaran CIA Topup")
    }

    // Simpan ke DB
    const paymentData: PaymentData = {
      transactionId,              // internal
      vpediaId: data.data.id,     // id dari CIA Topup
      planId,
      username,
      email,
      amount: plan.price,
      fee,
      total,
      qrImageUrl: data.data.qr_image, 
      expirationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // manual 15 menit
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const paymentsCollection = db.collection("payments")

    await paymentsCollection.insertOne(paymentData)
    revalidatePath(`/invoice/${transactionId}`)

    return { success: true, transactionId }
  } catch (error) {
    console.error("Error creating payment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat pembayaran",
    }
  }
}

export async function getPayment(transactionId: string): Promise<PaymentData | null> {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const paymentsCollection = db.collection("payments")

    const payment = (await paymentsCollection.findOne({ transactionId })) as PaymentData | null
    return payment
  } catch (error) {
    console.error("Error getting payment:", error)
    return null
  }
}

export async function updatePaymentStatus(
  transactionId: string,
  status: "pending" | "paid" | "completed" | "failed",
  panelDetails?: {
    username: string
    password: string
    serverId: number
  },
): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const paymentsCollection = db.collection("payments")

    const updateData: Partial<PaymentData> = { status }
    if (panelDetails) {
      updateData.panelDetails = panelDetails
    }

    const result = await paymentsCollection.updateOne({ transactionId }, { $set: updateData })

    if (result.matchedCount > 0) {
      revalidatePath(`/invoice/${transactionId}`)
      return true
    }
    return false
  } catch (error) {
    console.error("Error updating payment status:", error)
    return false
  }
}