import React from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

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

interface MapComponentProps {
  data: Array<{ city: string; state: string; orders: number; revenue: number }>
}

export default function MapComponent({ data }: MapComponentProps) {
  // Adiciona coordenadas aos dados
  const regionsWithCoords: SalesRegion[] = data
    .map(region => ({
      ...region,
      lat: cityCoordinates[region.city]?.lat || 0,
      lng: cityCoordinates[region.city]?.lng || 0,
    }))
    .filter(region => region.lat !== 0 && region.lng !== 0)

  // Calcula o raio baseado na receita (maior receita = maior bolha)
  const maxRevenue = Math.max(...regionsWithCoords.map(r => r.revenue), 1)
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
            pathOptions={{
              fillColor: getColor(region.orders),
              color: '#fff',
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.6,
            }}
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
  )
}
