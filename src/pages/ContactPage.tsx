"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Send,
  Phone,
  Loader2,
  Trash,
} from "lucide-react";
import MainLayout from "@/main-layout";
import StartChatModal from "@/components/start-chat-modal";
import FilterContactModal from "@/components/filter-contact-modal";
import type { ContactFilterData } from "@/components/filter-contact-modal";

import { platformsInboxService } from "@/services/platfrormsInboxService";
import { contactService } from "@/services/contactService";
import { useToast } from "@/contexts/ToastContext";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Contact {
  id: string;
  id_platform: string;
  platform_name?: string;
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
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [platformsLoading, setPlatformsLoading] = useState(false);
  const [platformsError, setPlatformsError] = useState<string | null>(null);
  const [addContactForm, setAddContactForm] = useState({
    id_platform: "",
    phone: "",
    name: "",
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    targetId?: string;
  }>({ open: false });
  const { success, error: showError } = useToast();

  // Filter state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterData, setFilterData] = useState<ContactFilterData>({
    dateFrom: "",
    dateTo: "",
    platform: "#",
    platformType: "#",
  });

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

  const handleOpenWhatsAppModal = (contact: Contact) => {
    setSelectedContact(contact);
    setIsWhatsAppModalOpen(true);
  };

  const handleWhatsAppSuccess = (message: string) => {
    success("Pesan Terkirim", message);
  };

  const handleWhatsAppError = (error: string) => {
    showError("Gagal Mengirim Pesan", error);
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        !addContactForm.id_platform ||
        !addContactForm.phone ||
        !addContactForm.name
      ) {
        showError("Form Tidak Lengkap", "Platform, nomor telepon, dan nama wajib diisi");
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
      success("Kontak Ditambahkan", "Kontak berhasil ditambahkan.");
    } catch (err: any) {
      showError("Gagal Menambah Kontak", err.response?.data?.message || err.message || "Gagal menambah kontak");
    }
  };

  // Handler untuk hapus kontak
  const handleDeleteContact = (id: string) => {
    setDeleteDialog({ open: true, targetId: id });
  };

  const confirmDeleteContact = async () => {
    if (!deleteDialog.targetId) return;
    try {
      await contactService.deleteContact(deleteDialog.targetId);
      success("Kontak Dihapus", "Kontak berhasil dihapus.");
      fetchContacts(currentPage, itemsPerPage);
    } catch (err: any) {
      showError("Gagal Menghapus", err.response?.data?.message || err.message || "Gagal menghapus kontak");
    } finally {
      setDeleteDialog({ open: false });
    }
  };

  // Filter contacts based on search query and filter data
  const filteredContacts = contacts.filter((contact) => {
    // Search query filter
    const matchesSearch = 
      contact.push_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.contact_identifier.includes(searchQuery);
    
    if (!matchesSearch) return false;

    // Date range filter
    if (filterData.dateFrom) {
      const contactDate = new Date(contact.created_at);
      const fromDate = new Date(filterData.dateFrom);
      if (contactDate < fromDate) return false;
    }
    
    if (filterData.dateTo) {
      const contactDate = new Date(contact.created_at);
      const toDate = new Date(filterData.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      if (contactDate > toDate) return false;
    }

    // Platform filter
    if (filterData.platform && filterData.platform !== "#") {
      const contactPlatform = contact.platform_name || contact.id_platform;
      if (contactPlatform !== filterData.platform) return false;
    }

    // Platform type filter
    if (filterData.platformType && filterData.platformType !== "#") {
      const contactSourceType = (contact.source_type || "").toLowerCase();
      const selectedType = filterData.platformType.toLowerCase();
      
      if (selectedType === "whatsapp" && contactSourceType !== "whatsapp") return false;
      if (selectedType === "instagram" && contactSourceType !== "instagram") return false;
      if (selectedType === "webchat" && contactSourceType !== "webchat") return false;
    }

    return true;
  });

  // Check if any filters are active and count them
  const activeFiltersCount = [
    filterData.dateFrom,
    filterData.dateTo,
    filterData.platform !== "#" && filterData.platform !== "" ? filterData.platform : null,
    filterData.platformType !== "#" && filterData.platformType !== "" ? filterData.platformType : null,
  ].filter(Boolean).length;
  
  const hasActiveFilters = activeFiltersCount > 0;

  // Filter handlers
  const handleFilterApply = () => {
    setIsFilterModalOpen(false);
  };

  const handleFilterReset = () => {
    setFilterData({
      dateFrom: "",
      dateTo: "",
      platform: "#",
      platformType: "#",
    });
  };

  // Export contacts to Excel
  const handleExportContacts = () => {
    if (!selectedContacts || selectedContacts.length === 0) {
      showError("Tidak Ada Data", "Silakan pilih kontak yang ingin diekspor terlebih dahulu");
      return;
    }

    try {
      // Filter contacts berdasarkan yang dipilih
      const selectedContactsData = filteredContacts.filter(contact => 
        selectedContacts.includes(contact.id)
      );

      const exportData = selectedContactsData.map(contact => ({
        ID: contact.id,
        Name: contact.push_name || "-",
        Phone: contact.contact_identifier || "-",
        Platform: contact.platform_name || contact.id_platform || "-",
        Last_Message: contact.last_message || "-",
        Unread_Messages: contact.unread_messages,
        Created_At: new Date(contact.created_at).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        Updated_At: new Date(contact.updated_at).toLocaleDateString("id-ID", {
          year: "numeric", 
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");
      
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const file = new Blob([excelBuffer], { type: "application/octet-stream" });
      
      const fileName = `selected_contacts_${new Date().toISOString().slice(0,10)}.xlsx`;
      saveAs(file, fileName);

      success("Export Berhasil", `Data ${exportData.length} kontak terpilih berhasil diekspor ke ${fileName}`);
    } catch (error) {
      console.error("Export error:", error);
      showError("Export Gagal", "Terjadi kesalahan saat mengekspor data");
    }
  };

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
                variant={hasActiveFilters ? "default" : "outline"}
                size="sm"
                className={`flex-1 sm:flex-none ${hasActiveFilters ? "bg-primary text-white" : ""}`}
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-1 bg-white text-primary rounded-full px-1.5 py-0.5 text-xs font-medium">
                    {activeFiltersCount}
                  </span>
                )}
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
                        className="flex-1 bg-primary text-white"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Tambah Kontak
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
                onClick={handleExportContacts}
                disabled={selectedContacts.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export {selectedContacts.length > 0 ? `(${selectedContacts.length})` : ''}
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
                          className={`text-xs ${
                            contact.source_type?.toLowerCase() === 'whatsapp'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : contact.source_type?.toLowerCase() === 'webchat'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : contact.source_type?.toLowerCase() === 'instagram'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                        >
                          {contact.source_type || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {contact.last_message 
                          ? (contact.last_message.length > 30 
                              ? `${contact.last_message.substring(0, 30)}...` 
                              : contact.last_message)
                          : "-"}
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
                            <Badge
                              variant="outline"
                              className={`text-xs max-w-full break-all ${
                                contact.source_type?.toLowerCase() === 'whatsapp'
                                  ? 'bg-green-100 text-green-800 border-green-300'
                                  : contact.source_type?.toLowerCase() === 'webchat'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : contact.source_type?.toLowerCase() === 'instagram'
                                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                                  : 'bg-gray-100 text-gray-800 border-gray-300'
                              }`}
                            >
                              <span className="break-all word-break-all">
                                {contact.source_type || 'Unknown'}
                              </span>
                            </Badge>
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

      {/* WhatsApp Modal - Using StartChatModal Component */}
      <StartChatModal
        isOpen={isWhatsAppModalOpen}
        onOpenChange={setIsWhatsAppModalOpen}
        initialPhone={selectedContact?.contact_identifier || ""}
        initialPlatformId={selectedContact?.id_platform || ""}
        onSuccess={handleWhatsAppSuccess}
        onError={handleWhatsAppError}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Hapus Kontak?</h2>
            <p>Apakah Anda yakin ingin menghapus kontak ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="destructive" onClick={confirmDeleteContact}>
                Hapus
              </Button>
              <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Modal */}
      <FilterContactModal
        isOpen={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
        filterData={filterData}
        onFilterChange={setFilterData}
        contacts={contacts}
        platforms={platforms}
        onApply={handleFilterApply}
        onReset={handleFilterReset}
      />
    </MainLayout>
  );
}
