import { useState } from "react";
import { LeadCard } from "./lead-card";
import { Badge } from "./ui/badge";
import { useDrop } from "react-dnd";
import type { Lead, PipelineStage } from "@/types";


const ITEM_TYPE = 'LEAD'

// Pipeline Stage Component with Drop functionality
export const PipelineStageColumn: React.FC<{ 
  stage: PipelineStage; 
  onDropLead: (leadId: string, targetStageId: string) => void;
  onUpdateLead: (leadId: string, newName: string) => void;
  onUpdateStage: (stageId: string, newName: string) => void;
  onLeadClick: (lead: Lead) => void;
}> = ({ stage, onDropLead, onUpdateLead, onUpdateStage, onLeadClick }) => {
  const [isEditingStage, setIsEditingStage] = useState(false)
  const [editStageName, setEditStageName] = useState(stage.name)

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string; sourceStage: string }) => {
      if (item.sourceStage !== stage.id) {
        onDropLead(item.id, stage.id)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const handleStageNameClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditingStage(true)
  }

  const handleStageNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editStageName.trim() && editStageName !== stage.name) {
      onUpdateStage(stage.id, editStageName.trim())
    }
    setIsEditingStage(false)
  }

  const handleStageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStageNameSubmit(e as any)
    } else if (e.key === 'Escape') {
      setEditStageName(stage.name)
      setIsEditingStage(false)
    }
  }

  const handleStageBlur = () => {
    if (editStageName.trim() && editStageName !== stage.name) {
      onUpdateStage(stage.id, editStageName.trim())
    } else {
      setEditStageName(stage.name)
    }
    setIsEditingStage(false)
  }

  return (
    <div
      ref={drop as any}
      className={`flex-1 min-w-0 transition-all duration-200 ${
        isOver && canDrop ? 'bg-blue-50 border-blue-200' : ''
      }`}
    >
      <div className="bg-white border border-gray-200 rounded-lg p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-${stage.color}-500`} />
            {isEditingStage ? (
              <form onSubmit={handleStageNameSubmit} className="flex-1">
                <input
                  type="text"
                  value={editStageName}
                  onChange={(e) => setEditStageName(e.target.value)}
                  onBlur={handleStageBlur}
                  onKeyDown={handleStageKeyDown}
                  className="px-2 py-1 text-sm font-medium text-gray-900 bg-white border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </form>
            ) : (
              <h3 
                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={handleStageNameClick}
                title="Click to edit stage name"
              >
                {stage.name}
              </h3>
            )}
            <Badge variant="secondary" className="text-xs">
              {stage.count}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              Rp {stage.value.toLocaleString()}
            </div>
          </div>
        </div>

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
  )
}