"use client"

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Importação dinâmica do mapa para evitar SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface SalesRegion {
  city: string
  state: string
  orders: number
  revenue: number
  lat: number
  lng: number
}

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="bg-gray-800/50 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-white">🗺️ Vendas por Região</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-gray-400">
            Carregando mapa...
          </div>
        </CardContent>
      </Card>
    )
  }

  // Adiciona coordenadas aos dados
  const regionsWithCoords: SalesRegion[] = data
    .map(region => ({
      ...region,
      lat: cityCoordinates[region.city]?.lat || 0,
      lng: cityCoordinates[region.city]?.lng || 0,
    }))
    .filter(region => region.lat !== 0 && region.lng !== 0)

  // Calcula o raio baseado na receita (maior receita = maior bolha)
  const maxRevenue = Math.max(...regionsWithCoords.map(r => r.revenue))
  const getRadius = (revenue: number) => {
    const minRadius = 15
    const maxRadius = 50
    return minRadius + ((revenue / maxRevenue) * (maxRadius - minRadius))
  }

  // Calcula cor baseada na quantidade de pedidos
  const getColor = (orders: number) => {
    if (orders >= 20) return '#10b981' // green-500
    if (orders >= 10) return '#3b82f6' // blue-500
    if (orders >= 5) return '#f59e0b' // amber-500
    return '#ef4444' // red-500
  }

  return (
    <Card className="bg-gray-800/50 border-gray-600/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>🗺️ Vendas por Região</span>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-400">{'<5 pedidos'}</span>
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
        <div className="h-[500px] rounded-lg overflow-hidden border border-gray-700">
          <MapContainer
            center={[-15.7801, -47.9292]} // Centro do Brasil
            zoom={4}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {regionsWithCoords.map((region, index) => (
              <CircleMarker
                key={index}
                center={[region.lat, region.lng]}
                radius={getRadius(region.revenue)}
                fillColor={getColor(region.orders)}
                color="#fff"
                weight={2}
                opacity={0.8}
                fillOpacity={0.6}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold text-lg mb-1">
                      {region.city} - {region.state}
                    </div>
                    <div className="space-y-1">
                      <div>
                        <span className="font-semibold">Pedidos:</span> {region.orders}
                      </div>
                      <div>
                        <span className="font-semibold">Receita:</span> R$ {region.revenue.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        Ticket médio: R$ {(region.revenue / region.orders).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
        
        {/* Lista de regiões abaixo do mapa */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {regionsWithCoords.slice(0, 10).map((region, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg border border-gray-700"
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
