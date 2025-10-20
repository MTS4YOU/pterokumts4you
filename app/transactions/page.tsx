import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTransactionById } from "@/app/actions/get-transactions"
import { formatDate, formatRupiah } from "@/lib/utils"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, User, Mail, Package, Calendar, CreditCard, ExternalLink } from "lucide-react"
import { CopyButton } from "@/components/copy-button"
import { pterodactylConfig } from "@/data/config"
import { appConfig } from "@/data/config"

export const metadata: Metadata = {
  title: `${appConfig.nameHost} - Detail Transaksi`,
  description: "Detail transaksi panel Pterodactyl",
}

export default async function TransactionDetailPage({ params }: { params: { id: string } }) {
  const transaction = await getTransactionById(params.id)

  if (!transaction) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-500 via-dark-700 to-dark-900">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/transactions" className="inline-flex items-center text-gray-400 hover:text-red-400 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Transaksi
            </Link>
            <h1 className="text-3xl font-bold text-white">
              <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                Detail Transaksi
              </span>
            </h1>
            <p className="text-gray-300 mt-2">
              Berikut adalah detail lengkap transaksi dengan ID: {transaction.transactionId}
            </p>
          </div>

          <Card className="bg-dark-400 border-dark-300 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-green-800 to-green-900 text-white p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Transaksi Sukses
                </h3>
                <span className="text-sm bg-green-700 px-2 py-1 rounded">{formatDate(transaction.createdAt)}</span>
              </div>
            </div>

            <CardContent className="p-0">
              {/* Header Section */}
              <div className="p-5 border-b border-dark-300 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-dark-500 rounded-full">
                    <CreditCard className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">ID Transaksi</p>
                    <p className="font-mono text-sm bg-dark-500 px-2 py-1 rounded border border-dark-300 text-gray-300">
                      {transaction.transactionId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-dark-500 rounded-full">
                    <Calendar className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tanggal</p>
                    <p className="text-sm text-white">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info Section */}
              <div className="p-5 border-b border-dark-300">
                <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Informasi Pelanggan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-dark-500 rounded-full mt-1">
                      <User className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Nama Pengguna</p>
                      <p className="font-medium text-white">{transaction.username}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-dark-500 rounded-full mt-1">
                      <Mail className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-medium text-white">{transaction.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Details Section */}
              <div className="p-5 border-b border-dark-300">
                <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Detail Paket</h4>
                <div className="flex items-start space-x-3 mb-4">
                  <div className="p-2 bg-dark-500 rounded-full mt-1">
                    <Package className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Paket</p>
                    <p className="font-medium text-white text-lg">{transaction.planName}</p>
                  </div>
                </div>
              </div>

              {/* Payment Summary Section */}
              <div className="p-5 border-b border-dark-300">
                <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Ringkasan Pembayaran</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white">{formatRupiah(transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Biaya Admin:</span>
                    <span className="text-white">{formatRupiah(transaction.fee)}</span>
                  </div>
                  <div className="h-px bg-dark-300 my-3"></div>
                  <div className="flex justify-between font-medium">
                    <span className="text-white">Total:</span>
                    <span className="text-xl text-red-400">{formatRupiah(transaction.total)}</span>
                  </div>
                </div>
              </div>

              {/* Panel Details Section */}
              {transaction.panelDetails && (
                <div className="p-5">
                  <h4 className="text-sm uppercase text-gray-400 mb-3 font-medium">Detail Panel</h4>
                  <div className="bg-dark-500 p-4 rounded-lg border border-dark-300">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-sm">URL Panel:</span>
                          <CopyButton text={pterodactylConfig.domain} />
                        </div>
                        <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono break-all">
                          {pterodactylConfig.domain}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-sm">Username:</span>
                          <CopyButton text={transaction.panelDetails.username} />
                        </div>
                        <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono">
                          {transaction.panelDetails.username}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-sm">Password:</span>
                          <CopyButton text={transaction.panelDetails.password} />
                        </div>
                        <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono">
                          {transaction.panelDetails.password}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-sm">Server ID:</span>
                          <CopyButton text={transaction.panelDetails.serverId.toString()} />
                        </div>
                        <div className="bg-dark-600 px-3 py-2 rounded text-gray-300 text-sm font-mono">
                          {transaction.panelDetails.serverId}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <a
                        href={pterodactylConfig.domain}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Login Sekarang
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
              }
