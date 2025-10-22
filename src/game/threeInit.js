import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function createRendererAndScene(canvas) {
  // Set initial canvas size to match viewport
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true, 
    alpha: false,
    powerPreference: 'high-performance'
  });
  
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0e14);

  // Basic lighting
  const hemi = new THREE.HemisphereLight(0xffffff, 0x101020, 0.6);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(10, 20, 10);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  scene.add(dir);

  return { renderer, scene };
}

export function createCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
  camera.position.set(0, 6, -10); // behind player looking forward (Z+)
  camera.lookAt(0, 0, 10);
  return camera;
}
