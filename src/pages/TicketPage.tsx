"use client";
import React, { useEffect, useState } from "react";
import MainLayout from "@/main-layout";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Info,
  Calendar,
  Tag,
} from "lucide-react";
import { Link } from "react-router";
import { TicketService } from "@/services/ticketService";
import { Button } from "@/components/ui/button";

interface Ticket {
  id: string;
  problem: string;
  problem_description: string;
  priority: string;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface TicketStatus {
  id: string;
  name: string;
  count: number;
  tickets: Ticket[];
  color: string;
  icon: React.ReactNode;
}

// Ticket Card Component
const TicketCard: React.FC<{ ticket: Ticket; onCardClick: (ticket: Ticket) => void }> = ({ ticket, onCardClick }) => {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={() => onCardClick(ticket)}
    >
      <div className="mb-2">
        <h4 className="font-medium text-gray-900 mb-1">{ticket.problem}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">
          {ticket.problem_description}
        </p>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Dibuat: {new Date(ticket.created_at).toLocaleString()}</span>
      </div>
    </div>
  );
};

// Ticket Detail Drawer Component
const TicketDetailDrawer: React.FC<{ 
  ticket: Ticket | null; 
  isOpen: boolean; 
  onClose: () => void;
  isLoading: boolean;
}> = ({ ticket, isOpen, onClose, isLoading }) => {
  if (!ticket && !isLoading) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold text-gray-900">
              Detail Ticket
            </DrawerTitle>
            <DrawerDescription>
              Informasi lengkap tentang ticket ini
            </DrawerDescription>
          </DrawerHeader>

          {isLoading ? (
            <div className="p-6">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Memuat detail ticket...</span>
              </div>
            </div>
          ) : ticket ? (
            <div className="p-6 space-y-6">
              {/* Problem Title */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {ticket.problem}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {ticket.problem_description}
                </p>
              </div>

              {/* Status and Priority */}
              <div className="flex flex-wrap gap-3">
                <Badge className={`${getStatusColor(ticket.status)} border`}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={`${getPriorityColor(ticket.priority)} border`}>
                  {ticket.priority.toUpperCase()}
                </Badge>
              </div>

              {/* Tags */}
              {ticket.tags && ticket.tags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Dibuat: {new Date(ticket.created_at).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Diperbarui: {new Date(ticket.updated_at).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Status Message */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-emerald-500 mb-1">
                      Status Penanganan
                    </h4>
                    <p className="text-sm text-emerald-400 leading-relaxed">
                      Masalah Anda sedang kami cek dan perbaiki secepatnya. Tim kami akan segera menghubungi Anda untuk update lebih lanjut.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DrawerFooter>
            <DrawerClose asChild>
              <Button className="w-full text-white py-2 px-4">
                Tutup
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

// Ticket Status Column Component
const TicketStatusColumn: React.FC<{ status: TicketStatus; onCardClick: (ticket: Ticket) => void }> = ({ status, onCardClick }) => {
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
            <TicketCard key={ticket.id} ticket={ticket} onCardClick={onCardClick} />
          ))}

          {status.tickets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Tidak ada ticket</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TicketPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    TicketService.getTickets()
      .then((res) => {
        const data = Array.isArray(res.data.items) ? res.data.items : [];
        setTickets(data);
      })
      .catch((err) => {
        console.error("Gagal mengambil data ticket:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCardClick = async (ticket: Ticket) => {
    setIsDrawerLoading(true);
    setIsDrawerOpen(true);
    
    try {
      const response = await TicketService.getTicketById(ticket.id);
      setSelectedTicket(response.data);
    } catch (error) {
      console.error("Gagal mengambil detail ticket:", error);
      // Fallback ke data dari list jika API gagal
      setSelectedTicket(ticket);
    } finally {
      setIsDrawerLoading(false);
    }
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedTicket(null);
    setIsDrawerLoading(false);
  };

  // Filter tickets berdasarkan search (problem & desc saja)
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.problem?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.problem_description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Kelompokkan ticket berdasarkan status
  const statusList = [
    {
      id: "open",
      name: "Open",
      color: "blue",
      icon: <MessageSquare className="h-4 w-4 text-blue-600" />,
    },
    {
      id: "in_progress",
      name: "In Progress",
      color: "yellow",
      icon: <Clock className="h-4 w-4 text-yellow-600" />,
    },
    {
      id: "resolved",
      name: "Resolved",
      color: "green",
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    },
    {
      id: "closed",
      name: "Closed",
      color: "gray",
      icon: <XCircle className="h-4 w-4 text-gray-600" />,
    },
  ];

  const ticketStatuses: TicketStatus[] = statusList.map((status) => {
    const statusTickets = filteredTickets.filter((t) => t.status === status.id);
    return {
      id: status.id,
      name: status.name,
      count: statusTickets.length,
      tickets: statusTickets,
      color: status.color,
      icon: status.icon,
    };
  });

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.back();
                }}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Ticket Management
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari tiket"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </div>
          </div>
        </div>

        {/* Ticket Status Columns */}
        <div className="space-y-6">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {ticketStatuses.map((status) => (
              <TicketStatusColumn key={status.id} status={status} onCardClick={handleCardClick} />
            ))}
          </div>
        </div>

        {/* Ticket Detail Drawer */}
        <TicketDetailDrawer 
          ticket={selectedTicket} 
          isOpen={isDrawerOpen} 
          onClose={handleDrawerClose} 
          isLoading={isDrawerLoading}
        />
      </div>
    </MainLayout>
  );
};

export default TicketPage;
