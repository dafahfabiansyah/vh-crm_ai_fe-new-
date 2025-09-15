"use client"

import React, { useState, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react'

import type { Node, Edge, Connection } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import MainLayout from '@/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Play, 
  Save, 
  RotateCcw,
  Settings,
  ChefHat,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'
import { Link } from 'react-router'
import { useToast } from "@/hooks"

// Custom Node Component
interface CustomNodeData {
  title: string;
  description?: string;
}

const CustomNode: React.FC<{ data: CustomNodeData }> = ({ data }) => {
  return (
    <div className="text-center">
      <div className="font-medium text-sm">{data.title}</div>
      {data.description && (
        <div className="text-xs text-gray-600 mt-1">
          {data.description}
        </div>
      )}
    </div>
  );
};

// Node type definitions - Gray color scheme
const nodeColors = [
  { name: 'Light Gray', bg: '#f8f9fa', border: '#6c757d' },
  { name: 'Medium Gray', bg: '#f1f3f4', border: '#495057' },
  { name: 'Soft Gray', bg: '#f5f5f5', border: '#6c757d' },
  { name: 'Cool Gray', bg: '#f8f9fa', border: '#5a6268' },
  { name: 'Warm Gray', bg: '#f6f6f6', border: '#6c757d' },
  { name: 'Silver Gray', bg: '#f4f4f4', border: '#495057' },
  { name: 'Slate Gray', bg: '#f1f3f4', border: '#5a6268' },
  { name: 'Stone Gray', bg: '#f5f5f5', border: '#6c757d' },
  { name: 'Ash Gray', bg: '#f8f9fa', border: '#495057' },
]

const CreateFlowPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [flowTitle, setFlowTitle] = useState('')
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [nodeTitle, setNodeTitle] = useState('')
  const [nodeDescription, setNodeDescription] = useState('')
  const [showAddNode, setShowAddNode] = useState(false)
  const { success, error } = useToast()

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  // Generate unique node ID
  const generateNodeId = () => {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Add new node
  const addNewNode = useCallback(() => {
    if (!nodeTitle.trim()) {
      error('Judul node tidak boleh kosong!')
      return
    }

    const colorIndex = nodes.length % nodeColors.length
    const color = nodeColors[colorIndex]
    
    const newNode: Node = {
      id: generateNodeId(),
      type: nodes.length === 0 ? 'input' : 'default',
      data: {
        title: nodeTitle,
        description: nodeDescription,
        label: <CustomNode data={{ title: nodeTitle, description: nodeDescription }} />
      },
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      style: {
        background: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: '10px',
        padding: '15px',
        minWidth: '160px'
      },
    }

    setNodes((nds) => [...nds, newNode])
    setNodeTitle('')
    setNodeDescription('')
    setShowAddNode(false)
    success('Node berhasil ditambahkan!')
  }, [nodeTitle, nodeDescription, nodes.length, error, success])

  // Delete node
  // const deleteNode = useCallback((nodeId: string) => {
  //   setNodes((nds) => nds.filter((node) => node.id !== nodeId))
  //   setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
  //   success('Node berhasil dihapus!')
  // }, [success])

  // Edit node
  const editNode = useCallback((node: Node) => {
    setSelectedNode(node)
    // Extract title and description from node data
    setNodeTitle(node.data.title || '')
    setNodeDescription(node.data.description || '')
    setShowAddNode(true)
  }, [])

  // Update existing node
  const updateNode = useCallback(() => {
    if (!selectedNode || !nodeTitle.trim()) {
      error('Judul node tidak boleh kosong!')
      return
    }

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                title: nodeTitle,
                description: nodeDescription,
                label: <CustomNode data={{ title: nodeTitle, description: nodeDescription }} />
              }
            }
          : node
      )
    )
    
    setSelectedNode(null)
    setNodeTitle('')
    setNodeDescription('')
    setShowAddNode(false)
    success('Node berhasil diperbarui!')
  }, [selectedNode, nodeTitle, nodeDescription, error, success])

  // Set last node as output
  const setLastNodeAsOutput = useCallback(() => {
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1]
      setNodes((nds) =>
        nds.map((node) =>
          node.id === lastNode.id
            ? { ...node, type: 'output' }
            : node.type === 'output'
            ? { ...node, type: 'default' }
            : node
        )
      )
    }
  }, [nodes])

  const handlePlay = useCallback(() => {
    if (nodes.length === 0) {
      error('Tidak ada node untuk dijalankan!')
      return
    }

    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      // Animate nodes one by one
      nodes.forEach((node, index) => {
        setTimeout(() => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id
                ? {
                    ...n,
                    style: {
                      ...n.style,
                      transform: 'scale(1.1)',
                      transition: 'transform 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    },
                  }
                : n,
            ),
          )
          
          // Reset animation after a moment
          setTimeout(() => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === node.id
                  ? {
                      ...n,
                      style: {
                        ...n.style,
                        transform: 'scale(1)',
                        boxShadow: 'none'
                      },
                    }
                  : n,
              ),
            )
          }, 800)
        }, index * 1000)
      })
      
      // Stop playing after animation completes
      setTimeout(() => {
        setIsPlaying(false)
      }, nodes.length * 1000)
    }
  }, [nodes, isPlaying, error])

  const handleReset = useCallback(() => {
    setNodes([])
    setEdges([])
    setIsPlaying(false)
    setFlowTitle('')
    setSelectedNode(null)
    setNodeTitle('')
    setNodeDescription('')
    setShowAddNode(false)
    success('Flow berhasil direset!')
  }, [success])

  const handleSave = useCallback(() => {
    if (!flowTitle.trim()) {
      error('Judul flow tidak boleh kosong!')
      return
    }
    
    if (nodes.length === 0) {
      error('Flow harus memiliki minimal 1 node!')
      return
    }

    const flowData = {
      title: flowTitle,
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    }
    console.log('Saving flow:', flowData)
    success('Flow berhasil disimpan!')
  }, [flowTitle, nodes, edges, error, success])

  // Handle node click
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault()
    editNode(node)
  }, [])

  const nodeTypes = useMemo(() => ({
    default: CustomNode,
    input: CustomNode,
    output: CustomNode
  }), [])

  return (
    <MainLayout>
      <div className="h-full overflow-auto">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="#"
                onClick={(e) => { e.preventDefault(); window.history.back(); }}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddNode(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Node
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isPlaying}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              {/* <Button
                variant="outline"
                size="sm"
                onClick={handlePlay}
                disabled={isPlaying || nodes.length === 0}
              >
                <Play className="h-4 w-4 mr-1" />
                {isPlaying ? 'Playing...' : 'Play'}
              </Button> */}
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={!flowTitle.trim() || nodes.length === 0}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>

          {/* Flow Title Input */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Settings className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <Label htmlFor="flowTitle" className="text-sm font-medium">
                    Flow Title
                  </Label>
                  <Input
                    id="flowTitle"
                    placeholder="Masukkan judul flow (contoh: Cara Memasak Nasi Goreng)"
                    value={flowTitle}
                    onChange={(e) => setFlowTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add/Edit Node Modal */}
          {showAddNode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {selectedNode ? 'Edit Node' : 'Add New Node'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nodeTitle">Node Title</Label>
                  <Input
                    id="nodeTitle"
                    placeholder="Masukkan judul step (contoh: Siapkan Bahan)"
                    value={nodeTitle}
                    onChange={(e) => setNodeTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nodeDescription">Description (Optional)</Label>
                  <Textarea
                    id="nodeDescription"
                    placeholder="Deskripsi detail step ini..."
                    value={nodeDescription}
                    onChange={(e) => setNodeDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={selectedNode ? updateNode : addNewNode}
                    className="flex-1"
                  >
                    {selectedNode ? 'Update Node' : 'Add Node'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddNode(false)
                      setSelectedNode(null)
                      setNodeTitle('')
                      setNodeDescription('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Flow Info Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ChefHat className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total Steps</p>
                    <p className="text-lg font-bold text-gray-900">{nodes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Settings className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Connections</p>
                    <p className="text-lg font-bold text-gray-900">{edges.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Play className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <Badge variant={isPlaying ? 'default' : 'secondary'} className="text-xs">
                      {isPlaying ? 'Playing' : nodes.length > 0 ? 'Ready' : 'Empty'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}

          {/* Flow Canvas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ChefHat className="h-4 w-4" />
                {flowTitle || 'Flow Diagram'}
              </CardTitle>
              {nodes.length > 0 && (
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={setLastNodeAsOutput}
                  >
                    Set Last as Output
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: '450px' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  // attributionPosition="bottom-left"
                  className="bg-gray-50"
                >
                  <Controls />
                  <MiniMap 
                    nodeStrokeColor={(n) => {
                      if (n.type === 'input') return '#495057'
                      if (n.type === 'output') return '#6c757d'
                      return '#5a6268'
                    }}
                    nodeColor={(n) => {
                      if (n.type === 'input') return '#f8f9fa'
                      if (n.type === 'output') return '#f1f3f4'
                      return '#f5f5f5'
                    }}
                  />
                  <Background 
                    variant={BackgroundVariant.Dots} 
                    gap={12} 
                    size={1} 
                    color="#e0e0e0"
                  />
                </ReactFlow>
              </div>
              
              {/* {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Mulai Buat Flow</p>
                    <p className="text-sm mb-4">Klik "Add Node" untuk menambahkan step pertama</p>
                    <Button onClick={() => setShowAddNode(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Node
                    </Button>
                  </div>
                </div>
              )} */}
            </CardContent>
          </Card>

        </div>
      </div>
    </MainLayout>
  )
}

export default CreateFlowPage