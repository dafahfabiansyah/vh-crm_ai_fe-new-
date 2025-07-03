import React, { useState } from 'react'
import MainLayout from '@/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  X,
  Package
} from 'lucide-react'
import { Link } from 'react-router'

interface Product {
  id: string
  code: string
  name: string
  description: string
  price: number
  weight: number
  stock: number
  colors: string[]
  material: string
  image: string
  category: string
  createdAt: string
  updatedAt: string
}

interface ProductFormData {
  name: string
  description: string
  price: string
  weight: string
  stock: string
  colors: string
  material: string
  image: string
  category: string
}

// Mock data berdasarkan katalog yang diberikan
const initialProducts: Product[] = [
  {
    id: '1',
    code: 'BJ-001',
    name: 'Florenza Top',
    description: 'Atasan knit yang manis dan ringan ini cocok banget buat kamu yang suka gaya simple tapi tetap terlihat fresh. Kombinasi knit dan cotton-nya bikin adem dipakai seharian, pas buat nongkrong sore sampai kerja semi-formal.',
    price: 100000,
    weight: 250,
    stock: 5,
    colors: ['Yellow', 'Grey'],
    material: 'Knit mix Cotton',
    image: 'https://tumbuhin.s3.ap-southeast-1.amazonaws.com/Florenza+Top.jpg',
    category: 'Baju',
    createdAt: '2025-01-03',
    updatedAt: '2025-01-03'
  },
  {
    id: '2',
    code: 'BJ-002',
    name: 'Elina Top',
    description: 'Basic top yang wajib banget kamu punya! Modelnya clean dan versatile, bisa dipadukan dengan apa saja. Bahan mosscrepe-nya jatuh, ringan, dan tidak nerawang.',
    price: 110000,
    weight: 200,
    stock: 5,
    colors: ['Black', 'White'],
    material: 'Mosscrepe',
    image: 'https://tumbuhin.s3.ap-southeast-1.amazonaws.com/Elina+Top.jpg',
    category: 'Baju',
    createdAt: '2025-01-03',
    updatedAt: '2025-01-03'
  },
  {
    id: '3',
    code: 'BJ-003',
    name: 'Rana Dress',
    description: 'Casual dress dengan potongan loose dan bahan linen yang adem—cocok buat daily outfit sampai jalan-jalan santai. Warna-warnanya earthy dan kalem, bikin look kamu makin natural & chic.',
    price: 85000,
    weight: 180,
    stock: 5,
    colors: ['Black', 'Darkgrey', 'Army'],
    material: 'Linen',
    image: 'https://tumbuhin.s3.ap-southeast-1.amazonaws.com/Rana+Dress.jpg',
    category: 'Baju',
    createdAt: '2025-01-03',
    updatedAt: '2025-01-03'
  },
  {
    id: '4',
    code: 'CL-001',
    name: 'Gardena Pants',
    description: 'Celana santai yang jatuhnya cantik banget di kaki! Bahan snowy rib yang tebal tapi adem, cocok dipakai ke kantor, kampus, atau sekadar hangout cantik.',
    price: 140000,
    weight: 390,
    stock: 5,
    colors: ['Broken White', 'Black', 'Millo', 'Salmon', 'Baby Pink', 'Dark Grey', 'Beige'],
    material: 'Snowy Rib',
    image: 'https://tumbuhin.s3.ap-southeast-1.amazonaws.com/Gardena+Pants.jpg',
    category: 'Celana',
    createdAt: '2025-01-03',
    updatedAt: '2025-01-03'
  },
  {
    id: '5',
    code: 'CL-002',
    name: 'Kai Cullote',
    description: 'Celana scuba high quality yang stretchy tapi tetap sopan. Tipe celana yang bikin kaki kelihatan ramping tapi tetap nyaman.',
    price: 100000,
    weight: 400,
    stock: 5,
    colors: ['Black', 'White', 'Brown', 'Cream'],
    material: 'Scuba',
    image: 'https://tumbuhin.s3.ap-southeast-1.amazonaws.com/Kai+Cullote.jpg',
    category: 'Celana',
    createdAt: '2025-01-03',
    updatedAt: '2025-01-03'
  },
  {
    id: '6',
    code: 'CL-003',
    name: 'Shofi Pants',
    description: 'Look girly tapi tetap casual? Shofi Pants jawabannya! Model flowy dengan detail bahan sifon yang bikin langkah kamu makin anggun.',
    price: 90000,
    weight: 300,
    stock: 5,
    colors: ['Black', 'Navy', 'Grey'],
    material: 'Mosscrepe mix Sifon',
    image: 'https://tumbuhin.s3.ap-southeast-1.amazonaws.com/Shofi+Pants.jpg',
    category: 'Celana',
    createdAt: '2025-01-03',
    updatedAt: '2025-01-03'
  }
]

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    weight: '',
    stock: '',
    colors: '',
    material: '',
    image: '',
    category: 'Baju'
  })

  const handleInputChange = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const generateProductCode = (category: string) => {
    const prefix = category === 'Baju' ? 'BJ' : 'CL'
    const existingCodes = products
      .filter(p => p.code.startsWith(prefix))
      .map(p => parseInt(p.code.split('-')[1]))
    const nextNumber = Math.max(...existingCodes, 0) + 1
    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.weight || !formData.stock) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newProduct: Product = {
        id: Date.now().toString(),
        code: generateProductCode(formData.category),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        weight: parseFloat(formData.weight),
        stock: parseInt(formData.stock),
        colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
        material: formData.material,
        image: formData.image || 'https://via.placeholder.com/300x300?text=No+Image',
        category: formData.category,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }

      setProducts(prev => [...prev, newProduct])
      setIsModalOpen(false)
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        weight: '',
        stock: '',
        colors: '',
        material: '',
        image: '',
        category: 'Baju'
      })
      
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">BACK TO DASHBOARD</span>
              </Link>
            </div>
            
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Package className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Package className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                  <p className="text-xs text-gray-500">Baju & Celana</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name, code, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Image</th>
                    <th className="text-left py-3 px-4">Code</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Price</th>
                    <th className="text-left py-3 px-4">Stock</th>
                    <th className="text-left py-3 px-4">Weight</th>
                    <th className="text-left py-3 px-4">Colors</th>
                    <th className="text-left py-3 px-4">Material</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No+Image'
                          }}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{product.code}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={product.category === 'Baju' ? 'default' : 'secondary'}>
                          {product.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">Rp {product.price.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
                          {product.stock} pcs
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{product.weight}g</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {product.colors.slice(0, 2).map((color, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {color}
                            </Badge>
                          ))}
                          {product.colors.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.colors.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{product.material}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Create Product</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="Enter the product name"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter Description"
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                        <Input
                          id="price"
                          type="number"
                          placeholder="0"
                          value={formData.price}
                          onChange={handleInputChange('price')}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="weight">Weight (grams) <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Input
                          id="weight"
                          type="number"
                          placeholder="0"
                          value={formData.weight}
                          onChange={handleInputChange('weight')}
                          required
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">grams</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="0"
                        value={formData.stock}
                        onChange={handleInputChange('stock')}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="colors">Colors</Label>
                    <Input
                      id="colors"
                      placeholder="Enter colors separated by commas (e.g., Red, Blue, Green)"
                      value={formData.colors}
                      onChange={handleInputChange('colors')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      placeholder="Enter material (e.g., Cotton, Polyester, Linen)"
                      value={formData.material}
                      onChange={handleInputChange('material')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={handleInputChange('category')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Baju">Baju</option>
                      <option value="Celana">Celana</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      type="url"
                      placeholder="Enter image URL"
                      value={formData.image}
                      onChange={handleInputChange('image')}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default ProductPage