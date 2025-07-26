"use client";
import React, { useEffect, useState } from "react";
import MainLayout from "@/main-layout";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { Link } from "react-router";
import { TicketService } from "@/services/ticketService";

interface Ticket {
  id: string;
  problem: string;
  problem_description: string;
  created_at: string;
  status: string;
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
const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-md">
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
  );
};

const TicketPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLoading] = useState(false);

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

            {/* <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </div> */}
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

          {/* Search Bar */}
          {/* <div className="mb-6">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari ticket berdasarkan judul, customer, atau kategori"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </div> */}
        </div>

        {/* Ticket Status Columns */}
        <div className="space-y-6">
          {/* <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Ticket Status
            </h2>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div> */}

          <div className="flex gap-6 overflow-x-auto pb-4">
            {ticketStatuses.map((status) => (
              <TicketStatusColumn key={status.id} status={status} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TicketPage;
