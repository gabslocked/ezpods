"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic'

// Importação dinâmica para evitar SSR
const MapComponent = dynamic(() => import('./sales-map-component'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center text-gray-400 bg-gray-900/50 rounded-lg border border-gray-700">
      Carregando mapa...
    </div>
  )
})

// Coordenadas das principais cidades brasileiras
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
  'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
  'Curitiba': { lat: -25.4284, lng: -49.2733 },
  'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
  'Salvador': { lat: -12.9714, lng: -38.5014 },
  'Fortaleza': { lat: -3.7172, lng: -38.5433 },
  'Brasília': { lat: -15.8267, lng: -47.9218 },
  'Recife': { lat: -8.0476, lng: -34.8770 },
  'Manaus': { lat: -3.1190, lng: -60.0217 },
}

interface SalesMapProps {
  data: Array<{ city: string; state: string; orders: number; revenue: number }>
}

export function SalesMap({ data }: SalesMapProps) {
  // Calcula cor baseada na quantidade de pedidos
  const getColor = (orders: number) => {
    if (orders >= 20) return '#10b981' // green-500
    if (orders >= 10) return '#3b82f6' // blue-500
    if (orders >= 5) return '#f59e0b' // amber-500
    return '#ef4444' // red-500
  }

  // Adiciona coordenadas aos dados
  const regionsWithCoords = data
    .map(region => ({
      ...region,
      lat: cityCoordinates[region.city]?.lat || 0,
      lng: cityCoordinates[region.city]?.lng || 0,
    }))
    .filter(region => region.lat !== 0 && region.lng !== 0)

  return (
    <Card className="bg-gray-800/50 border-gray-600/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between flex-wrap gap-2">
          <span>🗺️ Vendas por Região</span>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-400">{'<5'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-gray-400">5-9</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-400">10-19</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-400">20+</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MapComponent data={data} />
        
        {/* Lista de regiões abaixo do mapa */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {regionsWithCoords.slice(0, 10).map((region, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getColor(region.orders) }}
                ></div>
                <div>
                  <div className="text-white text-sm font-medium">
                    {region.city} - {region.state}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {region.orders} pedidos
                  </div>
                </div>
              </div>
              <div className="text-green-400 font-semibold text-sm">
                R$ {region.revenue.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
