import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Eye, Download, FileSpreadsheet } from 'lucide-react'
import '../App.css'

export default function SessionsPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 })

  useEffect(() => {
    fetchSessions()
  }, [pagination.page])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        per_page: 10
      })
      
      const response = await fetch(`/api/sessions?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setSessions(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  // const handleExportCSV = async (sessionId, lokasi) => {
  //   try {
  //     const response = await fetch(`/api/sessions/${sessionId}/export`)
  //     const blob = await response.blob()
      
  //     const url = window.URL.createObjectURL(blob)
  //     const a = document.createElement('a')
  //     a.href = url
  //     a.download = `stock_opname_${lokasi}_${sessionId}_${new Date().toISOString().split('T')[0]}.csv`
  //     document.body.appendChild(a)
  //     a.click()
  //     window.URL.revokeObjectURL(url)
  //     document.body.removeChild(a)
  //   } catch (error) {
  //     console.error('Error exporting CSV:', error)
  //     alert('Terjadi kesalahan saat export CSV')
  //   }
  // }

  const handleExportExcel = async (sessionId, lokasi) => {
    try {
      const response = await fetch(`/api/export/stock-opname/${sessionId}/excel`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stock_opname_${lokasi}_${sessionId}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Terjadi kesalahan saat export Excel')
    }
  }

  const handleViewReport = (sessionId) => {
    navigate(`/report/${sessionId}`)
  }

  const handleExportReport = async (sessionId, lokasi) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/report/excel`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan_stock_opname_${lokasi}_${sessionId}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting report:', error)
      alert('Terjadi kesalahan saat export laporan')
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDuration = (start, end) => {
    if (!start || !end) return '-'
    const startTime = new Date(start)
    const endTime = new Date(end)
    const diffMs = endTime - startTime
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const minutes = diffMins % 60
    
    if (hours > 0) {
      return `${hours}j ${minutes}m`
    }
    return `${minutes}m`
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
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Stock Opname</h1>
            <p className="text-gray-600">Lihat semua sesi stock opname yang pernah dilakukan</p>
          </div>
        </div>

        {/* Sessions List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Daftar Sesi ({pagination.total})</CardTitle>
            <CardDescription>
              Riwayat lengkap semua aktivitas stock opname
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada sesi stock opname
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="p-6 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{session.lokasi}</h3>
                          <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                            {session.status === 'active' ? 'Aktif' : 'Selesai'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Mulai: {formatDateTime(session.waktu_mulai)}</div>
                          <div>Selesai: {formatDateTime(session.waktu_selesai)}</div>
                          <div>Durasi: {calculateDuration(session.waktu_mulai, session.waktu_selesai)}</div>
                          <div>Total Item: {session.total_items} produk</div>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="text-sm text-gray-600 space-y-1">
                          {session.status === 'active' ? (
                            <>
                              <Button 
                                onClick={() => navigate(`/stock-opname/${session.id}`)}
                                size="sm"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Lanjutkan
                              </Button>
                              <Button size="sm" onClick={() => handleViewReport(session.id)}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Hasil Sementara
                              </Button>
                            </>
                        ) : (
                          <>
                          <div>
                            <Button  
                              size="sm"
                              onClick={() => navigate(`/stock-opname/${session.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat
                            </Button>
                          </div>
                          <div>
                            <Button 
                              size="sm"
                              onClick={() => handleViewReport(session.id)}
                            >
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Hasil
                            </Button>
                          </div>
                          <div>
                            <Button  
                              size="sm"
                              onClick={() => handleExportExcel(session.id, session.lokasi)}
                            >
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                          </>
                        )}
                        </div>
                        
                      </div>
                    </div>
                    
                    {/* Progress Bar for Active Sessions */}
                    {session.status === 'active' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{session.total_items} item terekam</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: session.total_items > 0 ? '60%' : '10%' }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
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
