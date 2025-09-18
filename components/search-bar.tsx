"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface SearchBarProps {
  defaultValue?: string
}

export default function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/pesquisa?q=${encodeURIComponent(query)}`)
    }
  }

  const clearSearch = () => {
    setQuery("")
  }

  return (
    <motion.form
      onSubmit={handleSearch}
      className={`flex w-full relative overflow-hidden rounded-md border transition-all duration-300 ${
        isFocused ? "border-gray-400/50 shadow-[0_0_0_1px_rgba(156,163,175,0.3)]" : "border-[#1A1450]/30"
      }`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative flex-grow">
        <Input
          type="text"
          placeholder="O que deseja fumar hoje?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-grow bg-gradient-to-br from-[#141318] to-black border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/80 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button
        type="submit"
        className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-100 hover:to-gray-200 text-gray-800 font-medium transition-all duration-300 ml-2 border border-gray-400/50 shadow-lg hover:shadow-xl"
      >
        <Search className="h-4 w-4 mr-2" />
        Buscar
      </Button>
    </motion.form>
  )
}
