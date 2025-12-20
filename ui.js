import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("hero3d");
const appSection = document.getElementById("app");
const toggleBtn = document.getElementById("toggle3dBtn");
let enabled = true;
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) appSection.classList.add("isVisible");
  }
}, { threshold: 0.18 });
io.observe(appSection);
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (ev) => {
    const id = a.getAttribute("href");
    const el = document.querySelector(id);
    if (!el) return;
    ev.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0.3, 6);
const group = new THREE.Group();
scene.add(group);
const key = new THREE.DirectionalLight(0xffffff, 1.2);
key.position.set(3, 3, 3);
scene.add(key);
const fill = new THREE.DirectionalLight(0x88aaff, 0.6);
fill.position.set(-4, 2, -2);
scene.add(fill);
const rim = new THREE.PointLight(0x22d4ff, 1.1, 30);
rim.position.set(0, 1.6, 4);
scene.add(rim);
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const metal = new THREE.MeshStandardMaterial({
  color: 0xdfe7ff,
  metalness: 0.9,
  roughness: 0.25
});

const neon = new THREE.MeshStandardMaterial({
  color: 0x21d4ff,
  metalness: 0.2,
  roughness: 0.15,
  emissive: 0x0b2230,
  emissiveIntensity: 1.0
});

const knot1 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.9, 0.26, 220, 24),
  metal
);
knot1.position.set(1.25, 0.1, 0.0);
group.add(knot1);
const knot2 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.65, 0.20, 220, 18),
  neon
);
knot2.position.set(-1.35, -0.2, -0.2);
group.add(knot2);
const ringGeo = new THREE.TorusGeometry(1.05, 0.09, 18, 120);
for (let i = 0; i < 3; i++) {
  const ring = new THREE.Mesh(ringGeo, metal.clone());
  ring.position.set(0.0, 0.6 - i * 0.55, -0.8 - i * 0.25);
  ring.rotation.set(0.6 + i * 0.2, 0.3 + i * 0.35, 0.2);
  ring.material.roughness = 0.18 + i * 0.08;
  group.add(ring);
}

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;

  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

let mx = 0, my = 0;
window.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = (e.clientY / window.innerHeight) * 2 - 1;
  mx = x; my = y;
});
let t = 0;
function animate() {
  requestAnimationFrame(animate);
  if (!enabled) return;
  t += 0.01;
  group.rotation.y = t * 0.35;
  group.rotation.x = Math.sin(t * 0.6) * 0.12;
  group.rotation.z = Math.cos(t * 0.45) * 0.08;
  knot1.rotation.x += 0.006;
  knot1.rotation.y += 0.008;
  knot2.rotation.x -= 0.007;
  knot2.rotation.z += 0.006;
  camera.position.x = mx * 0.35;
  camera.position.y = 0.3 + (-my * 0.22);
  renderer.render(scene, camera);
}
animate();
toggleBtn?.addEventListener("click", () => {
  enabled = !enabled;
  toggleBtn.textContent = enabled ? "3D: увімкнено" : "3D: вимкнено";
  if (enabled) renderer.render(scene, camera);
});
