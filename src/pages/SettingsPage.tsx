import { Link } from 'react-router'
import MainLayout from '@/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Settings,
  Package,
  ChevronRight,
  Workflow
} from 'lucide-react'

const SettingsPage = () => {
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
          <p className="text-gray-600">Manage your application settings and configurations</p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsItems.map((item) => {
            const IconComponent = item.icon
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

            <Card className="opacity-60">
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
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default SettingsPage