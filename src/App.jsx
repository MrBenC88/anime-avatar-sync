import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { allExpressions, phonemeMap } from "./constants";

// https://github.com/pixiv/three-vrm
// https://github.com/madjin/vrm-samples/tree/master/vroid/beta

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

        // Explicitly neutralize T-pose by slightly adjusting the arms
        const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
        const rightUpperArm =
          vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
        const leftLowerArm = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
        const rightLowerArm =
          vrm.humanoid.getNormalizedBoneNode("rightLowerArm");

        if (leftUpperArm && rightUpperArm && leftLowerArm && rightLowerArm) {
          leftUpperArm.rotation.z = 0.4;
          rightUpperArm.rotation.z = -0.4;
          leftLowerArm.rotation.z = 0.1;
          rightLowerArm.rotation.z = -0.1;
        }
      },
      undefined,
      console.error
    );
  }, [url]);

  useFrame(({ clock }, delta) => {
    const vrm = vrmRef.current;
    if (vrm) {
      const time = clock.getElapsedTime();
      const smoothTime = Math.sin(time * 0.5) * 0.5; // Smooth easing

      // 🏃 **Natural Weight Shifting & Full-Body Sway**
      vrm.scene.position.x = 0.08 * Math.sin(time * 0.7); // Subtle left-right shift
      vrm.scene.position.y = 0.01 * Math.sin(time * 1.5); // Gentle up-down sway

      // 🎭 **Expressive Head Movements (Friendly, Playful)**
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      if (head) {
        head.rotation.x = 0.15 * Math.sin(time * 0.5); // Subtle up-down
        head.rotation.y = 0.12 * Math.sin(time * 0.3); // Side tilts
        head.rotation.z = 0.08 * Math.sin(time * 0.4); // Tilt for engagement
      }

      // 💃 **Hips & Torso Dynamic Movement**
      const spine = vrm.humanoid.getNormalizedBoneNode("spine");
      const hips = vrm.humanoid.getNormalizedBoneNode("hips");
      if (spine && hips) {
        hips.rotation.y = 0.06 * Math.sin(time * 0.3);
        hips.position.x = 0.02 * Math.sin(time * 0.4);
        spine.rotation.x = 0.05 * Math.sin(time * 0.2);
      }

      // ✋ **Big, Expressive Arm & Hand Movements**
      const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
      const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
      const leftLowerArm = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
      const rightLowerArm = vrm.humanoid.getNormalizedBoneNode("rightLowerArm");

      if (leftUpperArm && rightUpperArm && leftLowerArm && rightLowerArm) {
        const armSpeed = 0.6; // Smooth movement speed

        // No more T-Pose! Relaxed arms that **move naturally**
        leftUpperArm.rotation.x = 0.3 * Math.sin(time * 0.5);
        leftUpperArm.rotation.z = 0.2 * Math.sin(time * 0.7);
        leftLowerArm.rotation.x = 0.2 * Math.sin(time * 0.5 + Math.PI / 2);

        rightUpperArm.rotation.x = -0.3 * Math.sin(time * 0.5);
        rightUpperArm.rotation.z = -0.2 * Math.sin(time * 0.7);
        rightLowerArm.rotation.x = -0.2 * Math.sin(time * 0.5 + Math.PI / 2);

        // ✋ **Occasional Playful Wave (Teasing)**
        if (Math.sin(time * 0.2) > 0.95) {
          rightUpperArm.rotation.z = -0.3;
          rightLowerArm.rotation.z = 0.4;
        }
      }

      // 🦵 **Legs Look More Natural, Subtle Shifting**
      const leftUpperLeg = vrm.humanoid.getNormalizedBoneNode("leftUpperLeg");
      const rightUpperLeg = vrm.humanoid.getNormalizedBoneNode("rightUpperLeg");
      const leftLowerLeg = vrm.humanoid.getNormalizedBoneNode("leftLowerLeg");
      const rightLowerLeg = vrm.humanoid.getNormalizedBoneNode("rightLowerLeg");

      if (leftUpperLeg && rightUpperLeg && leftLowerLeg && rightLowerLeg) {
        leftUpperLeg.rotation.x = 0.05 * Math.sin(time * 0.6);
        rightUpperLeg.rotation.x = -0.05 * Math.sin(time * 0.6);

        leftLowerLeg.rotation.x = 0.03 * Math.sin(time * 0.8);
        rightLowerLeg.rotation.x = -0.03 * Math.sin(time * 0.8);

        // Feet slight movement (natural stance)
        leftUpperLeg.position.x = -0.02; // Spread legs a bit
        rightUpperLeg.position.x = 0.02;
      }

      // 👀 **Eyes & Blinking for More Expressive Feel**
      const blinkValue = Math.abs(Math.sin(time * 0.8)) > 0.97 ? 1.0 : 0.0;

      // Reset expressions
      allExpressions.forEach((exp) => vrm.expressionManager.setValue(exp, 0));

      // Phoneme expressions
      const currentExpression = phonemeMap[phonemeRef.current];
      if (currentExpression) {
        vrm.expressionManager.setValue(currentExpression, 1.0);
      }

      // Playful Blink & Smile Expression
      vrm.expressionManager.setValue("blink", blinkValue);
      vrm.expressionManager.setValue(
        "happy",
        Math.sin(time * 0.5) > 0.9 ? 0.8 : 0
      ); // Subtle smiling

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
