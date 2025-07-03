"use client"

import React, { useState } from 'react'
import MainLayout from '@/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  MessageSquare, 
  Calendar,
  MoreHorizontal,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react'
import { Link } from 'react-router'

interface Ticket {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  customer: string
  assignedTo: string
  createdAt: string
  updatedAt: string
  category: string
  daysAgo: number
}

interface TicketStatus {
  id: string
  name: string
  count: number
  tickets: Ticket[]
  color: string
  icon: React.ReactNode
}

// Mock data untuk tickets
const initialTickets: Ticket[] = [
  {
    id: '1',
    title: 'Masalah Login WhatsApp',
    description: 'Customer tidak bisa login ke sistem WhatsApp Business',
    priority: 'high',
    status: 'open',
    customer: 'Toko Baju Indah',
    assignedTo: 'CS Team',
    createdAt: '2025-01-03',
    updatedAt: '2025-01-03',
    category: 'Technical',
    daysAgo: 1
  },
  {
    id: '2',
    title: 'Pertanyaan Produk Baru',
    description: 'Customer ingin mengetahui detail produk Florenza Top',
    priority: 'medium',
    status: 'in-progress',
    customer: 'Sari Boutique',
    assignedTo: 'Sales Team',
    createdAt: '2025-01-02',
    updatedAt: '2025-01-03',
    category: 'Sales',
    daysAgo: 2
  },
  {
    id: '3',
    title: 'Komplain Pengiriman',
    description: 'Paket terlambat sampai, customer meminta penjelasan',
    priority: 'urgent',
    status: 'open',
    customer: 'Fashion Store',
    assignedTo: 'Support Team',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-02',
    category: 'Shipping',
    daysAgo: 3
  },
  {
    id: '4',
    title: 'Request Katalog Update',
    description: 'Customer meminta update katalog produk terbaru',
    priority: 'low',
    status: 'resolved',
    customer: 'Mega Fashion',
    assignedTo: 'Marketing Team',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-03',
    category: 'Marketing',
    daysAgo: 3
  },
  {
    id: '5',
    title: 'Pembayaran Bermasalah',
    description: 'Transfer sudah dilakukan tapi belum masuk ke sistem',
    priority: 'high',
    status: 'in-progress',
    customer: 'Butik Cantik',
    assignedTo: 'Finance Team',
    createdAt: '2025-12-31',
    updatedAt: '2025-01-03',
    category: 'Payment',
    daysAgo: 4
  },
  {
    id: '6',
    title: 'Feedback Produk',
    description: 'Customer memberikan review positif untuk Gardena Pants',
    priority: 'low',
    status: 'closed',
    customer: 'Style House',
    assignedTo: 'CS Team',
    createdAt: '2025-12-30',
    updatedAt: '2025-01-02',
    category: 'Feedback',
    daysAgo: 5
  }
]

// Ticket Card Component
const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-3 w-3" />
      case 'high': return <AlertTriangle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{ticket.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
          {getPriorityIcon(ticket.priority)}
          {ticket.priority.toUpperCase()}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{ticket.customer}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          <span>{ticket.assignedTo}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <Badge variant="outline" className="text-xs">
          {ticket.category}
        </Badge>
        <div className="flex items-center gap-1 text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>{ticket.daysAgo} hari yang lalu</span>
        </div>
      </div>
    </div>
  )
}

// Ticket Status Column Component
const TicketStatusColumn: React.FC<{ status: TicketStatus }> = ({ status }) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="bg-white border border-gray-200 rounded-lg p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-${status.color}-100`}>
              {status.icon}
            </div>
            <h3 className="font-medium text-gray-900">{status.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {status.count}
            </Badge>
          </div>
        </div>

        <div className="space-y-3 min-h-[200px]">
          {status.tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
          
          {status.tickets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Tidak ada ticket</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TicketPage = () => {
  const [tickets] = useState<Ticket[]>(initialTickets)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter tickets berdasarkan search
  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group tickets by status
  const ticketStatuses: TicketStatus[] = [
    {
      id: 'open',
      name: 'Open',
      count: filteredTickets.filter(t => t.status === 'open').length,
      tickets: filteredTickets.filter(t => t.status === 'open'),
      color: 'blue',
      icon: <MessageSquare className="h-4 w-4 text-blue-600" />
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      count: filteredTickets.filter(t => t.status === 'in-progress').length,
      tickets: filteredTickets.filter(t => t.status === 'in-progress'),
      color: 'yellow',
      icon: <Clock className="h-4 w-4 text-yellow-600" />
    },
    {
      id: 'resolved',
      name: 'Resolved',
      count: filteredTickets.filter(t => t.status === 'resolved').length,
      tickets: filteredTickets.filter(t => t.status === 'resolved'),
      color: 'green',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />
    },
    {
      id: 'closed',
      name: 'Closed',
      count: filteredTickets.filter(t => t.status === 'closed').length,
      tickets: filteredTickets.filter(t => t.status === 'closed'),
      color: 'gray',
      icon: <XCircle className="h-4 w-4 text-gray-600" />
    }
  ]

  const totalTickets = tickets.length
  const urgentTickets = tickets.filter(t => t.priority === 'urgent').length
  const openTickets = tickets.filter(t => t.status === 'open').length

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
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
                  <p className="text-xs text-gray-500">• All time tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Urgent Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{urgentTickets}</p>
                  <p className="text-xs text-red-600">• Needs immediate attention</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Open Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{openTickets}</p>
                  <p className="text-xs text-orange-600">• Awaiting response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets by title, customer, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Status Columns */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Ticket Status</h2>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4">
            {ticketStatuses.map((status) => (
              <TicketStatusColumn key={status.id} status={status} />
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">💡 Tips menggunakan Ticket Management</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Gunakan search untuk mencari ticket berdasarkan judul, customer, atau kategori</li>
            <li>• Monitor ticket urgent yang memerlukan perhatian segera</li>
            <li>• Pastikan ticket open mendapat response dalam 24 jam</li>
            <li>• Gunakan filter untuk melihat ticket berdasarkan prioritas atau kategori</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  )
}

export default TicketPage
