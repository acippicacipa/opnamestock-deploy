import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Save, CheckCircle, Package } from 'lucide-react'
import '../App.css'

export default function StockOpnamePage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  const [session, setSession] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [jumlahBarang, setJumlahBarang] = useState('')
  const [catatan, setCatatan] = useState('')
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSession()
    fetchDetails()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions`)
      const data = await response.json()
      if (data.success) {
        const currentSession = data.data.find(s => s.id === parseInt(sessionId))
        setSession(currentSession)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  const fetchDetails = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/details`)
      const data = await response.json()
      if (data.success) {
        setDetails(data.data)
      }
    } catch (error) {
      console.error('Error fetching details:', error)
    }
  }

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=10`)
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.data)
      }
    } catch (error) {
      console.error('Error searching products:', error)
    }
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    searchProducts(query)
  }

  const selectProduct = (product) => {
    setSelectedProduct(product)
    setSearchQuery(product.nama_produk)
    setSearchResults([])
    
    // Check if product already exists in details
    const existingDetail = details.find(d => d.product_id === product.id)
    if (existingDetail) {
      setJumlahBarang(existingDetail.jumlah_barang.toString())
      setCatatan(existingDetail.catatan || '')
    } else {
      setJumlahBarang('')
      setCatatan('')
    }
  }

  const handleSaveData = async () => {
    if (!selectedProduct) {
      alert('Pilih produk terlebih dahulu')
      return
    }

    if (!jumlahBarang || parseInt(jumlahBarang) < 0) {
      alert('Masukkan jumlah barang yang valid')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          jumlah_barang: parseInt(jumlahBarang),
          catatan: catatan.trim()
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Reset form
        setSelectedProduct(null)
        setSearchQuery('')
        setJumlahBarang('')
        setCatatan('')
        
        // Refresh details
        fetchDetails()
        
        //alert('Data berhasil direkam!')
      } else {
        alert('Gagal menyimpan data: ' + data.message)
      }
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Terjadi kesalahan saat menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSession = async () => {
    if (details.length === 0) {
      alert('Belum ada data yang direkam')
      return
    }

    if (!confirm('Yakin ingin menyelesaikan sesi stock opname ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: 'PUT',
      })

      const data = await response.json()

      if (data.success) {
        alert('Sesi stock opname berhasil diselesaikan!')
        navigate('/sessions')
      } else {
        alert('Gagal menyelesaikan sesi: ' + data.message)
      }
    } catch (error) {
      console.error('Error completing session:', error)
      alert('Terjadi kesalahan saat menyelesaikan sesi')
    }
  }

  if (!session) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stock Opname</h1>
            <p className="text-gray-600">
              Lokasi: {session.lokasi} • Status: 
              <Badge variant={session.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                {session.status === 'active' ? 'Aktif' : 'Selesai'}
              </Badge>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Input Data Stock Opname
              </CardTitle>
              <CardDescription>
                Cari produk dan masukkan jumlah barang
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Cari Produk</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Ketik nama atau kode produk..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="p-0 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => selectProduct(product)}
                        >
                          <div className="font-medium">{product.nama_produk}</div>
                          <div className="text-sm text-gray-500">
                            {product.kode_produk} • {product.kategori_produk}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Product */}
              {selectedProduct && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="font-medium">{selectedProduct.nama_produk}</div>
                  <div className="text-sm text-gray-600">
                    {selectedProduct.kode_produk} • {selectedProduct.kategori_produk}
                  </div>
                </div>
              )}

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label htmlFor="jumlah">Jumlah Barang</Label>
                <Input
                  id="jumlah"
                  type="number"
                  placeholder="0"
                  value={jumlahBarang}
                  onChange={(e) => setJumlahBarang(e.target.value)}
                  min="0"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan (Opsional)</Label>
                <Textarea
                  id="catatan"
                  placeholder="Tambahkan catatan jika diperlukan..."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveData}
                  disabled={loading || !selectedProduct}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Menyimpan...' : 'Rekam Data'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data List */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Data Terekam ({details.length})</CardTitle>
              <CardDescription>
                Daftar produk yang sudah direkam dalam sesi ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0 max-h-96 overflow-y-auto">
                {details.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Belum ada data yang direkam
                  </p>
                ) : (
                  details.map((detail) => (
                    <div key={detail.id} className="border rounded-md">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{detail.product.nama_produk}</div>
                          <div className="text-sm text-gray-500">
                            {detail.product.kode_produk} • {detail.product.kategori_produk}
                          </div>
                          {detail.catatan && (
                            <div className="text-sm text-gray-600 mt-1">
                              Catatan: {detail.catatan}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{detail.jumlah_barang}</div>
                          <div className="text-xs text-gray-500">pcs</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {details.length > 0 && session.status === 'active' && (
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    onClick={handleCompleteSession}
                    className="w-full"
                    variant="default"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Selesai Stock Opname
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}