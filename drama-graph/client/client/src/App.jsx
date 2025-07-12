import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import EditableNode from './EditableNode';

let id = 3;
const getId = () => `${id++}`;

const initialNodes = [
  {
    id: '1',
    type: 'editable',
    data: { label: 'Alice' },
    position: { x: 100, y: 100 },
  },
  {
    id: '2',
    type: 'editable',
    data: { label: 'Bob' },
    position: { x: 400, y: 100 },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'dating',
    style: { stroke: 'pink' },
  },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [relationshipType, setRelationshipType] = useState('dating');

  const nodeTypes = {
    editable: (nodeProps) => (
      <EditableNode {...nodeProps} setNodes={setNodes} />
    ),
  };

  const getEdgeColor = (type) => {
    switch (type) {
      case 'hate': return 'red';
      case 'dating': return 'pink';
      case 'friends': return 'lightblue';
      default: return 'gray';
    }
  };

  const onNodeClick = useCallback(
    (_, node) => {
      if (!selectedNode) {
        setSelectedNode(node);
      } else {
        if (selectedNode.id !== node.id) {
          const newEdge = {
            id: `e${selectedNode.id}-${node.id}`,
            source: selectedNode.id,
            target: node.id,
            label: relationshipType,
            style: {
              stroke: getEdgeColor(relationshipType),
              strokeWidth: 2,
            },
          };
          setEdges((eds) => addEdge(newEdge, eds));
        }
        setSelectedNode(null);
      }
    },
    [selectedNode, relationshipType, setEdges]
  );

  const handleAddNode = () => {
    const newNode = {
      id: getId(),
      type: 'editable',
      data: { label: `Person ${id}` },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 200 + 100,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          padding: '0.5rem',
          background: '#333',
          color: 'white',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <button onClick={handleAddNode}>➕ Add Node</button>
        <label>
          Relationship:
          <select
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="dating">Dating</option>
            <option value="hate">Hate</option>
            <option value="friends">Friends</option>
          </select>
        </label>
        {selectedNode && <span>Selected: {selectedNode.data.label}</span>}
      </div>

      <div className="flow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
