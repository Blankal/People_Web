// src/EditableNode.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

function EditableNode({ id, data, selected, setNodes }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const inputRef = useRef();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label } } : node
      )
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current.blur(); // Save on Enter
    }
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        padding: '4px 8px',
        background: selected ? '#444' : '#333',
        color: 'white',
        borderRadius: 4,
        cursor: 'pointer',
        minWidth: '60px',
        textAlign: 'center',
      }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            fontSize: '14px',
            padding: '2px',
            borderRadius: '4px',
            border: 'none',
            outline: 'none',
            width: '100%',
          }}
        />
      ) : (
        <span>{label}</span>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default EditableNode;
