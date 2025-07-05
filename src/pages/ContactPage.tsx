"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Download,
  Settings,
  MessageSquare,
  Edit,
  ChevronLeft,
  ChevronRight,
  Send,
  Phone,
  Building,
  CheckCircle,
} from "lucide-react";
import MainLayout from "@/main-layout";

interface Contact {
  id: string;
  name: string;
  phone: string;
  note: string;
  labelNames: string[];
  inbox: string;
  pipelineStatus: string;
  chatStatus: "pending" | "open" | "assigned";
  chatCreatedAt: string;
  handledBy: string;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Om Asep",
    phone: "62 852 1318 4532",
    note: "whatsapp sync",
    labelNames: [],
    inbox: "Abang Benerin Schedule",
    pipelineStatus: "-",
    chatStatus: "pending",
    chatCreatedAt: "2025-06-16 10:35:30",
    handledBy: "Admin AB",
  },
  {
    id: "2",
    name: "Kactrih",
    phone: "62 857 8181 0903",
    note: "-",
    labelNames: [],
    inbox: "Abang Benerin",
    pipelineStatus: "-",
    chatStatus: "open",
    chatCreatedAt: "2025-06-16 10:32:04",
    handledBy: "-",
  },
  {
    id: "3",
    name: "WinD",
    phone: "62 818 0822 7452",
    note: "-",
    labelNames: [],
    inbox: "CS DISTCCTV ex. Aulia",
    pipelineStatus: "-",
    chatStatus: "open",
    chatCreatedAt: "2025-06-16 10:31:19",
    handledBy: "-",
  },
  {
    id: "4",
    name: "Megin Kusuma Gustum",
    phone: "-",
    note: "-",
    labelNames: [],
    inbox: "HRD PAT",
    pipelineStatus: "-",
    chatStatus: "open",
    chatCreatedAt: "2025-06-16 10:27:11",
    handledBy: "-",
  },
  {
    id: "5",
    name: "-",
    phone: "49 176 7218 8188",
    note: "-",
    labelNames: [],
    inbox: "Abang Benerin",
    pipelineStatus: "-",
    chatStatus: "assigned",
    chatCreatedAt: "2025-06-16 10:24:07",
    handledBy: "Admin AB",
  },
  {
    id: "6",
    name: "sri_lestr",
    phone: "-",
    note: "-",
    labelNames: [],
    inbox: "abangbenerin",
    pipelineStatus: "-",
    chatStatus: "open",
    chatCreatedAt: "2025-06-16 10:18:56",
    handledBy: "-",
  },
  {
    id: "7",
    name: "Ummi Sadiyah",
    phone: "62 821 1107 9693",
    note: "-",
    labelNames: [],
    inbox: "Abang Benerin",
    pipelineStatus: "-",
    chatStatus: "assigned",
    chatCreatedAt: "2025-06-16 09:53:44",
    handledBy: "Admin AB",
  },
  {
    id: "8",
    name: "-",
    phone: "62 813 8508 9688",
    note: "-",
    labelNames: [],
    inbox: "Abang Benerin Schedule",
    pipelineStatus: "-",
    chatStatus: "pending",
    chatCreatedAt: "2025-06-16 09:52:41",
    handledBy: "Admin AB",
  },
  {
    id: "9",
    name: "文森吉亚",
    phone: "62 821 1210 4927",
    note: "-",
    labelNames: [],
    inbox: "Abang Benerin",
    pipelineStatus: "-",
    chatStatus: "pending",
    chatCreatedAt: "2025-06-16 09:50:59",
    handledBy: "Admin AB",
  },
  {
    id: "10",
    name: "-",
    phone: "62 819 9132 5832",
    note: "-",
    labelNames: [],
    inbox: "Abang Benerin Schedule",
    pipelineStatus: "-",
    chatStatus: "pending",
    chatCreatedAt: "2025-06-16 09:47:28",
    handledBy: "Admin AB",
  },
];

export default function ContactsPage() {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [whatsAppForm, setWhatsAppForm] = useState({
    phone: "",
    deviceName: "",
    agentId: "",
    message: "Hello, this is an initial message.",
    title: "Customer inquiry",
    notes: "Customer asked about product X"
  });
  const [addContactForm, setAddContactForm] = useState({
    phone: "",
    name: "",
    businessName: "",
    businessAccount: false,
    verified: false
  });

  const handleOpenWhatsAppModal = (contact: Contact) => {
    setWhatsAppForm(prev => ({
      ...prev,
      phone: contact.phone || "",
    }));
    setIsWhatsAppModalOpen(true);
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("WhatsApp message data:", whatsAppForm);
    setIsWhatsAppModalOpen(false);
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle add contact form submission here
    console.log("Add contact data:", addContactForm);
    setIsAddContactOpen(false);
    // Reset form
    setAddContactForm({
      phone: "",
      name: "",
      businessName: "",
      businessAccount: false,
      verified: false
    });
  };

  const totalContacts = 9153;
  const totalPages = Math.ceil(totalContacts / itemsPerPage);

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(mockContacts.map((contact) => contact.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts((prev) => [...prev, contactId]);
    } else {
      setSelectedContacts((prev) => prev.filter((id) => id !== contactId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            pending
          </Badge>
        );
      case "open":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            open
          </Badge>
        );
      case "assigned":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            assigned
          </Badge>
        );
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Contacts</h1>
              <p className="text-muted-foreground">
                Total Contacts: {totalContacts.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan Nama atau Nomor Telepon"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Tambah Kontak
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-green-600">
                    <Phone className="h-5 w-5" />
                    Tambah Kontak WhatsApp
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-sm font-medium">
                      Nomor Telepon *
                    </Label>
                    <Input
                      id="contactPhone"
                      value={addContactForm.phone}
                      onChange={(e) => setAddContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Nomor Telepon *"
                      className="font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactName" className="text-sm font-medium">
                      Nama
                    </Label>
                    <Input
                      id="contactName"
                      value={addContactForm.name}
                      onChange={(e) => setAddContactForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nama"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-medium">
                      Business Name
                    </Label>
                    <Input
                      id="businessName"
                      value={addContactForm.businessName}
                      onChange={(e) => setAddContactForm(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Business Name"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="businessAccount"
                        checked={addContactForm.businessAccount}
                        onCheckedChange={(checked) => 
                          setAddContactForm(prev => ({ ...prev, businessAccount: checked as boolean }))
                        }
                      />
                      <Label htmlFor="businessAccount" className="text-sm flex items-center gap-1">
                        <Building className="h-4 w-4 text-blue-500" />
                        Business Account
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified"
                        checked={addContactForm.verified}
                        onCheckedChange={(checked) => 
                          setAddContactForm(prev => ({ ...prev, verified: checked as boolean }))
                        }
                      />
                      <Label htmlFor="verified" className="text-sm flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Verified
                      </Label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Add Contact
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              disabled={selectedContacts.length === 0}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Selected
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Customize Columns
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg bg-card capitalize">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedContacts.length === mockContacts.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-20">action</TableHead>
                <TableHead>name</TableHead>
                <TableHead>phone</TableHead>
                <TableHead>note</TableHead>
                <TableHead>label names</TableHead>
                <TableHead>inbox</TableHead>
                <TableHead>pipeline status</TableHead>
                <TableHead>chat status</TableHead>
                <TableHead>chat created at</TableHead>
                <TableHead>handled by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={(checked) =>
                        handleSelectContact(contact.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => handleOpenWhatsAppModal(contact)}
                      >
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Edit className="h-4 w-4 text-orange-600" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {contact.name || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.phone || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.note || "-"}
                  </TableCell>
                  <TableCell>
                    {contact.labelNames.length > 0
                      ? contact.labelNames.join(", ")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {contact.inbox}
                    </Badge>
                  </TableCell>
                  <TableCell>{contact.pipelineStatus}</TableCell>
                  <TableCell>{getStatusBadge(contact.chatStatus)}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {contact.chatCreatedAt}
                  </TableCell>
                  <TableCell>{contact.handledBy || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <span>Item per Halaman:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                  <SelectItem value="200">200 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-4">
              Total: {totalContacts.toLocaleString()}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  {page}
                </Button>
              ))}
              <span className="px-2 py-1 text-muted-foreground">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal - Using shadcn Dialog */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Send className="h-5 w-5" />
              Kirim Pesan WhatsApp
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Nomor Telepon
              </Label>
              <Input
                id="phone"
                value={whatsAppForm.phone}
                onChange={(e) => setWhatsAppForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+628526000993731"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceName" className="text-sm font-medium">
                Device Name
              </Label>
              <Select
                value={whatsAppForm.deviceName}
                onValueChange={(value) => setWhatsAppForm(prev => ({ ...prev, deviceName: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="tenant_69b86cc342e043d4a8abcd7633f440dd_dev..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant_69b86cc342e043d4a8abcd7633f440dd_dev">
                    tenant_69b86cc342e043d4a8abcd7633f440dd_dev...
                  </SelectItem>
                  <SelectItem value="device_2">Device 2</SelectItem>
                  <SelectItem value="device_3">Device 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agentId" className="text-sm font-medium">
                Agent ID
              </Label>
              <Input
                id="agentId"
                value={whatsAppForm.agentId}
                onChange={(e) => setWhatsAppForm(prev => ({ ...prev, agentId: e.target.value }))}
                placeholder="40b6f49a-60ad-41f0-889c-3aa73bd3af73"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Pesan yang akan Dikirim *
              </Label>
              <Textarea
                id="message"
                value={whatsAppForm.message}
                onChange={(e) => setWhatsAppForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Hello, this is an initial message."
                rows={4}
                required
              />
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Tujuan
              </Label>
              <Input
                id="title"
                value={whatsAppForm.title}
                onChange={(e) => setWhatsAppForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Customer inquiry"
              />
            </div> */}

            {/* <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Catatan Tambahan
              </Label>
              <Input
                id="notes"
                value={whatsAppForm.notes}
                onChange={(e) => setWhatsAppForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Customer asked about product X"
              />
            </div> */}

            <div className="pt-4">
              <Button type="submit" className="w-full bg-primary text-white">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
