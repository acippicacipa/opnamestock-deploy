import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, Plus, Search, Upload, Download, FileText } from 'lucide-react'
import { saveAs } from 'file-saver';
import '../App.css'

export default function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 })
  
  // Add Product Form
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newProduct, setNewProduct] = useState({
    kode_produk: '',
    nama_produk: '',
    saldo_awal: ''
  })

  // Import
  const [importFile, setImportFile] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [pagination.page, searchQuery])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        per_page: 10,
        search: searchQuery
      })
      
      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.kode_produk || !newProduct.nama_produk || !newProduct.saldo_awal) {
      alert('Semua field harus diisi')
      return
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      })

      const data = await response.json()

      if (data.success) {
        setNewProduct({ kode_produk: '', nama_produk: '', saldo_awal: '' })
        setShowAddDialog(false)
        fetchProducts()
        alert('Produk berhasil ditambahkan!')
      } else {
        alert('Gagal menambahkan produk: ' + data.message)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Terjadi kesalahan saat menambahkan produk')
    }
  }

  const handleImportCSV = async () => {
    if (!importFile) {
      alert('Pilih file CSV terlebih dahulu')
      return
    }

    const formData = new FormData()
    formData.append('file', importFile)

    try {
      const response = await fetch('/api/import/products', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setImportFile(null)
        fetchProducts()
        alert(`Import berhasil! ${data.success_count} produk berhasil diimport, ${data.error_count} error`)
        if (data.errors.length > 0) {
          console.log('Import errors:', data.errors)
        }
      } else {
        alert('Gagal import: ' + data.message)
      }
    } catch (error) {
      console.error('Error importing:', error)
      alert('Terjadi kesalahan saat import')
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/export/products')
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `products_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Terjadi kesalahan saat export')
    }
  }

  const handleExportExcel = async () => {
  try {
    const response = await fetch('/api/export/products/excel'); // Asumsi ada endpoint ini di backend
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    saveAs(blob, 'products.xlsx');
    alert('Produk berhasil diekspor ke Excel!');
  } catch (error) {
    console.error('Error exporting products to Excel:', error);
    alert('Gagal mengekspor produk ke Excel. Silakan coba lagi.');
  }
}


  const handleDownloadTemplate = async () => {
    try {
    const response = await fetch('/api/template/products/excel'); // Asumsi ada endpoint ini di backend
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    saveAs(blob, 'products.xlsx');
    alert('Produk berhasil diekspor ke Excel!');
  } catch (error) {
    console.error('Error exporting products to Excel:', error);
    alert('Gagal mengekspor produk ke Excel. Silakan coba lagi.');
  }
}

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manajemen Produk</h1>
              <p className="text-gray-600">Kelola data produk untuk stock opname</p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-small">Tambah Produk</div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Produk Baru</DialogTitle>
                <DialogDescription>
                  Masukkan informasi produk baru
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kode">Kode Produk</Label>
                  <Input
                    id="kode"
                    placeholder="P001"
                    value={newProduct.kode_produk}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, kode_produk: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Produk</Label>
                  <Input
                    id="nama"
                    placeholder="Laptop Gaming"
                    value={newProduct.nama_produk}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, nama_produk: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saldo">Stok</Label>
                  <Input
                    id="saldo"
                    placeholder="0"
                    value={newProduct.saldo_awal}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, saldo_awal: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddProduct} className="w-full">
                  Simpan Produk
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-small mb-2">Import Excel</div>
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span>Pilih File</span>
                </Button>
              </label>
              {importFile && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600">{importFile.name}</div>
                  <Button onClick={handleImportCSV} size="sm" className="mt-1">
                    Import
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleExportExcel}>
            <CardContent className="p-4 text-center">
              <Download className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-small">Export Excel</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleDownloadTemplate}>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="font-medium">Template Excel</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Products List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Daftar Produk ({pagination.total})</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="max-w-sm"
                />
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? 'Tidak ada produk yang ditemukan' : 'Belum ada produk'}
              </div>
            ) : (
              <div className="space-y-0">
                {products.map((product) => (
                  <div key={product.id} className="p-4 border rounded-md hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-lg">{product.nama_produk} ({product.kode_produk})</div>
                        
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(product.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}