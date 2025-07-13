import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  updateEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

let id = 3;
const getId = () => `${id++}`;

const initialNodes = [
  {
    id: '1',
    type: 'editable',
    data: { label: 'Alice', isEditing: false },
    position: { x: 100, y: 100 },
  },
  {
    id: '2',
    type: 'editable',
    data: { label: 'Bob', isEditing: false },
    position: { x: 400, y: 100 },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'dating',
    style: { stroke: 'pink', strokeWidth: 2, opacity: 1 },
  },
];

const defaultRelationships = {
  dating: 'pink',
  hate: 'red',
  friends: 'lightblue',
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [relationshipTypes, setRelationshipTypes] = useState(defaultRelationships);
  const [relationshipType, setRelationshipType] = useState('dating');
  const [newRelationshipName, setNewRelationshipName] = useState('');
  const [selectedEdges, setSelectedEdges] = useState([]);

  const getEdgeColor = (type) => {
    return relationshipTypes[type] || 'gray';
  };

  const highlightEdgesForNode = (nodeId) => {
    setEdges((eds) =>
      eds.map((edge) => {
        const isConnected = edge.source === nodeId || edge.target === nodeId;
        const baseColor = getEdgeColor(edge.label);
        return {
          ...edge,
          style: {
            ...edge.style,
            stroke: baseColor,
            strokeWidth: isConnected ? 4 : 2,
            opacity: isConnected ? 1 : 0.3,
          },
        };
      })
    );
  };

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}-${Date.now()}`,
        label: relationshipType,
        style: {
          stroke: getEdgeColor(relationshipType),
          strokeWidth: 2,
          opacity: 1,
        },
        selectable: true,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [relationshipType, relationshipTypes]
  );

  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => {
      const updated = {
        ...newConnection,
        id: `e${newConnection.source}-${newConnection.target}-${Date.now()}`,
        label: oldEdge.label,
        style: oldEdge.style,
        selectable: true,
      };
      setEdges((eds) =>
        eds.map((e) => (e.id === oldEdge.id ? updated : e))
      );
    },
    []
  );

  const handleAddNode = () => {
    const newNode = {
      id: getId(),
      type: 'editable',
      data: { label: `Person ${id}`, isEditing: false },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 200 + 100,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id
            ? { ...n, data: { ...n.data, isEditing: true } }
            : n
        )
      );
    },
    [setNodes]
  );

  const onLabelChange = (e, id) => {
    const value = e.target.value;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label: value } } : n
      )
    );
  };

  const onLabelBlur = (id) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, isEditing: false } } : n
      )
    );
  };

  const handleAddRelationshipType = () => {
    const name = newRelationshipName.trim();
    if (!name || relationshipTypes[name]) return;

    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    setRelationshipTypes((prev) => ({ ...prev, [name]: randomColor }));
    setRelationshipType(name);
    setNewRelationshipName('');
  };

  // 🔥 Listen for Delete key to remove selected edges
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setEdges((eds) =>
          eds.filter((edge) => !selectedEdges.includes(edge.id))
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEdges]);

  const EditableNode = ({ id, data, selected }) => (
    <div
      style={{
        background: selected ? '#444' : '#333',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '6px',
        minWidth: '80px',
        textAlign: 'center',
        cursor: 'pointer',
        border: '1px solid #555',
        boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        position: 'relative',
      }}
    >
      {data.isEditing ? (
        <input
          value={data.label}
          autoFocus
          onChange={(e) => onLabelChange(e, id)}
          onBlur={() => onLabelBlur(id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.target.blur();
          }}
          style={{
            width: '100%',
            fontSize: '14px',
            padding: '2px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'white',
            textAlign: 'center',
          }}
        />
      ) : (
        <span>{data.label}</span>
      )}

      {/* 4 source + 4 target handles */}
      <Handle type="target" position={Position.Top} id="t-top" style={{ background: '#555' }} />
      <Handle type="target" position={Position.Right} id="t-right" style={{ background: '#555' }} />
      <Handle type="target" position={Position.Bottom} id="t-bottom" style={{ background: '#555' }} />
      <Handle type="target" position={Position.Left} id="t-left" style={{ background: '#555' }} />

      <Handle type="source" position={Position.Top} id="s-top" style={{ background: '#999' }} />
      <Handle type="source" position={Position.Right} id="s-right" style={{ background: '#999' }} />
      <Handle type="source" position={Position.Bottom} id="s-bottom" style={{ background: '#999' }} />
      <Handle type="source" position={Position.Left} id="s-left" style={{ background: '#999' }} />
    </div>
  );

  const nodeTypes = {
    editable: EditableNode,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="toolbar">
        <button onClick={handleAddNode}>➕ Add Node</button>
        <label>
          Relationship:
          <select
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
          >
            {Object.keys(relationshipTypes).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <input
          type="text"
          placeholder="New type"
          value={newRelationshipName}
          onChange={(e) => setNewRelationshipName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddRelationshipType();
          }}
        />
        <button onClick={handleAddRelationshipType}>Add Type</button>
      </div>

      <div className="flow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeUpdate={onEdgeUpdate}
          onNodeContextMenu={onNodeContextMenu}
          onSelectionChange={(e) => {
            if (e?.edges) {
              setSelectedEdges(e.edges.map((ed) => ed.id));
            } else {
              setSelectedEdges([]);
            }
          }}
          onNodeClick={(_, node) => highlightEdgesForNode(node.id)}
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
