import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, ClipboardList, History, FileText } from 'lucide-react'
import '../App.css'

export default function HomePage() {
  const [lokasi, setLokasi] = useState('')
  const navigate = useNavigate()

  const handleStartStockOpname = async () => {
    if (!lokasi.trim()) {
      alert('Mohon masukkan lokasi stock opname')
      return
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lokasi: lokasi.trim(),
          created_by: 'user'
        }),
      })

      const data = await response.json()

      if (data.success) {
        navigate(`/stock-opname/${data.data.id}`)
      } else {
        alert('Gagal membuat sesi: ' + data.message)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat membuat sesi')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Stock Opname System
          </h1>
          <p className="text-lg text-gray-600">
            Sistem manajemen stock opname yang mudah dan efisien
          </p>
        </div>

        {/* Main Action Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              Mulai Stock Opname
            </CardTitle>
            <CardDescription>
              Masukkan lokasi untuk memulai sesi stock opname baru
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lokasi">Lokasi Stock Opname</Label>
              <Input
                id="lokasi"
                placeholder="Contoh: Gudang A, Toko Cabang 1, dll."
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleStartStockOpname()}
              />
            </div>
            <Button 
              onClick={handleStartStockOpname}
              className="w-full"
              size="lg"
            >
              Start Stock Opname
            </Button>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/products')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Manajemen Produk
              </CardTitle>
              <CardDescription>
                Update stok produk, tambah produk baru 
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Kelola Produk
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/sessions')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Riwayat Stock Opname
              </CardTitle>
              <CardDescription>
                Lihat semua sesi stock opname yang pernah dilakukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Lihat Riwayat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/sessions')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Laporan & Export
              </CardTitle>
              <CardDescription>
                Export data ke Excel atau CSV untuk analisis lebih lanjut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Lihat di Riwayat
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Stock Opname System v1.0</p>
        </div>
      </div>
    </div>
  )
}
