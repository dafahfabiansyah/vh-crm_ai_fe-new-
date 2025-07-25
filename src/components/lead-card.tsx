import type { Lead } from "@/types";
import { useDrag } from "react-dnd";
import { useState } from "react";

const ITEM_TYPE = "LEAD";

export const LeadCard: React.FC<{
  lead: Lead;
  index: number;
  stageId: string;
  onUpdateLead: (leadId: string, newName: string) => void;
  onLeadClick: (lead: Lead) => void;
}> = ({ lead, index, stageId,  onLeadClick }) => {
  const [isEditing,] = useState(false);


  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: lead.id, index, sourceStage: stageId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });


  const handleCardClick = (e: React.MouseEvent) => {
    if (!isEditing) {
      e.stopPropagation();
      onLeadClick(lead);
    }
  };

  return (
    <div
      ref={drag as any}
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-md cursor-pointer ${
        isDragging ? "opacity-50 rotate-2" : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="text-xs text-gray-500 mt-1">
            <h4 className="font-medium text-gray-900 truncate cursor-pointer hover:text-primary transition-colors">
              {lead.name}
            </h4>
            <span className="font-semibold">Moved by:</span> {lead.moved_by}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <span className="font-semibold">Status:</span> {lead.status}
          </div>
        </div>  
      </div>
    </div>
  );
};
