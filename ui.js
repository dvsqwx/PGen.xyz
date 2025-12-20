import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("hero3d");
const appSection = document.getElementById("app");
const themeToggle = document.getElementById("themeToggle");
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (ev) => {
    const id = a.getAttribute("href");
    const el = document.querySelector(id);
    if (!el) return;
    ev.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});


const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) appSection.classList.add("isVisible");
  }
}, { threshold: 0.18 });
if (appSection) io.observe(appSection);


const THEME_KEY = "pgen_theme_v1";
function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  if (themeToggle) themeToggle.textContent = theme === "light" ? "Theme: Light" : "Theme: Dark";
}
const savedTheme = localStorage.getItem(THEME_KEY);
applyTheme(savedTheme === "light" ? "light" : "dark");
themeToggle?.addEventListener("click", () => {
  const current = document.body.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});


if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.25, 6);
  const group = new THREE.Group();
  scene.add(group);


  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(3, 3, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x9aa7ff, 0.55);
  fill.position.set(-4, 2, -2);
  scene.add(fill);
  const rimCyan = new THREE.PointLight(0x21d4ff, 1.15, 30);
  rimCyan.position.set(0, 1.4, 4);
  scene.add(rimCyan);
  const rimRed = new THREE.PointLight(0xff3d6a, 0.75, 30);
  rimRed.position.set(-2.2, -0.6, 3.0);
  scene.add(rimRed);
  scene.add(new THREE.AmbientLight(0xffffff, 0.30));


  const crystal = new THREE.Group();
  group.add(crystal);
  const geo = new THREE.OctahedronGeometry(1.25, 0);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0f18,
    metalness: 0.35,
    roughness: 0.15,
    transmission: 0.6,
    thickness: 0.6,
    ior: 1.4,
    clearcoat: 1.0,
    clearcoatRoughness: 0.12
  });

  const core = new THREE.Mesh(geo, glassMat);
  crystal.add(core);
  const wire = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      color: 0x21d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.55
    })
  );
  wire.scale.setScalar(1.015);
  crystal.add(wire);
  const edges = new THREE.EdgesGeometry(geo);
  const edgeLines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.72
    })
  );
  edgeLines.scale.setScalar(1.02);
  crystal.add(edgeLines);
  const inner = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.62, 0),
    new THREE.MeshStandardMaterial({
      color: 0x7c5cff,
      metalness: 0.2,
      roughness: 0.25,
      emissive: 0x140a2a,
      emissiveIntensity: 1.0
    })
  );
  inner.rotation.set(0.6, 0.2, 0.1);
  crystal.add(inner);


  const shardGeo = new THREE.OctahedronGeometry(0.18, 0);
  for (let i = 0; i < 10; i++) {
    const shard = new THREE.Mesh(
      shardGeo,
      new THREE.MeshStandardMaterial({
        color: 0xdfe7ff,
        metalness: 0.55,
        roughness: 0.3
      })
    );
    shard.position.set(
      (Math.random() - 0.5) * 3.4,
      (Math.random() - 0.5) * 1.8,
      (Math.random() - 0.5) * 1.8
    );
    shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    shard.userData.spin = {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
      z: (Math.random() - 0.5) * 0.02
    };
    crystal.add(shard);
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
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  });
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    group.rotation.y = t * 0.18;
    group.rotation.x = Math.sin(t * 0.55) * 0.10;
    group.rotation.z = Math.cos(t * 0.40) * 0.08;
    
    crystal.rotation.y += 0.008;
    crystal.rotation.x += 0.006;
    crystal.children.forEach((obj) => {
      if (obj.userData?.spin) {
        obj.rotation.x += obj.userData.spin.x;
        obj.rotation.y += obj.userData.spin.y;
        obj.rotation.z += obj.userData.spin.z;
      }
    });

    camera.position.x = mx * 0.35;
    camera.position.y = 0.25 + (-my * 0.22);

    renderer.render(scene, camera);
  }
  animate();
}
