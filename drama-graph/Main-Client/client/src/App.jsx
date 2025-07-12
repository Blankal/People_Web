import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
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
    draggable: false,
  },
  {
    id: '2',
    type: 'editable',
    data: { label: 'Bob', isEditing: false },
    position: { x: 400, y: 100 },
    draggable: false,
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    label: 'dating',
    style: { stroke: 'pink' },
    selectable: true,
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

  const getEdgeColor = (type) => relationshipTypes[type] || 'gray';

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}-${Date.now()}`,
        label: relationshipType,
        style: { stroke: getEdgeColor(relationshipType), strokeWidth: 2 },
        selectable: true,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [relationshipType, relationshipTypes]
  );

  const onEdgeUpdate = useCallback((oldEdge, newConn) => {
    const updated = {
      ...newConn,
      id: `e${newConn.source}-${newConn.target}-${Date.now()}`,
      label: oldEdge.label,
      style: oldEdge.style,
      selectable: true,
    };
    setEdges((eds) => eds.map((e) => (e.id === oldEdge.id ? updated : e)));
  }, []);

  const handleAddNode = () => {
    const newNode = {
      id: getId(),
      type: 'editable',
      data: { label: `Person ${id}`, isEditing: false },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 100 },
      draggable: false,
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeContextMenu = useCallback((e, node) => {
    e.preventDefault();
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id ? { ...n, data: { ...n.data, isEditing: true } } : n
      )
    );
  }, [setNodes]);

  const onNodeDrag = (_evt, node) => {
    setNodes((nds) => nds.map((n) => (n.id === node.id ? node : n)));
  };

  const onNodeMouseDown = useCallback((evt, node) => {
    if (evt.button === 2) node.__rf.draggable = true;
  }, []);

  const onNodeMouseUp = useCallback((evt, node) => {
    if (evt.button === 2) node.__rf.draggable = false;
  }, []);

  const onLabelChange = (e, id) => {
    const value = e.target.value;
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: value } } : n))
    );
  };

  const onLabelBlur = (id) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, isEditing: false } } : n))
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

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setEdges((eds) => eds.filter((edge) => !selectedEdges.includes(edge.id)));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedEdges]);

  const EditableNode = ({ id, data, selected }) => (
    <div
      style={{
        background: selected ? '#444' : '#333',
        color: 'white',
        padding: '6px 10px',
        borderRadius: 6,
        minWidth: 80,
        textAlign: 'center',
        cursor: 'pointer',
        border: '1px solid #555',
        boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
      }}
      onContextMenu={(e) => e.stopPropagation()}
    >
      {data.isEditing ? (
        <input
          value={data.label}
          autoFocus
          onChange={(e) => onLabelChange(e, id)}
          onBlur={() => onLabelBlur(id)}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
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
    </div>
  );

  const nodeTypes = { editable: EditableNode };

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
            {Object.keys(relationshipTypes).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <input
          type="text"
          placeholder="New type"
          value={newRelationshipName}
          onChange={(e) => setNewRelationshipName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddRelationshipType()}
        />
        <button onClick={handleAddRelationshipType}>Add Type</button>
      </div>

      <div className="flow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeUpdate={onEdgeUpdate}
          onNodeContextMenu={onNodeContextMenu}
          onNodeDrag={onNodeDrag}
          onNodeMouseDown={onNodeMouseDown}
          onNodeMouseUp={onNodeMouseUp}
          onSelectionChange={(e) =>
            setSelectedEdges(e?.edges?.map((ed) => ed.id) || [])
          }
          connectable={true}
          nodesDraggable={false}
          fitView
          style={{ width: '100%', height: '100%' }}
        >
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
