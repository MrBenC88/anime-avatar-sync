# VRM Avatar with Lip Sync 

Animate a 3D VRM avatar in real-time with full-body motion, subtle facial expressions, and **AI-driven lip sync**.

![image](https://github.com/user-attachments/assets/a236e68c-d41f-4a4e-8167-41c4813ba927)

## 🚀 Features

* 🗣️ Text-to-Speech (TTS) with dynamic phoneme detection
* 👄 Lip syncing with accurate mouth shape transitions
* 🧍‍♂️ Full-body motion: sway, blinking, smiling, arm movement
* 🎮 Interactive 3D control with orbit camera
* 🧠 Built with `@react-three/fiber`, `three-vrm`, and `drei`

## 🧪 Tech Stack

* React + Vite
* @react-three/fiber (React Three.js bindings)
* three-vrm + VRMLoaderPlugin
* TTS


## 🛠️ Setup

1. Clone the repo

2. Install dependencies
   `npm install`

3. Run locally
   `npm run dev`

4. Place your `.vrm` model inside `public/models/avatar.vrm`


## 🧠 Notes

* This is an experimental fun project - not optimized for production.
* All expressions are managed via `expressionManager` with full-body procedural animation.




----------------
# React + Vite
This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
