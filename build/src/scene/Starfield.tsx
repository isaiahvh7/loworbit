import { Stars } from "@react-three/drei";

export default function Starfield() {
  return (
    <Stars
      radius={120}
      depth={60}
      count={2500}
      factor={9}
      saturation={0}
      fade
      speed={0.4}
    />
  );
}