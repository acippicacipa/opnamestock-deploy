import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, Package, Download } from 'lucide-react'

const SessionsPage = () => {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/sessions')
      const result = await response.json()
      
      if (result.success) {
        setSessions(result.data)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID')
  }

  const exportSession = async (sessionId) => {
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
      console.error('Error exporting session:', error)
      alert('Gagal export data')
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Riwayat Stock Opname</h1>
            <p className="text-gray-600">Daftar semua aktivitas stock opname</p>
          </div>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Riwayat
              </h3>
              <p className="text-gray-500 mb-4">
                Belum ada aktivitas stock opname yang tercatat
              </p>
              <Button onClick={() => navigate('/')}>
                Mulai Stock Opname
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <CardTitle className="text-lg">{session.lokasi}</CardTitle>
                        <CardDescription>
                          ID Sesi: #{session.id}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={session.status === 'active' ? 'default' : 'secondary'}
                    >
                      {session.status === 'active' ? 'Aktif' : 'Selesai'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Mulai</div>
                        <div className="text-sm text-gray-600">
                          {formatDateTime(session.waktu_mulai)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Selesai</div>
                        <div className="text-sm text-gray-600">
                          {formatDateTime(session.waktu_selesai)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">Total Item</div>
                        <div className="text-sm text-gray-600">
                          {session.total_items} item
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium">Dibuat oleh</div>
                        <div className="text-sm text-gray-600">
                          {session.created_by || 'Admin'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {session.status === 'active' ? (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/stock-opname/${session.id}`)}
                      >
                        Lanjutkan
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/stock-opname/${session.id}`)}
                      >
                        Lihat Detail
                      </Button>
                    )}
                    
                    {session.total_items > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportSession(session.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionsPage

