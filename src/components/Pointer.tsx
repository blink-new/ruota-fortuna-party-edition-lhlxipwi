import React from 'react'

export const Pointer: React.FC = () => {
  return (
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
      <svg width="40" height="50" viewBox="0 0 40 50" className="drop-shadow-lg">
        <polygon 
          points="20,0 35,40 20,35 5,40" 
          fill="#FFD700" 
          stroke="#B8860B" 
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}