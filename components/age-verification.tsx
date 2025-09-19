"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export default function AgeVerification() {
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const verified = localStorage.getItem("age-verified")
    if (!verified) {
      setShowModal(true)
    }
  }, [mounted])

  const handleVerify = () => {
    localStorage.setItem("age-verified", "true")
    setShowModal(false)
  }

  const handleReject = () => {
    window.location.href = "https://www.disney.com"
  }

  if (!mounted) return null

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-gradient-to-br from-slate-900/95 via-gray-900/90 to-slate-800/95 backdrop-blur-xl border border-gray-300/20 rounded-lg max-w-md w-full p-10 shadow-2xl shadow-black/50"
          >
            <h2 className="text-2xl font-bold text-white text-center mb-2">Verificação de Idade</h2>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-500/50 to-transparent my-4"></div>

            <p className="text-white/90 text-center mb-6">
              Este site contém produtos destinados apenas para maiores de 18 anos.
            </p>

            <p className="text-white/90 text-center mb-8">Você confirma que tem 18 anos ou mais?</p>

            <div className="flex flex-col gap-3 justify-center px-4">
              <Button onClick={handleVerify} className="w-full bg-white hover:bg-gray-100 text-gray-800 font-medium">
                Sim, sou maior de 18 anos
              </Button>

              <Button
                onClick={handleReject}
                className="w-full bg-red-900/50 hover:bg-red-900/70 text-white border border-red-700/30"
              >
                Não, sou menor de idade
              </Button>
            </div>

            <p className="text-white/90 text-xs text-center mt-6">
              Ao clicar em "Sim", você confirma que tem idade legal para visualizar este conteúdo.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
