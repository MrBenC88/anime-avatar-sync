import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { allExpressions, phonemeMap } from "./constants";

const VRMAvatar = ({ url, phoneme }) => {
  const vrmRef = useRef();
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
        vrmRef.current = vrm;
        vrm.humanoid.setPose("rest"); // Set to neutral rest pose, fix T-pose
      },
      undefined,
      console.error
    );
  }, [url]);

  useFrame(({ clock }, delta) => {
    const vrm = vrmRef.current;
    if (vrm) {
      const time = clock.getElapsedTime();

      // Gentle breathing
      vrm.scene.position.y = 0.01 * Math.sin(time * 2);

      // Smooth head movement (subtle idle animation)
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      if (head) {
        head.rotation.x = 0.03 * Math.sin(time * 0.8);
        head.rotation.y = 0.03 * Math.sin(time * 0.6);
        head.rotation.z = 0.02 * Math.sin(time * 1.2);
      }

      // Shoulder movement (natural idle stance)
      const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
      const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");
      if (leftShoulder && rightShoulder) {
        leftShoulder.rotation.z = 0.02 * Math.sin(time);
        rightShoulder.rotation.z = -0.02 * Math.sin(time);
      }

      // Natural blinking
      const blinkValue = Math.abs(Math.sin(time * 0.5)) > 0.98 ? 1.0 : 0.0;

      // Reset expressions
      allExpressions.forEach((exp) => vrm.expressionManager.setValue(exp, 0));

      // Phoneme expressions
      const currentExpression = phonemeMap[phonemeRef.current];
      if (currentExpression) {
        vrm.expressionManager.setValue(currentExpression, 1.0);
      }

      // Blink expression
      vrm.expressionManager.setValue("blink", blinkValue);

      vrm.expressionManager.update();
      vrm.update(delta);
    }
  });

  return vrmRef.current ? <primitive object={vrmRef.current.scene} /> : null;
};

function App() {
  const [phoneme, setPhoneme] = useState("X");

  const speakWithLipSync = async () => {
    const response = await fetch("/data/phonemes.json");
    const { mouthCues } = await response.json();

    const text = "Hello, this is AI-driven speech!";
    const utterance = new SpeechSynthesisUtterance(text);
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
    <div style={{ width: "100vw", height: "150vh", position: "relative" }}>
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
