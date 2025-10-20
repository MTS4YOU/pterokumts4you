"use server"

import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import { plans } from "@/data/plans"

export async function getSuccessfulTransactions() {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const paymentsCollection = db.collection("payments")

    const transactions = await paymentsCollection.find({}).sort({ createdAt: -1 }).limit(50).toArray()

    return transactions.map((transaction) => {
      const plan = plans.find((p) => p.id === transaction.planId)

      return {
        transactionId: transaction.transactionId,
        email: maskEmail(transaction.email),
        planId: transaction.planId,
        planName: plan ? plan.name : "Unknown Plan",
        total: transaction.total,
        createdAt: transaction.createdAt,
        status: transaction.status,
      }
    })
  } catch (error) {
    console.error("Error getting successful transactions:", error)
    return []
  }
}

export async function getTransactionById(transactionId: string) {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const paymentsCollection = db.collection("payments")

    const transaction = await paymentsCollection.findOne({ transactionId })

    if (!transaction) {
      return null
    }

    const plan = plans.find((p) => p.id === transaction.planId)

    return {
      ...transaction,
      planName: plan ? plan.name : "Unknown Plan",
    }
  } catch (error) {
    console.error("Error getting transaction by ID:", error)
    return null
  }
}

function maskEmail(email: string): string {
  const [username, domain] = email.split("@")
  if (username.length <= 3) return `${username}***@${domain}`
  const visiblePart = username.substring(0, 3)
  return `${visiblePart}***@${domain}`
}
