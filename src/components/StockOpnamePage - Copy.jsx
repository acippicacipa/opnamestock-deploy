import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Search, Package, Check, ArrowLeft, Download } from 'lucide-react'

const StockOpnamePage = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  const [session, setSession] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [recordedItems, setRecordedItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSession()
    fetchRecordedItems()
  }, [sessionId])

  const fetchSession = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions`)
      const result = await response.json()
      
      if (result.success) {
        const currentSession = result.data.find(s => s.id === parseInt(sessionId))
        setSession(currentSession)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  const fetchRecordedItems = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/details`)
      const result = await response.json()
      
      if (result.success) {
        setRecordedItems(result.data)
      }
    } catch (error) {
      console.error('Error fetching recorded items:', error)
    }
  }

  const searchProducts = async (keyword) => {
    if (!keyword.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/search?keyword=${encodeURIComponent(keyword)}&limit=5`)
      const result = await response.json()
      
      if (result.success) {
        setSearchResults(result.data)
      }
    } catch (error) {
      console.error('Error searching products:', error)
    }
  }

  const handleSearchChange = (value) => {
    setSearchKeyword(value)
    searchProducts(value)
  }

  const selectProduct = (product) => {
    setSelectedProduct(product)
    setSearchKeyword(product.nama_produk)
    setSearchResults([])
    setQuantity('')
    setNotes('')
  }

  const recordData = async () => {
    if (!selectedProduct || !quantity.trim()) {
      alert('Mohon pilih produk dan masukkan jumlah')
      return
    }

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty < 0) {
      alert('Jumlah harus berupa angka positif')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          jumlah_barang: qty,
          catatan: notes.trim()
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Reset form
        setSelectedProduct(null)
        setSearchKeyword('')
        setQuantity('')
        setNotes('')
        
        // Refresh recorded items
        fetchRecordedItems()
        
        alert('Data berhasil direkam!')
      } else {
        alert('Error: ' + result.message)
      }
    } catch (error) {
      console.error('Error recording data:', error)
      alert('Gagal merekam data')
    } finally {
      setLoading(false)
    }
  }

  const completeSession = async () => {
    if (recordedItems.length === 0) {
      alert('Belum ada data yang direkam')
      return
    }

    const confirm = window.confirm('Apakah Anda yakin ingin menyelesaikan stock opname ini?')
    if (!confirm) return

    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Stock opname berhasil diselesaikan!')
        navigate('/sessions')
      } else {
        alert('Error: ' + result.message)
      }
    } catch (error) {
      console.error('Error completing session:', error)
      alert('Gagal menyelesaikan stock opname')
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/export`)
      const result = await response.json()
      
      if (result.success) {
        // Create and download CSV file
        const blob = new Blob([result.data.csv_data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.data.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        alert('Error: ' + result.message)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Gagal export data')
    }
  }

  if (!session) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Stock Opname</h1>
              <p className="text-gray-600">Lokasi: {session.lokasi}</p>
            </div>
          </div>
          <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
            {session.status === 'active' ? 'Aktif' : 'Selesai'}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Input Data Stock Opname
              </CardTitle>
              <CardDescription>
                Cari produk dan masukkan jumlah stock
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Search */}
              <div className="relative">
                <Label htmlFor="search">Cari Produk</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Ketik nama atau kode produk..."
                  value={searchKeyword}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="mt-1"
                />
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => selectProduct(product)}
                      >
                        <div className="font-medium">{product.nama_produk}</div>
                        <div className="text-sm text-gray-500">
                          Kode: {product.kode_produk}
                          {product.kategori_produk && ` | ${product.kategori_produk}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Product */}
              {selectedProduct && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Produk Terpilih</span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{selectedProduct.nama_produk}</div>
                      <div className="text-gray-600">Kode: {selectedProduct.kode_produk}</div>
                      {selectedProduct.kategori_produk && (
                        <div className="text-gray-600">Kategori: {selectedProduct.kategori_produk}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quantity Input */}
              <div>
                <Label htmlFor="quantity">Jumlah Barang</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  placeholder="Masukkan jumlah..."
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Catatan tambahan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={recordData}
                  disabled={loading || !selectedProduct || !quantity}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {loading ? 'Merekam...' : 'Rekam Data'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recorded Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Terekam</CardTitle>
                  <CardDescription>
                    {recordedItems.length} item telah direkam
                  </CardDescription>
                </div>
                {recordedItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recordedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data yang direkam
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recordedItems.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-gray-500">
                            Kode: {item.product_code}
                          </div>
                          {item.catatan && (
                            <div className="text-sm text-gray-600 mt-1">
                              Catatan: {item.catatan}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {item.jumlah_barang}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Complete Session Button */}
        {session.status === 'active' && recordedItems.length > 0 && (
          <div className="mt-6 text-center">
            <Button 
              onClick={completeSession}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              Selesai Stock Opname
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StockOpnamePage

