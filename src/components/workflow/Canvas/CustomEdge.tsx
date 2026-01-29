import { type FC } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

const CustomEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: 'hsl(var(--electric))',
          strokeWidth: 2,
        }}
      />
      {/* Animated flow indicator */}
      <circle r="4" fill="hsl(var(--electric))">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
};

export default CustomEdge;
