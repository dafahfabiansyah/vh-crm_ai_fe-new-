"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter, MessageCircle, CalendarIcon, Smartphone } from "lucide-react";

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

interface Platform {
  id: string;
  platform_name: string;
}

interface ContactFilterData {
  dateFrom: string;
  dateTo: string;
  platform: string;
  platformType: string;
}

interface FilterContactModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filterData: ContactFilterData;
  onFilterChange: (filterData: ContactFilterData) => void;
  contacts: Contact[];
  platforms: Platform[];
  onApply: () => void;
  onReset: () => void;
}

export default function FilterContactModal({
  isOpen,
  onOpenChange,
  filterData,
  onFilterChange,
  contacts,
  platforms,
  onApply,
  onReset,
}: FilterContactModalProps) {
  // Date picker states
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  // Helper function to format date without timezone issues
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get unique platform names for platform filter
  const getUniquePlatforms = () => {
    const platformsFromContacts = contacts
      .map((contact) => contact.platform_name || contact.id_platform)
      .filter(Boolean)
      .filter(
        (value, index, self) => self.indexOf(value) === index
      ) as string[];

    const platformsFromProps = platforms
      .map((platform) => platform.platform_name)
      .filter(Boolean) as string[];

    const allPlatforms = [...platformsFromContacts, ...platformsFromProps];
    return [...new Set(allPlatforms)];
  };

  const updateFilterData = (updates: Partial<ContactFilterData>) => {
    onFilterChange({ ...filterData, ...updates });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-primary text-lg">
            <Filter className="h-5 w-5" />
            Filter Kontak
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range - Full width */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Rentang Tanggal
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Dari</Label>
                <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterData.dateFrom
                        ? new Date(filterData.dateFrom).toLocaleDateString(
                            "id-ID"
                          )
                        : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        filterData.dateFrom
                          ? new Date(filterData.dateFrom)
                          : undefined
                      }
                      onSelect={(date) => {
                        updateFilterData({
                          dateFrom: date ? formatDateForInput(date) : "",
                        });
                        setDateFromOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sampai</Label>
                <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterData.dateTo
                        ? new Date(filterData.dateTo).toLocaleDateString(
                            "id-ID"
                          )
                        : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        filterData.dateTo
                          ? new Date(filterData.dateTo)
                          : undefined
                      }
                      onSelect={(date) => {
                        updateFilterData({
                          dateTo: date ? formatDateForInput(date) : "",
                        });
                        setDateToOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* 2x1 Grid for other filters */}
          <div className="space-y-3">
            {/* Row 1: Platform, Platform Type (2 columns) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Platform */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Platform Inbox
                </Label>
                <Select
                  value={filterData.platform}
                  onValueChange={(value) =>
                    updateFilterData({ platform: value })
                  }
                >
                  <SelectTrigger className="text-sm w-full">
                    <SelectValue placeholder="Semua Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#">Semua Platform</SelectItem>
                    {getUniquePlatforms().map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Platform Type
                </Label>
                <Select
                  key={`platform-type-${filterData.platformType}`}
                  value={filterData.platformType}
                  onValueChange={(value) =>
                    updateFilterData({ platformType: value })
                  }
                >
                  <SelectTrigger className="text-sm w-full">
                    <SelectValue placeholder="Semua Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#">Semua Platform</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="WebChat">WebChat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="flex-1 sm:flex-none"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={onApply}
            className="flex-1 bg-primary text-white"
          >
            Terapkan Filter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { ContactFilterData };
