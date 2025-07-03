"use client"

import React, { useState, useCallback } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import MainLayout from '@/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Plus, 
  TrendingUp, 
  Users, 
  Phone, 
  Calendar,
  MoreHorizontal,
  Download
} from 'lucide-react'
import { Link } from 'react-router'

interface Lead {
  id: string
  name: string
  phone: string
  value: number
  source: string
  daysAgo: number
  status: 'active' | 'new' | 'contacted'
}

interface PipelineStage {
  id: string
  name: string
  count: number
  value: number
  leads: Lead[]
  color: string
}

const ITEM_TYPE = 'LEAD'

// Mock data
const initialPipelineData: PipelineStage[] = [
  {
    id: 'new-lead',
    name: 'New Lead',
    count: 19,
    value: 0,
    color: 'blue',
    leads: [
      {
        id: '1',
        name: '628569009430',
        phone: '+628569009430',
        value: 0,
        source: 'Jastip CS',
        daysAgo: 7,
        status: 'new'
      },
      {
        id: '2',
        name: '628511974697',
        phone: '+628511974697',
        value: 0,
        source: 'Jastip CS',
        daysAgo: 7,
        status: 'new'
      },
      {
        id: '3',
        name: 'RD',
        phone: '+628111388611',
        value: 0,
        source: 'Jastip CS',
        daysAgo: 7,
        status: 'new'
      },
      {
        id: '4',
        name: '628551000185',
        phone: '+628551000185',
        value: 0,
        source: 'Jastip CS',
        daysAgo: 7,
        status: 'new'
      }
    ]
  },
  {
    id: 'contacted',
    name: 'Contacted',
    count: 0,
    value: 0,
    color: 'yellow',
    leads: []
  },
  {
    id: 'qualified',
    name: 'Qualified',
    count: 0,
    value: 0,
    color: 'green',
    leads: []
  },
  {
    id: 'proposal',
    name: 'Proposal',
    count: 0,
    value: 0,
    color: 'purple',
    leads: []
  },
  {
    id: 'won',
    name: 'Won',
    count: 0,
    value: 0,
    color: 'green',
    leads: []
  },
  {
    id: 'lost',
    name: 'Lost',
    count: 0,
    value: 0,
    color: 'red',
    leads: []
  }
]

// Lead Card Component with Drag functionality
const LeadCard: React.FC<{ 
  lead: Lead; 
  index: number; 
  stageId: string; 
  onUpdateLead: (leadId: string, newName: string) => void 
}> = ({ lead, index, stageId, onUpdateLead }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(lead.name)

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: lead.id, index, sourceStage: stageId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editName.trim() && editName !== lead.name) {
      onUpdateLead(lead.id, editName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit(e as any)
    } else if (e.key === 'Escape') {
      setEditName(lead.name)
      setIsEditing(false)
    }
  }

  const handleBlur = () => {
    if (editName.trim() && editName !== lead.name) {
      onUpdateLead(lead.id, editName.trim())
    } else {
      setEditName(lead.name)
    }
    setIsEditing(false)
  }

  return (
    <div
      ref={drag as any}
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-2' : ''
      } ${isEditing ? 'cursor-default' : 'cursor-move'}`}
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
          <div className="flex items-center gap-2 mt-1">
            <Phone className="h-3 w-3 text-green-600" />
            <span className="text-sm text-gray-600">{lead.phone}</span>
          </div>
        </div>
        <Badge variant={lead.value > 0 ? 'default' : 'secondary'} className="text-xs">
          Rp {lead.value.toLocaleString()}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{lead.source}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{lead.daysAgo} hari yang lalu</span>
        </div>
      </div>
    </div>
  )
}

// Pipeline Stage Component with Drop functionality
const PipelineStageColumn: React.FC<{ 
  stage: PipelineStage; 
  onDropLead: (leadId: string, targetStageId: string) => void;
  onUpdateLead: (leadId: string, newName: string) => void;
  onUpdateStage: (stageId: string, newName: string) => void;
}> = ({ stage, onDropLead, onUpdateLead, onUpdateStage }) => {
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

const PipelinePage = () => {
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>(initialPipelineData)

  const handleDropLead = useCallback((leadId: string, targetStageId: string) => {
    setPipelineData(prev => {
      const newData = [...prev]
      
      // Find source stage and lead
      let leadToMove: Lead | undefined
      
      for (const stage of newData) {
        const leadIndex = stage.leads.findIndex(lead => lead.id === leadId)
        if (leadIndex >= 0) {
          leadToMove = stage.leads[leadIndex]
          stage.leads.splice(leadIndex, 1)
          stage.count--
          break
        }
      }
      
      // Add to target stage
      if (leadToMove) {
        const targetStage = newData.find(stage => stage.id === targetStageId)
        if (targetStage) {
          targetStage.leads.push(leadToMove)
          targetStage.count++
        }
      }
      
      return newData
    })
  }, [])

  const handleUpdateLead = useCallback((leadId: string, newName: string) => {
    setPipelineData(prev => {
      const newData = [...prev]
      
      // Find and update the lead
      for (const stage of newData) {
        const leadIndex = stage.leads.findIndex(lead => lead.id === leadId)
        if (leadIndex >= 0) {
          stage.leads[leadIndex] = {
            ...stage.leads[leadIndex],
            name: newName
          }
          break
        }
      }
      
      return newData
    })
  }, [])

  const handleUpdateStage = useCallback((stageId: string, newName: string) => {
    setPipelineData(prev => {
      const newData = [...prev]
      
      // Find and update the stage
      const stageIndex = newData.findIndex(stage => stage.id === stageId)
      if (stageIndex >= 0) {
        newData[stageIndex] = {
          ...newData[stageIndex],
          name: newName
        }
      }
      
      return newData
    })
  }, [])

  const totalValue = pipelineData.reduce((sum, stage) => sum + stage.value, 0)
  const totalLeads = pipelineData.reduce((sum, stage) => sum + stage.count, 0)

  return (
    <DndProvider backend={HTML5Backend}>
      <MainLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">BACK TO DASHBOARD</span>
                </Link>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  IMPORT DARI WHATSAPP
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  TAMBAH LEAD BARU
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">lead</h1>
              <Badge variant="outline" className="text-blue-600">
                AI Auto-Response Aktif
              </Badge>
              <span className="text-sm text-gray-500">• Terakhir diperbarui 7 hari yang lalu</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Nilai Pipeline</p>
                    <p className="text-2xl font-bold text-gray-900">
                      Rp {totalValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">• Belum ada data perbandingan</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lead Aktif</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalLeads} Lead
                    </p>
                    <p className="text-xs text-blue-600">• 2 lead baru hari ini</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline Stages */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pipeline Stages</h2>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4">
              {pipelineData.map((stage) => (
                <PipelineStageColumn
                  key={stage.id}
                  stage={stage}
                  onDropLead={handleDropLead}
                  onUpdateLead={handleUpdateLead}
                  onUpdateStage={handleUpdateStage}
                />
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">💡 Tips menggunakan Pipeline</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Drag dan drop lead untuk memindahkan antar stage</li>
              <li>• Klik pada nama lead untuk mengedit nama lead</li>
              <li>• Klik pada nama stage untuk mengedit nama stage</li>
              <li>• Gunakan filter untuk mencari lead berdasarkan kriteria tertentu</li>
              <li>• Set up automation untuk menggerakkan lead otomatis</li>
            </ul>
          </div>
        </div>
      </MainLayout>
    </DndProvider>
  )
}

export default PipelinePage