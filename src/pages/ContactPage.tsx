"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Loader2,
  Trash,
} from "lucide-react";
import MainLayout from "@/main-layout";

import { platformsInboxService } from "@/services/platfrormsInboxService";
import { contactService } from "@/services/contactService";
import whatsappService from "@/services/whatsappService";

interface Contact {
  id: string;
  id_platform: string;
  contact_identifier: string;
  push_name: string;
  source_type: string;
  last_message: string;
  last_message_at: string;
  unread_messages: number;
  created_at: string;
  updated_at: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [whatsAppForm, setWhatsAppForm] = useState({
    phone: "",
    deviceName: "",
    agentId: "",
    message: "Hello, this is an initial message.",
    title: "Customer inquiry",
    notes: "Customer asked about product X",
    id_platform: "", // tambahkan field ini
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(false);
  const [platformsError, setPlatformsError] = useState<string | null>(null);
  const [addContactForm, setAddContactForm] = useState({
    id_platform: "",
    phone: "",
    name: "",
  });
  const [, setWhatsAppPlatforms] = useState<any[]>([]);
  const [, setWhatsAppPlatformsLoading] =
    useState(false);
  const [, setWhatsAppPlatformsError] = useState<
    string | null
  >(null);

  // API call to fetch contacts
  const fetchContacts = async (page: number = 1, perPage: number = 100) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching contacts with params:", {
        page,
        per_page: perPage,
      });

      const data = await contactService.fetchContacts(page, perPage);
      setContacts(data.items || []);
      setTotalContacts(data.total_count || 0);
      setTotalPages(data.page_count || 1);
      setCurrentPage(data.page || page);
      setItemsPerPage(data.per_page || perPage);
    } catch (err: any) {
      console.error("Error fetching contacts:", err);
      console.error("Error response:", err.response?.data);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch contacts"
      );
      setContacts([]);
      setTotalContacts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Load contacts on component mount and when page/itemsPerPage changes
  useEffect(() => {
    fetchContacts(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Fetch platforms when add contact dialog opens
  useEffect(() => {
    if (isAddContactOpen) {
      setPlatformsLoading(true);
      setPlatformsError(null);
      platformsInboxService
        .getPlatformInbox()
        .then((data) => {
          setPlatforms(Array.isArray(data) ? data : data.items || []);
        })
        .catch((err: any) => {
          setPlatformsError(err.message || "Gagal mengambil data platform");
          setPlatforms([]);
        })
        .finally(() => setPlatformsLoading(false));
    }
  }, [isAddContactOpen]);

  // Fetch platforms when WhatsApp modal opens
  useEffect(() => {
    if (isWhatsAppModalOpen) {
      setWhatsAppPlatformsLoading(true);
      setWhatsAppPlatformsError(null);
      platformsInboxService
        .getPlatformInbox()
        .then((data) => {
          setWhatsAppPlatforms(Array.isArray(data) ? data : data.items || []);
        })
        .catch((err: any) => {
          setWhatsAppPlatformsError(
            err.message || "Gagal mengambil data platform"
          );
          setWhatsAppPlatforms([]);
        })
        .finally(() => setWhatsAppPlatformsLoading(false));
    }
  }, [isWhatsAppModalOpen]);

  const handleOpenWhatsAppModal = (contact: Contact) => {
    setSelectedContact(contact);
    setWhatsAppForm((prev) => ({
      ...prev,
      phone: contact.contact_identifier || "",
      id_platform: contact.id_platform || "",
    }));
    setIsWhatsAppModalOpen(true);
  };

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !whatsAppForm.phone || !whatsAppForm.message) {
      alert("Contact, phone, dan pesan wajib diisi");
      return;
    }
    try {
      await whatsappService.sendMessage({
        session: selectedContact.id_platform,
        number: whatsAppForm.phone,
        message: whatsAppForm.message,
      });
      alert("Pesan berhasil dikirim!");
      setIsWhatsAppModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Gagal mengirim pesan WhatsApp");
    }
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // POST to /v1/contacts
    try {
      if (
        !addContactForm.id_platform ||
        !addContactForm.phone ||
        !addContactForm.name
      ) {
        alert("Platform, nomor telepon, dan nama wajib diisi");
        return;
      }
      const body = {
        id_platform: addContactForm.id_platform,
        contact_identifier: addContactForm.phone,
        push_name: addContactForm.name,
      };
      await contactService.createContact(body);
      setIsAddContactOpen(false);
      setAddContactForm({
        id_platform: "",
        phone: "",
        name: "",
      });
      fetchContacts(currentPage, itemsPerPage);
    } catch (err: any) {
      alert(
        err.response?.data?.message || err.message || "Gagal menambah kontak"
      );
    }
  };

  // Handler untuk hapus kontak
  const handleDeleteContact = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus kontak ini?")) return;
    try {
      await contactService.deleteContact(id);
      fetchContacts(currentPage, itemsPerPage);
    } catch (err: any) {
      alert(
        err.response?.data?.message || err.message || "Gagal menghapus kontak"
      );
    }
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.push_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.contact_identifier.includes(searchQuery)
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map((contact) => contact.id));
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

  return (
    <MainLayout>
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                Contacts
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Total Contacts: {totalContacts.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan Nama atau Nomor Telepon"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Dialog
                open={isAddContactOpen}
                onOpenChange={setIsAddContactOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Tambah Kontak
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-2 text-green-600 text-lg">
                      <Phone className="h-5 w-5" />
                      Tambah Kontak WhatsApp
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddContactSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform" className="text-sm font-medium">
                        Platform *
                      </Label>
                      <Select
                        value={addContactForm.id_platform}
                        onValueChange={(value) =>
                          setAddContactForm((prev) => ({
                            ...prev,
                            id_platform: value,
                          }))
                        }
                        required
                      >
                        <SelectTrigger className="text-sm w-full">
                          <SelectValue
                            placeholder={
                              platformsLoading
                                ? "Memuat..."
                                : "Pilih platform..."
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {platformsLoading && (
                            <div className="px-3 py-2 text-muted-foreground text-sm">
                              Memuat...
                            </div>
                          )}
                          {platformsError && (
                            <div className="px-3 py-2 text-red-500 text-sm">
                              {platformsError}
                            </div>
                          )}
                          {!platformsLoading &&
                            !platformsError &&
                            platforms.length === 0 && (
                              <div className="px-3 py-2 text-muted-foreground text-sm">
                                Tidak ada platform
                              </div>
                            )}
                          {!platformsLoading &&
                            !platformsError &&
                            platforms.length > 0 &&
                            platforms.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.platform_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="contactPhone"
                        className="text-sm font-medium"
                      >
                        Nomor Telepon *
                      </Label>
                      <Input
                        id="contactPhone"
                        value={addContactForm.phone}
                        onChange={(e) =>
                          setAddContactForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="628123456790"
                        className="font-mono text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="contactName"
                        className="text-sm font-medium"
                      >
                        Nama
                      </Label>
                      <Input
                        id="contactName"
                        value={addContactForm.name}
                        onChange={(e) =>
                          setAddContactForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Masukkan nama kontak"
                        className="text-sm"
                      />
                    </div>

                    {/* <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-sm font-medium">
                      Business Name
                    </Label>
                    <Input
                      id="businessName"
                      value={addContactForm.businessName}
                      onChange={(e) => setAddContactForm(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Masukkan nama bisnis"
                      className="text-sm"
                    />
                  </div> */}

                    {/* <div className="space-y-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="businessAccount"
                          checked={addContactForm.businessAccount}
                          onCheckedChange={(checked) => 
                            setAddContactForm(prev => ({ ...prev, businessAccount: checked as boolean }))
                          }
                        />
                        <Label htmlFor="businessAccount" className="text-sm flex items-center gap-2">
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
                        <Label htmlFor="verified" className="text-sm flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Verified Account
                        </Label>
                      </div>
                    </div>
                  </div> */}

                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddContactOpen(false)}
                        className="flex-1 sm:flex-none"
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Tambah Kontak
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* <Button
                variant="outline"
                size="sm"
                disabled={selectedContacts.length === 0}
                className="flex-1 sm:flex-none"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button> */}

              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              {/* <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none sm:hidden lg:flex"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Customize</span>
                <span className="sm:hidden">Settings</span>
              </Button> */}
            </div>
          </div>
        </div>

        {/* Table - Desktop / Card Layout - Mobile */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading contacts...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <p className="font-medium">Failed to load contacts</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              onClick={() => fetchContacts(currentPage, itemsPerPage)}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedContacts.length === filteredContacts.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-20">Action</TableHead>
                    <TableHead className="min-w-32">Name</TableHead>
                    <TableHead className="min-w-32">Phone</TableHead>
                    <TableHead className="min-w-32">Platform</TableHead>
                    <TableHead className="min-w-24">Last Message</TableHead>
                    <TableHead className="min-w-24">Unread</TableHead>
                    <TableHead className="min-w-40">Created</TableHead>
                    {/* <TableHead className="min-w-40">Updated</TableHead> */}
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
                            className="h-7 w-7"
                            onClick={() => handleOpenWhatsAppModal(contact)}
                          >
                            <MessageSquare className="h-3 w-3 text-blue-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <Trash className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {contact.push_name || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {contact.contact_identifier || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-primary text-secondary border-blue-200 text-xs"
                        >
                          Whatsapp
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {contact.last_message || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {contact.unread_messages > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {contact.unread_messages}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {new Date(contact.created_at).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </TableCell>
                      {/* <TableCell className="text-muted-foreground font-mono text-xs">
                        {new Date(contact.updated_at).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden">
              {/* Mobile Header */}
              <div className="p-3 sm:p-4 border-b bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      selectedContacts.length === filteredContacts.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">Select All</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedContacts.length} selected
                </span>
              </div>

              {/* Mobile Contact Cards */}
              <div className="divide-y divide-border">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="p-3 sm:p-4 space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={(checked) =>
                            handleSelectContact(contact.id, checked as boolean)
                          }
                          className="mt-1 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-medium text-sm truncate min-w-0 max-w-full">
                              {contact.push_name || "No Name"}
                            </h3>
                            {contact.unread_messages > 0 && (
                              <Badge
                                variant="destructive"
                                className="text-xs flex-shrink-0"
                              >
                                {contact.unread_messages}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground font-mono break-all">
                            {contact.contact_identifier || "No Phone"}
                          </p>
                          <div className="mt-2">
                            {/* <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs max-w-full break-all"
                          >
                            <span className="break-all word-break-all">
                              {contact.id_platform}
                            </span>
                          </Badge> */}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => handleOpenWhatsAppModal(contact)}
                        >
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="pl-5 sm:pl-7 space-y-1 sm:space-y-2">
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 sm:gap-2 text-xs text-muted-foreground">
                        {/* <div className="flex justify-between xs:block">
                        <span className="font-medium">Platform:</span> 
                        <span className="xs:ml-1">{contact.id_platform}</span>
                      </div> */}
                        <div className="flex justify-between xs:block">
                          <span className="font-medium">Unread:</span>
                          <span className="xs:ml-1">
                            {contact.unread_messages}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div className="flex justify-between xs:block">
                          <span className="font-medium">Created:</span>
                          <span className="xs:ml-1">
                            {new Date(contact.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      {contact.last_message && contact.last_message !== "" && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Last Message:</span>
                          <p className="mt-1 break-words text-ellipsis line-clamp-2">
                            {contact.last_message.length > 30
                              ? `${contact.last_message.substring(0, 30)}...`
                              : contact.last_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-2 sm:p-0">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
            <span className="text-center sm:text-left">
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm">Item per Halaman:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-20 sm:w-24 h-8 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Total: {totalContacts.toLocaleString()}
            </span>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = Math.max(1, currentPage - 1);
                  setCurrentPage(newPage);
                }}
                disabled={currentPage === 1}
                className="h-8 px-2 sm:px-3"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              {/* Page Numbers - Hidden on mobile */}
              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
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
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 py-1 text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile page indicator */}
              <div className="sm:hidden px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
                {currentPage} / {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(newPage);
                }}
                disabled={currentPage === totalPages}
                className="h-8 px-2 sm:px-3"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal - Using shadcn Dialog */}
      <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-primary text-lg">
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
                onChange={(e) =>
                  setWhatsAppForm((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="+628526000993731"
                className="font-mono text-sm"
              />
            </div>
            {/* Select deviceName di-nonaktifkan, karena session diambil dari contact */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Pesan yang akan Dikirim *
              </Label>
              <Textarea
                id="message"
                value={whatsAppForm.message}
                onChange={(e) =>
                  setWhatsAppForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                placeholder="Hello, this is an initial message."
                rows={3}
                className="text-sm resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                Maksimal 1000 karakter
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="flex-1 sm:flex-none"
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1 bg-primary text-white">
                <Send className="h-4 w-4 mr-2" />
                Kirim Pesan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
