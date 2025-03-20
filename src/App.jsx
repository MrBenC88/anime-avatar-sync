import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";

const VRMAvatar = ({ url }) => {
  const avatarRef = useRef(null);
  const [vrm, setVrm] = useState(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(
      url,
      (gltf) => {
        const vrm = gltf.userData.vrm;
        vrm.scene.rotation.y = Math.PI; // Rotate model to face forward
        avatarRef.current = vrm;
        setVrm(vrm);
      },
      undefined,
      (error) => {
        console.error("Error loading VRM:", error);
      }
    );
  }, [url]);

  useFrame((_, delta) => {
    if (vrm) {
      vrm.scene.rotation.y += delta * 0.5; // Simple rotation animation
      vrm.update(delta);
    }
  });

  return vrm ? <primitive object={vrm.scene} /> : null;
};

function App() {
  return (
    <Canvas camera={{ position: [0, 1.5, 3] }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 7]} intensity={1} />
      <VRMAvatar url="/models/avatar.vrm" />
      <OrbitControls />
    </Canvas>
  );
}

export default App;
