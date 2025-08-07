import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, FileSpreadsheet, TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react'
import '../App.css'

export default function ReportPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReport()
  }, [sessionId])

  const fetchReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/report`)
      const data = await response.json()
      
      if (data.success) {
        setReport(data.data)
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      setError('Terjadi kesalahan saat memuat laporan')
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/report/excel`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan_stock_opname_${report?.session_info?.lokasi}_${sessionId}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting report:', error)
      alert('Terjadi kesalahan saat export laporan')
    }
  }

  const formatDateTimeJakarta = (dateString) => {
  // Return an empty string or some placeholder if the date is null/undefined
  if (!dateString) {
    return ''; 
  }

  try {
    const date = new Date(dateString);

    // Check if the date is valid after parsing
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    const options = {
      timeZone: 'Asia/Jakarta', // The key part for timezone conversion
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Use 24-hour format
    };

    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (selisih) => {
    if (selisih === 0) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Akurat</Badge>
    } else if (selisih > 0) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Lebih</Badge>
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">Kurang</Badge>
    }
  }

  const getStatusIcon = (selisih) => {
    if (selisih === 0) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else if (selisih > 0) {
      return <TrendingUp className="h-4 w-4 text-blue-600" />
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat laporan...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={() => navigate('/sessions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </div>
          <Card className="shadow-lg">
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Laporan</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchReport}>Coba Lagi</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/sessions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report</h1>
              <p className="text-600">{report?.session_info?.lokasi}</p>
            </div>
          </div>
          {/* <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Laporan
          </Button> */}
        </div>

        {/* Session Info */}
        <Card className="shadow-lg mb-1">
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Lokasi</p>
                <p className="font-semibold">{report?.session_info?.lokasi}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Waktu Mulai</p>
                <p className="font-semibold">{formatDateTime(report?.session_info?.waktu_mulai)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Waktu Selesai</p>
                <p className="font-semibold">{formatDateTime(report?.session_info?.waktu_selesai)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant="secondary">{report?.session_info?.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards - Paling Sempit dan Ringkas */}
        {/* Summary Card - Opsi 2: Single Card dengan Grid 2x2 */}
<Card className="shadow-md">
  <CardContent className="p-4">
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">

      {/* Metrik 1: Total Item Dihitung */}
      <div className="flex items-start space-x-2">
        <FileSpreadsheet className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
        <div>
          <p className="text-lg font-bold text-gray-800 leading-tight">{report?.summary?.total_items_counted}</p>
          <p className="text-xs text-gray-500">Total Item Dihitung</p>
        </div>
      </div>

      {/* Metrik 2: Item Akurat */}
      <div className="flex items-start space-x-2">
        <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
        <div>
          <p className="text-lg font-bold text-green-600 leading-tight">{report?.summary?.items_accurate}</p>
          <p className="text-xs text-gray-500">Item Akurat</p>
        </div>
      </div>

      {/* Metrik 3: Item dengan Selisih */}
      <div className="flex items-start space-x-2">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
        <div>
          <p className="text-lg font-bold text-red-600 leading-tight">{report?.summary?.items_with_discrepancy}</p>
          <p className="text-xs text-gray-500">Item dengan Selisih</p>
        </div>
      </div>

      {/* Metrik 4: Akurasi */}
      <div className="flex items-start space-x-2">
        <TrendingUp className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
        <div>
          <p className="text-lg font-bold text-purple-600 leading-tight">{report?.summary?.accuracy_percentage}%</p>
          <p className="text-xs text-gray-500">Akurasi</p>
        </div>
      </div>

    </div>
  </CardContent>
</Card>



        {/* Discrepancies Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Daftar Item dengan Selisih</CardTitle>
            <CardDescription>
              {report?.discrepancies?.length > 0 
                ? `Menampilkan ${report.discrepancies.length} item yang memiliki selisih stok`
                : 'Tidak ada item dengan selisih - semua stok akurat!'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report?.discrepancies?.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Selamat!</h3>
                <p className="text-gray-600">Semua item memiliki stok yang akurat. Tidak ada selisih yang ditemukan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {/* <th className="text-left p-3">Kode</th> */}
                      <th className="text-left p-3">Nama</th>
                      <th className="text-right p-3">Stok</th>
                      <th className="text-right p-3">Fisik</th>
                      <th className="text-right p-3">Selisih</th>
                      <th className="text-center p-3">Status</th>
                      <th className="text-left p-3">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
            {report.discrepancies.map((item, index) => (
              <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                {/* Sel data dengan padding vertikal dan horizontal yang sempit */}
                <td className="px-2 py-1.5 whitespace-nowrap">{item.nama_produk}</td>
                <td className="px-2 py-1.5 text-right font-mono">{item.saldo_awal}</td>
                <td className="px-2 py-1.5 text-right font-mono">{item.jumlah_barang}</td>
                <td className="px-2 py-1.5 text-right">
                  <div className="flex items-center justify-end gap-1.5"> {/* Gap lebih kecil */}
                    {getStatusIcon(item.selisih)} {/* Pastikan ikon ini juga kecil, misal h-4 w-4 */}
                    <span className={`font-semibold font-mono ${
                      item.selisih > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {item.selisih > 0 ? '+' : ''}{item.selisih}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-center">
                  {/* Pastikan badge ini juga kecil, misal dengan text-xs */}
                  {getStatusBadge(item.selisih)}
                </td>
                <td className="px-2 py-1.5 text-gray-600">
                  {item.catatan || '-'}
                </td>
              </tr>
            ))}
          </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


