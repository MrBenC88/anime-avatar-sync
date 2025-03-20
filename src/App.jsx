import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";

const phonemeMap = {
  A: "aa", // "ah", open mouth
  B: "ih", // "ih", slight open
  C: "ee", // "ee", smile-like
  D: "oh", // "oh", round shape
  E: "ou", // "ou", pursed lips
  F: "neutral", // default neutral
  G: "neutral", // neutral
  H: "neutral", // silence
  X: "neutral", // silence
};

const allExpressions = ["aa", "ih", "ee", "oh", "ou", "neutral"];

const VRMAvatar = ({ url, phoneme }) => {
  const [vrm, setVrm] = useState(null);
  const phonemeRef = useRef("neutral");

  useEffect(() => {
    phonemeRef.current = phoneme || "neutral";
  }, [phoneme]);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load(
      url,
      (gltf) => {
        const vrm = gltf.userData.vrm;
        vrm.scene.rotation.y = Math.PI;
        setVrm(vrm);
      },
      undefined,
      console.error
    );
  }, [url]);

  useFrame((_, delta) => {
    if (vrm) {
      // Reset all expressions
      allExpressions.forEach((exp) => vrm.expressionManager.setValue(exp, 0));

      // Apply current phoneme expression accurately
      const currentExpression = phonemeMap[phonemeRef.current];
      if (currentExpression) {
        vrm.expressionManager.setValue(currentExpression, 1.0);
      }

      vrm.expressionManager.update();
      vrm.update(delta);
    }
  });

  return vrm ? <primitive object={vrm.scene} /> : null;
};

function App() {
  const [phoneme, setPhoneme] = useState("X"); // Default to neutral

  const speakWithLipSync = async () => {
    const response = await fetch("/data/phonemes.json");
    const { mouthCues } = await response.json();

    const text = "Hello, this is AI-driven speech!";
    const utterance = new SpeechSynthesisUtterance(text);

    // Adjust speech rate to match phoneme data duration
    const duration = mouthCues[mouthCues.length - 1].end;
    utterance.rate = Math.max(0.5, Math.min(2, (text.length / duration) * 0.1));

    speechSynthesis.speak(utterance);

    const startTime = performance.now();

    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const cue = mouthCues.find((c) => elapsed >= c.start && elapsed < c.end);

      setPhoneme(cue ? cue.value : "X");

      if (elapsed < duration) requestAnimationFrame(animate);
      else setPhoneme("X");
    };

    animate();
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas camera={{ position: [0, 1.5, 3] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 7]} intensity={1} />
        <VRMAvatar url="/models/avatar.vrm" phoneme={phoneme} />
        <OrbitControls />
      </Canvas>

      <button
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "10px 20px",
          fontSize: "16px",
          zIndex: 1,
        }}
        onClick={speakWithLipSync}
      >
        ▶️ Speak with Accurate Lip Sync (TTS)
      </button>
    </div>
  );
}

export default App;
