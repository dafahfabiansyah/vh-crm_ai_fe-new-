import { Link } from 'react-router'
import MainLayout from '@/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Settings,
  Package,
  ChevronRight,
  Workflow,
  Combine,
  Star
} from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const SettingsPage = () => {
  const [openIntegrationModal, setOpenIntegrationModal] = useState(false)
  const handleIntegrationClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setOpenIntegrationModal(true)
  }
  const handleNavigate = (path: string) => {
    setOpenIntegrationModal(false)
    setTimeout(() => {
      window.location.href = path
    }, 200)
  }
  const settingsItems = [
    {
      id: 'products',
      title: 'Product Management',
      description: 'Manage your products, inventory, and pricing',
      icon: Package,
      path: '/products',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'flow',
      title: 'Flow Settings',
      description: 'Configure automation flows and workflows',
      icon: Workflow,
      path: '/flow',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'csat',
      title: 'CSAT Settings',
      description: 'Configure CSAT settings',
      icon: Star,
      path: '/csat',
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      id: 'Integration',
      title: 'Integration Settings',
      description: 'API keys, webhooks, and third-party integrations',
      icon: Combine,
      path: '/integration/shipping',
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      onClick: handleIntegrationClick
    }
  ]

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                to="#"
                onClick={(e) => { e.preventDefault(); window.history.back(); }}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
          {/* <p className="text-gray-600">Manage your application settings and configurations</p> */}
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsItems.map((item) => {
            const IconComponent = item.icon
            // Untuk Integration, gunakan onClick custom
            if (item.id === 'Integration') {
              return (
                <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={item.onClick}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${item.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${item.iconColor}`} />
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    <Button className="w-full" variant="outline">
                      Open Settings
                    </Button>
                  </CardContent>
                </Card>
              )
            }
            // Default untuk card lain
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${item.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${item.iconColor}`} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                  <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                  <Link to={item.path}>
                    <Button className="w-full" variant="outline">
                      Open Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {/* Modal Integration */}
        <Dialog open={openIntegrationModal} onOpenChange={setOpenIntegrationModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Pilih Integration</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 mt-2">
              <Card className="cursor-pointer hover:shadow-md transition" onClick={() => handleNavigate('/integration/shipping')}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Shipping Integration</div>
                    <div className="text-sm text-gray-600">Integrasi dengan layanan pengiriman</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition" onClick={() => handleNavigate('/integration/api')}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Combine className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">API Integration</div>
                    <div className="text-sm text-gray-600">Integrasi API eksternal & webhook</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>

        {/* Coming Soon Section */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="opacity-60">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Settings className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">User Preferences</h3>
                    <p className="text-sm text-gray-500">Theme, language, and notification settings</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Settings className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Security Settings</h3>
                    <p className="text-sm text-gray-500">Password, 2FA, and security preferences</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            {/* <Card className="opacity-60">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Settings className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Integration Settings</h3>
                    <p className="text-sm text-gray-500">API keys, webhooks, and third-party integrations</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default SettingsPage