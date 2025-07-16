import MainLayout from '@/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

const apiMethods = [
  { value: 'POST', label: 'POST' },
  { value: 'GET', label: 'GET' }
]

const ApiIntegrationPage = () => {
  const [method, setMethod] = useState('POST')
  const [body, setBody] = useState(`{
  "kota": "Enter value..."
}`)

  return (
    <MainLayout>
      <div className="p-6 flex flex-col gap-6">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to tools
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel */}
            <Card className="shadow-none border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">check_covered_area</CardTitle>
                <div className="text-gray-600 mt-2">check apakah wilayah yang dijawab oleh client tercover area</div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Method & Address */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-1">Method</label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {apiMethods.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <Input value="https://www.abangbenerin.com/api/location/check" readOnly className="font-mono" />
                  </div>
                </div>
                {/* AI Inputs */}
                <div>
                  <label className="block text-sm font-medium mb-1">AI Inputs</label>
                  <div className="text-xs text-gray-500 mb-2">Ini adalah input yang akan diisi oleh AI berdasarkan percakapan dengan pengguna.</div>
                  <div className="bg-gray-50 border rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">kota</span>
                      <span className="text-xs text-gray-500">string</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">nama kota atau nama kecamatan. jika client menjawab selain nama kota pastikan wilayah tersebut dari kota mana.</div>
                    <div className="flex flex-wrap gap-2">
                      {['Kota_Tangerang','Kabupaten_Tangerang','Kota_Tangerang_Selatan','Kota_Jakarta_Pusat','Kota_Jakarta_Barat','Kota_Jakarta_Timur','Kota_Jakarta_Utara','Kota_Jakarta_Selatan','Kota_Bekasi','Kota_Depok','Uncovered'].map((kota) => (
                        <span key={kota} className="bg-green-50 text-green-700 border border-green-200 rounded px-2 py-0.5 text-xs">{kota}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Additional Payload */}
                <div>
                  <label className="block text-sm font-medium mb-1">Additional Payload</label>
                  <Textarea placeholder="Tambahkan payload tambahan jika diperlukan..." className="min-h-[40px]" />
                </div>
              </CardContent>
            </Card>
            {/* Right Panel */}
            <Card className="shadow-none border border-gray-200 bg-gray-900 text-white flex flex-col h-full">
              <CardHeader className="flex-row items-center gap-2 pb-2">
                <span className="bg-blue-700 text-xs px-2 py-0.5 rounded mr-2">{method}</span>
                <Input value="https://www.abangbenerin.com/api/location/check" readOnly className="bg-gray-800 text-white font-mono border-none p-1 h-8" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">POST Body</div>
                  <Textarea
                    className="bg-gray-800 text-white font-mono min-h-[120px]"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                  />
                  <div className="text-xs text-gray-500 mt-1">nama kota atau nama kecamatan. jika client menjawab selain nama kota pastikan wilayah tersebut dari kota mana.</div>
                </div>
                <Button className="self-end bg-violet-600 hover:bg-violet-700" disabled>Send Request</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default ApiIntegrationPage 