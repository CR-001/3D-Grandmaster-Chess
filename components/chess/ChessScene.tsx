"use client";

import { OrbitControls, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { Color } from "chess.js";
import { useMemo } from "react";

type PieceOnBoard = { square: string; type: string; color: Color };

function Piece({ type, color }: { type: string; color: Color }) {
  const light = color === "w";
  const material = light ? "#f2ead4" : "#26392f";
  const trim = light ? "#d3bd8a" : "#8ba16f";
  return (
    <group position={[0, 0.08, 0]}>
      <mesh castShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.31, 0.37, 0.15, 32]} />
        <meshStandardMaterial color={material} roughness={0.32} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.12, 32]} />
        <meshStandardMaterial color={trim} roughness={0.38} metalness={0.18} />
      </mesh>
      {type === "p" && <>
        <mesh castShadow position={[0, 0.4, 0]}><cylinderGeometry args={[0.11, 0.19, 0.32, 24]} /><meshStandardMaterial color={material} roughness={0.32} /></mesh>
        <mesh castShadow position={[0, 0.67, 0]}><sphereGeometry args={[0.17, 24, 20]} /><meshStandardMaterial color={material} roughness={0.28} /></mesh>
      </>}
      {type === "r" && <>
        <mesh castShadow position={[0, 0.47, 0]}><cylinderGeometry args={[0.2, 0.24, 0.38, 24]} /><meshStandardMaterial color={material} roughness={0.32} /></mesh>
        <mesh castShadow position={[0, 0.72, 0]}><cylinderGeometry args={[0.31, 0.24, 0.17, 24]} /><meshStandardMaterial color={trim} roughness={0.3} metalness={0.16} /></mesh>
        {[[-0.2, 0.84, -0.2], [0.2, 0.84, -0.2], [-0.2, 0.84, 0.2], [0.2, 0.84, 0.2]].map(([x, y, z]) => <mesh key={`${x}-${z}`} castShadow position={[x, y, z]}><boxGeometry args={[0.12, 0.13, 0.12]} /><meshStandardMaterial color={material} /></mesh>)}
      </>}
      {type === "n" && <>
        <mesh castShadow position={[0.01, 0.47, 0]} rotation={[0, 0, -0.28]}><capsuleGeometry args={[0.16, 0.36, 6, 12]} /><meshStandardMaterial color={material} roughness={0.34} /></mesh>
        <mesh castShadow position={[0.03, 0.73, -0.08]} rotation={[0, 0, -0.48]}><coneGeometry args={[0.17, 0.34, 4]} /><meshStandardMaterial color={trim} roughness={0.3} /></mesh>
        <mesh position={[-0.1, 0.78, 0.01]}><sphereGeometry args={[0.035, 10, 10]} /><meshStandardMaterial color={light ? "#253126" : "#f2ead4"} /></mesh>
      </>}
      {type === "b" && <>
        <mesh castShadow position={[0, 0.47, 0]}><cylinderGeometry args={[0.13, 0.22, 0.38, 24]} /><meshStandardMaterial color={material} roughness={0.32} /></mesh>
        <mesh castShadow position={[0, 0.74, 0]}><coneGeometry args={[0.21, 0.34, 24]} /><meshStandardMaterial color={trim} roughness={0.32} /></mesh>
        <mesh castShadow position={[0, 0.94, 0]}><sphereGeometry args={[0.08, 20, 16]} /><meshStandardMaterial color={material} /></mesh>
      </>}
      {type === "q" && <>
        <mesh castShadow position={[0, 0.45, 0]}><cylinderGeometry args={[0.15, 0.23, 0.36, 24]} /><meshStandardMaterial color={material} roughness={0.32} /></mesh>
        <mesh castShadow position={[0, 0.69, 0]}><coneGeometry args={[0.27, 0.3, 24]} /><meshStandardMaterial color={trim} roughness={0.28} metalness={0.12} /></mesh>
        {Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * Math.PI * 2; return <mesh key={i} castShadow position={[Math.cos(a) * 0.2, 0.9, Math.sin(a) * 0.2]}><sphereGeometry args={[0.075, 14, 14]} /><meshStandardMaterial color={material} /></mesh>; })}
      </>}
      {type === "k" && <>
        <mesh castShadow position={[0, 0.45, 0]}><cylinderGeometry args={[0.16, 0.23, 0.36, 24]} /><meshStandardMaterial color={material} roughness={0.32} /></mesh>
        <mesh castShadow position={[0, 0.72, 0]}><coneGeometry args={[0.23, 0.3, 24]} /><meshStandardMaterial color={trim} roughness={0.28} metalness={0.12} /></mesh>
        <mesh castShadow position={[0, 1.01, 0]}><boxGeometry args={[0.1, 0.32, 0.1]} /><meshStandardMaterial color={material} /></mesh>
        <mesh castShadow position={[0, 1.07, 0]}><boxGeometry args={[0.29, 0.08, 0.1]} /><meshStandardMaterial color={material} /></mesh>
      </>}
    </group>
  );
}

function Board({ pieces, orientation, selected, targets, hint, onSquareClick }: {
  pieces: PieceOnBoard[];
  orientation: "white" | "black";
  selected: string | null;
  targets: string[];
  hint?: { from: string; to: string } | null;
  onSquareClick: (square: string) => void;
}) {
  const mapped = useMemo(() => {
    const coord = (square: string) => {
      const file = square.charCodeAt(0) - 97;
      const rank = Number(square[1]) - 1;
      return orientation === "white"
        ? [file - 3.5, 3.5 - rank]
        : [3.5 - file, rank - 3.5];
    };
    return { coord };
  }, [orientation]);

  return (
    <>
      <mesh receiveShadow position={[0, -0.18, 0]}>
        <boxGeometry args={[8.5, 0.35, 8.5]} />
        <meshStandardMaterial color="#314439" roughness={0.42} />
      </mesh>
      {Array.from({ length: 64 }, (_, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const square = `${String.fromCharCode(orientation === "white" ? 97 + col : 104 - col)}${orientation === "white" ? 8 - row : row + 1}`;
        const [x, z] = [-3.5 + col, -3.5 + row];
        const isLight = (row + col) % 2 === 0;
        const active = selected === square;
        const isHint = hint?.from === square || hint?.to === square;
        return (
          <group key={square} position={[x, 0, z]}>
            <mesh receiveShadow onClick={(event) => { event.stopPropagation(); onSquareClick(square); }}>
              <boxGeometry args={[1, 0.09, 1]} />
              <meshStandardMaterial color={active ? "#a5c982" : isHint ? "#cfae63" : isLight ? "#e8dec6" : "#6b8a69"} roughness={0.62} />
            </mesh>
            {targets.includes(square) && <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.15, 24]} /><meshBasicMaterial color="#243d2e" transparent opacity={0.45} /></mesh>}
          </group>
        );
      })}
      {Array.from({ length: 8 }, (_, index) => {
        const file = String.fromCharCode(orientation === "white" ? 97 + index : 104 - index);
        const rank = String(orientation === "white" ? 8 - index : index + 1);
        const x = -3.5 + index;
        const z = -3.5 + index;
        return (
          <group key={`coordinates-${index}`}>
            <Text raycast={() => null} position={[x, 0.052, -4.12]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.19} color="#293b30" anchorX="center" anchorY="middle">{file}</Text>
            <Text raycast={() => null} position={[x, 0.052, 4.12]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.19} color="#293b30" anchorX="center" anchorY="middle">{file}</Text>
            <Text raycast={() => null} position={[-4.12, 0.052, z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.19} color="#293b30" anchorX="center" anchorY="middle">{rank}</Text>
            <Text raycast={() => null} position={[4.12, 0.052, z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.19} color="#293b30" anchorX="center" anchorY="middle">{rank}</Text>
          </group>
        );
      })}
      {pieces.map((piece) => {
        const [x, z] = mapped.coord(piece.square);
        return <group key={piece.square} position={[x, 0.04, z]} onClick={(event) => { event.stopPropagation(); onSquareClick(piece.square); }}><Piece type={piece.type} color={piece.color} /></group>;
      })}
    </>
  );
}

export default function ChessScene(props: {
  pieces: PieceOnBoard[];
  orientation: "white" | "black";
  selected: string | null;
  targets: string[];
  hint?: { from: string; to: string } | null;
  onSquareClick: (square: string) => void;
}) {
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [10.2, 12, 13], fov: 36 }}>
      <color attach="background" args={["#17211c"]} />
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 10, 5]} intensity={3.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-5, 4, -3]} intensity={18} color="#b6d89c" />
      <Board {...props} />
      <OrbitControls enablePan={false} minDistance={9} maxDistance={18} minPolarAngle={0.35} maxPolarAngle={1.2} target={[0, 0, 0]} />
    </Canvas>
  );
}
