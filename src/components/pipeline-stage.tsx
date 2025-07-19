import { useState } from "react";
import { LeadCard } from "./lead-card";
import { Badge } from "./ui/badge";
import { useDrop } from "react-dnd";
import type { Lead, PipelineStage } from "@/types";
import { Trash, Pencil } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";

const ITEM_TYPE = "LEAD";

// Pipeline Stage Component with Drop functionality
export const PipelineStageColumn: React.FC<{
  stage: PipelineStage;
  onDropLead: (leadId: string, targetStageId: string) => void;
  onUpdateLead: (leadId: string, newName: string) => void;
  onUpdateStage: (
    stageId: string,
    newName: string,
    newDescription?: string,
    newStageOrder?: number
  ) => void;
  onDeleteStage: (stageId: string) => void;
  onLeadClick: (lead: Lead) => void;
}> = ({
  stage,
  onDropLead,
  onUpdateLead,
  onUpdateStage,
  onDeleteStage,
  onLeadClick,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  // State untuk edit dialog
  const [editStageName, setEditStageName] = useState(stage.name);
  const [editStageDescription, setEditStageDescription] = useState(stage.description || "");
  const [editStageOrder, setEditStageOrder] = useState<number>(stage.stage_order ?? 0);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string; sourceStage: string }) => {
      if (item.sourceStage !== stage.id) {
        onDropLead(item.id, stage.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop as any}
      className={`w-[260px] min-w-[260px] max-w-[260px] h-full flex flex-col ${
        isOver && canDrop ? "bg-blue-50 border-blue-200" : ""
      }`}
    >
      <div className="">
      <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 w-full">
          <div className="flex items-center gap-2 w-full min-w-0">
            <div className={`w-3 h-3 rounded-full bg-${stage.color}-500 flex-shrink-0`} />
            <h3
              className="font-medium text-gray-900 truncate max-w-[90px]"
              title={stage.name}
              style={{ minWidth: 0 }}
            >
              {stage.name}
            </h3>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {stage.count}
            </Badge>
            <Button
              type="button"
              title="Edit stage"
              onClick={() => {
                setEditStageName(stage.name);
                setEditStageDescription(stage.description || "");
                setEditStageOrder(stage.stage_order ?? 0);
                setShowEditDialog(true);
              }}
              size="icon"
              className="ml-1 bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 p-0 flex-shrink-0"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
          <Button
            type="button"
            title="Hapus stage"
            onClick={() => setShowDeleteDialog(true)}
            size="icon"
            className="ml-2 bg-green-500 hover:bg-green-600 text-white w-8 h-8 p-0 flex-shrink-0"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Stage</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                onUpdateStage(
                  stage.id,
                  editStageName.trim(),
                  editStageDescription.trim(),
                  editStageOrder
                );
                setShowEditDialog(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Nama Stage</label>
                <input
                  type="text"
                  value={editStageName}
                  onChange={e => setEditStageName(e.target.value)}
                  className="w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={editStageDescription}
                  onChange={e => setEditStageDescription(e.target.value)}
                  className="w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">Batal</Button>
                </DialogClose>
                <Button type="submit" variant="default">Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Stage</DialogTitle>
            </DialogHeader>
            <p>Apakah Anda yakin ingin menghapus stage ini?</p>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Batalkan
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                type="button"
                onClick={() => {
                  onDeleteStage(stage.id);
                  setShowDeleteDialog(false);
                }}
              >
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {!isOver && canDrop && (
          <div className="text-xs text-gray-500 mb-2 ml-1 truncate max-w-full">
            {stage.description}
          </div>
        )}
        <div className="space-y-3 min-h-[200px]">
          {stage.leads.map((lead, index) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              index={index}
              stageId={stage.id}
              onUpdateLead={onUpdateLead}
              onLeadClick={onLeadClick}
            />
          ))}
          {isOver && canDrop && (
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center text-blue-600 bg-blue-50">
              Drop lead here
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
