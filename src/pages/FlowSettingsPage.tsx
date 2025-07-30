"use client"

import  { useState, useCallback, useMemo } from 'react'
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
import { 
  ArrowLeft, 
  Play, 
  Save, 
  RotateCcw,
  Settings,
  ChefHat
} from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'

// Initial nodes for cooking scrambled eggs flow
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { 
      label: (
        <div className="flex items-center gap-2">
          <ChefHat className="h-4 w-4" />
          <span>Mulai Memasak</span>
        </div>
      ) 
    },
    position: { x: 250, y: 0 },
    style: { 
      background: '#e3f2fd', 
      border: '2px solid #2196f3', 
      borderRadius: '10px',
      padding: '10px',
      minWidth: '150px'
    },
  },
  {
    id: '2',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-medium">Siapkan Bahan</div>
          <div className="text-xs text-gray-600 mt-1">
            • 2 butir telur<br/>
            • Garam secukupnya<br/>
            • Minyak goreng
          </div>
        </div>
      ) 
    },
    position: { x: 250, y: 100 },
    style: { 
      background: '#fff3e0', 
      border: '2px solid #ff9800', 
      borderRadius: '10px',
      padding: '15px',
      minWidth: '180px'
    },
  },
  {
    id: '3',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-medium">Pecahkan Telur</div>
          <div className="text-xs text-gray-600 mt-1">
            Pecahkan telur ke dalam mangkuk
          </div>
        </div>
      ) 
    },
    position: { x: 100, y: 220 },
    style: { 
      background: '#f3e5f5', 
      border: '2px solid #9c27b0', 
      borderRadius: '10px',
      padding: '15px',
      minWidth: '160px'
    },
  },
  {
    id: '4',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-medium">Tambahkan Garam</div>
          <div className="text-xs text-gray-600 mt-1">
            Beri garam secukupnya
          </div>
        </div>
      ) 
    },
    position: { x: 400, y: 220 },
    style: { 
      background: '#e8f5e8', 
      border: '2px solid #4caf50', 
      borderRadius: '10px',
      padding: '15px',
      minWidth: '160px'
    },
  },
  {
    id: '5',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-medium">Kocok Telur</div>
          <div className="text-xs text-gray-600 mt-1">
            Kocok hingga tercampur rata
          </div>
        </div>
      ) 
    },
    position: { x: 250, y: 340 },
    style: { 
      background: '#fce4ec', 
      border: '2px solid #e91e63', 
      borderRadius: '10px',
      padding: '15px',
      minWidth: '160px'
    },
  },
  {
    id: '6',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-medium">Panaskan Wajan</div>
          <div className="text-xs text-gray-600 mt-1">
            Panaskan wajan dengan api sedang
          </div>
        </div>
      ) 
    },
    position: { x: 250, y: 460 },
    style: { 
      background: '#fff8e1', 
      border: '2px solid #ffc107', 
      borderRadius: '10px',
      padding: '15px',
      minWidth: '160px'
    },
  },
  {
    id: '7',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-medium">Tuang Minyak</div>
          <div className="text-xs text-gray-600 mt-1">
            Tuang minyak secukupnya
          </div>
        </div>
      ) 
    },
    position: { x: 100, y: 580 },
    style: { 
      background: '#e0f2f1', 
      border: '2px solid #009688', 
      borderRadius: '10px',
      padding: '15px',
      minWidth: '160px'
    },
  },
  {
    id: '8',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-medium">Tuang Telur</div>
          <div className="text-xs text-gray-600 mt-1">
            Tuang adonan telur ke wajan
          </div>
        </div>
      ) 
    },
    position: { x: 400, y: 580 },
    style: { 
      background: '#f1f8e9', 
      border: '2px solid #8bc34a', 
      borderRadius: '10px',
      padding: '15px',
      minWidth: '160px'
    },
  },
  {
    id: '9',
    data: { 
      label: (
        <div className="text-center">
          <div className="font-medium">Masak Telur</div>
          <div className="text-xs text-gray-600 mt-1">
            Masak sambil diaduk hingga matang
          </div>
        </div>
      ) 
    },
    position: { x: 250, y: 700 },
    style: { 
      background: '#fef7ff', 
      border: '2px solid #673ab7', 
      borderRadius: '10px',
      padding: '15px',
      minWidth: '160px'
    },
  },
  {
    id: '10',
    type: 'output',
    data: { 
      label: (
        <div className="flex items-center gap-2">
          <ChefHat className="h-4 w-4" />
          <span>Telur Dadar Siap!</span>
        </div>
      ) 
    },
    position: { x: 250, y: 820 },
    style: { 
      background: '#e8f5e8', 
      border: '2px solid #4caf50', 
      borderRadius: '10px',
      padding: '15px',
      minWidth: '160px',
      fontWeight: 'bold'
    },
  },
]

// Initial edges connecting the nodes
const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2',
    type: 'smoothstep',
    style: { stroke: '#2196f3', strokeWidth: 2 }
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3',
    type: 'smoothstep',
    style: { stroke: '#ff9800', strokeWidth: 2 }
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4',
    type: 'smoothstep',
    style: { stroke: '#ff9800', strokeWidth: 2 }
  },
  { 
    id: 'e3-5', 
    source: '3', 
    target: '5',
    type: 'smoothstep',
    style: { stroke: '#9c27b0', strokeWidth: 2 }
  },
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5',
    type: 'smoothstep',
    style: { stroke: '#4caf50', strokeWidth: 2 }
  },
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6',
    type: 'smoothstep',
    style: { stroke: '#e91e63', strokeWidth: 2 }
  },
  { 
    id: 'e6-7', 
    source: '6', 
    target: '7',
    type: 'smoothstep',
    style: { stroke: '#ffc107', strokeWidth: 2 }
  },
  { 
    id: 'e6-8', 
    source: '6', 
    target: '8',
    type: 'smoothstep',
    style: { stroke: '#ffc107', strokeWidth: 2 }
  },
  { 
    id: 'e7-9', 
    source: '7', 
    target: '9',
    type: 'smoothstep',
    style: { stroke: '#009688', strokeWidth: 2 }
  },
  { 
    id: 'e8-9', 
    source: '8', 
    target: '9',
    type: 'smoothstep',
    style: { stroke: '#8bc34a', strokeWidth: 2 }
  },
  { 
    id: 'e9-10', 
    source: '9', 
    target: '10',
    type: 'smoothstep',
    style: { stroke: '#673ab7', strokeWidth: 2 }
  },
]

const FlowSettingsPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isPlaying, setIsPlaying] = useState(false)

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )

  const handlePlay = () => {
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
  }

  const handleReset = () => {
    setNodes(initialNodes)
    setEdges(initialEdges)
    setIsPlaying(false)
  }

  const handleSave = () => {
    const flowData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    }
    console.log('Saving flow:', flowData)
    toast.success('Flow berhasil disimpan!')
  }

  const nodeTypes = useMemo(() => ({}), [])

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
                onClick={handleReset}
                disabled={isPlaying}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlay}
                disabled={isPlaying}
              >
                <Play className="h-4 w-4 mr-1" />
                {isPlaying ? 'Playing...' : 'Play'}
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Flow Settings - Memasak Telur Dadar</h1>
          </div>

          {/* Flow Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                      {isPlaying ? 'Playing' : 'Ready'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flow Canvas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ChefHat className="h-4 w-4" />
                Flow Diagram - Cara Memasak Telur Dadar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: '450px' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                  attributionPosition="bottom-left"
                >
                  <Controls />
                  <MiniMap 
                    nodeStrokeColor={(n) => {
                      if (n.type === 'input') return '#2196f3'
                      if (n.type === 'output') return '#4caf50'
                      return '#ff9800'
                    }}
                    nodeColor={(n) => {
                      if (n.type === 'input') return '#e3f2fd'
                      if (n.type === 'output') return '#e8f5e8'
                      return '#fff3e0'
                    }}
                  />
                  <Background 
                    variant={BackgroundVariant.Dots} 
                    gap={12} 
                    size={1} 
                    color="#f0f0f0"
                  />
                </ReactFlow>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          {/* <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2 text-sm">💡 Cara Menggunakan Flow Editor</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Klik dan drag untuk memindahkan node</li>
              <li>• Gunakan mouse wheel untuk zoom in/out</li>
              <li>• Klik "Play" untuk melihat animasi step-by-step</li>
              <li>• Gunakan MiniMap di kanan bawah untuk navigasi cepat</li>
              <li>• Klik "Save" untuk menyimpan perubahan</li>
            </ul>
          </div> */}
        </div>
      </div>
    </MainLayout>
  )
}

export default FlowSettingsPage