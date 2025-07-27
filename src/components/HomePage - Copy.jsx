import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Package, History, FileText, Plus } from 'lucide-react'

const HomePage = () => {
  const [lokasi, setLokasi] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleStartStockOpname = async () => {
    if (!lokasi.trim()) {
      alert('Mohon masukkan lokasi stock opname')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lokasi: lokasi.trim(),
          created_by: 'Admin'
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        navigate(`/stock-opname/${result.data.id}`)
      } else {
        alert('Error: ' + result.message)
      }
    } catch (error) {
      console.error('Error starting session:', error)
      alert('Gagal memulai sesi stock opname')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Stock Opname System
          </h1>
          <p className="text-lg text-gray-600">
            Sistem manajemen stock opname yang mudah dan efisien
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Start Stock Opname Card */}
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Package className="h-6 w-6" />
                Mulai Stock Opname
              </CardTitle>
              <CardDescription>
                Mulai sesi stock opname baru dengan menentukan lokasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lokasi">Lokasi Stock Opname</Label>
                <Input
                  id="lokasi"
                  type="text"
                  placeholder="Contoh: Gudang A, Toko Cabang 1, dll."
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleStartStockOpname}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Memulai...' : 'Start Stock Opname'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Menu Lainnya
              </CardTitle>
              <CardDescription>
                Akses fitur-fitur tambahan sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/sessions')}
              >
                <History className="h-4 w-4 mr-2" />
                Riwayat Stock Opname
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/products')}
              >
                <Package className="h-4 w-4 mr-2" />
                Manajemen Produk
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Package className="h-12 w-12 mx-auto text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">Pencarian Cepat</h3>
              <p className="text-sm text-gray-600">
                Cari produk dengan kata kunci untuk input yang lebih cepat
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <FileText className="h-12 w-12 mx-auto text-green-600 mb-3" />
              <h3 className="font-semibold mb-2">Export Excel</h3>
              <p className="text-sm text-gray-600">
                Export hasil stock opname ke format Excel dengan rekap otomatis
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <History className="h-12 w-12 mx-auto text-purple-600 mb-3" />
              <h3 className="font-semibold mb-2">Riwayat Lengkap</h3>
              <p className="text-sm text-gray-600">
                Simpan dan akses riwayat semua aktivitas stock opname
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HomePage

