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
}> = ({ lead, index, stageId, onUpdateLead, onLeadClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(lead.name);

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: lead.id, index, sourceStage: stageId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim() && editName !== lead.name) {
      onUpdateLead(lead.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit(e as any);
    } else if (e.key === "Escape") {
      setEditName(lead.name);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (editName.trim() && editName !== lead.name) {
      onUpdateLead(lead.id, editName.trim());
    } else {
      setEditName(lead.name);
    }
    setIsEditing(false);
  };

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
          {isEditing ? (
            <form onSubmit={handleNameSubmit} className="mb-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-sm font-medium text-gray-900 bg-white border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </form>
          ) : (
            <h4
              className="font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleNameClick}
              title="Click to edit name"
            >
              {lead.name}
            </h4>
          )}
          <div className="text-xs text-gray-500 mt-1">
            <span className="font-semibold">Moved by:</span> {lead.source}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <span className="font-semibold">Status:</span> {lead.status}
          </div>
        </div>
      </div>
    </div>
  );
};
