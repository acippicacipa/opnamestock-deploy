import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { ArrowLeft, Search, Upload, Download, Plus, Package } from 'lucide-react'

const ProductsPage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Form states
  const [newProduct, setNewProduct] = useState({
    kode_produk: '',
    nama_produk: '',
    kategori_produk: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [currentPage, searchTerm])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 10,
        search: searchTerm
      })
      
      const response = await fetch(`http://localhost:5000/api/products?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setProducts(result.data)
        setTotalPages(result.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const addProduct = async () => {
    if (!newProduct.kode_produk || !newProduct.nama_produk) {
      alert('Kode produk dan nama produk wajib diisi')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      })

      const result = await response.json()
      
      if (result.success) {
        setNewProduct({ kode_produk: '', nama_produk: '', kategori_produk: '' })
        setShowAddForm(false)
        fetchProducts()
        alert('Produk berhasil ditambahkan!')
      } else {
        alert('Error: ' + result.message)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Gagal menambahkan produk')
    }
  }

  const importProducts = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:5000/api/import/products', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (result.success) {
        fetchProducts()
        alert(result.message)
        if (result.data.errors.length > 0) {
          console.log('Import errors:', result.data.errors)
        }
      } else {
        alert('Error: ' + result.message)
      }
    } catch (error) {
      console.error('Error importing products:', error)
      alert('Gagal import produk')
    }
  }

  const exportProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/export/products')
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
      console.error('Error exporting products:', error)
      alert('Gagal export produk')
    }
  }

  const downloadTemplate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/template/products')
      const result = await response.json()
      
      if (result.success) {
        // Create and download CSV template
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
      console.error('Error downloading template:', error)
      alert('Gagal download template')
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('File harus berformat CSV')
        return
      }
      importProducts(file)
    }
    // Reset file input
    event.target.value = ''
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
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
              <h1 className="text-2xl font-bold">Manajemen Produk</h1>
              <p className="text-gray-600">Kelola data produk untuk stock opname</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Import/Export Data</CardTitle>
              <CardDescription>
                Import produk dari CSV atau export data yang ada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportProducts}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="w-full"
              >
                Download Template CSV
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tambah Produk</CardTitle>
              <CardDescription>
                Tambah produk baru secara manual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showAddForm ? 'Batal' : 'Tambah Produk'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Form Tambah Produk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="kode">Kode Produk *</Label>
                  <Input
                    id="kode"
                    type="text"
                    placeholder="Contoh: P001"
                    value={newProduct.kode_produk}
                    onChange={(e) => setNewProduct({
                      ...newProduct,
                      kode_produk: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="nama">Nama Produk *</Label>
                  <Input
                    id="nama"
                    type="text"
                    placeholder="Nama produk"
                    value={newProduct.nama_produk}
                    onChange={(e) => setNewProduct({
                      ...newProduct,
                      nama_produk: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="kategori">Kategori</Label>
                  <Input
                    id="kategori"
                    type="text"
                    placeholder="Kategori produk"
                    value={newProduct.kategori_produk}
                    onChange={(e) => setNewProduct({
                      ...newProduct,
                      kategori_produk: e.target.value
                    })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addProduct}>
                  Simpan Produk
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari produk berdasarkan nama, kode, atau kategori..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar Produk</CardTitle>
              <Badge variant="secondary">
                {products.length} produk
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Produk Tidak Ditemukan' : 'Belum Ada Produk'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? 'Coba gunakan kata kunci yang berbeda'
                    : 'Mulai dengan menambah produk atau import dari CSV'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-lg">{product.nama_produk}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Kode:</span> {product.kode_produk}
                            {product.kategori_produk && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="font-medium">Kategori:</span> {product.kategori_produk}
                              </>
                            )}
                          </div>
                          {product.created_at && (
                            <div className="text-xs text-gray-500 mt-1">
                              Ditambahkan: {new Date(product.created_at).toLocaleDateString('id-ID')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProductsPage

