import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const appSection = document.getElementById("app");
const canvas = document.getElementById("crystal3d");

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
    if (e.isIntersecting) appSection?.classList.add("isVisible");
  }
}, { threshold: 0.18 });
if (appSection) io.observe(appSection);

if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.18, 5.0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.32));
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(3, 3, 3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfd6ff, 0.35);
  fill.position.set(-4, 2, -2);
  scene.add(fill);
  const rim = new THREE.PointLight(0xffffff, 0.65, 30);
  rim.position.set(0, 1.2, 3.6);
  scene.add(rim);
  const limeRim = new THREE.PointLight(0xb9ff2a, 0.35, 30);
  limeRim.position.set(-2.4, 0.4, 2.8);
  scene.add(limeRim);
  const group = new THREE.Group();
  scene.add(group);
  const logo = new THREE.Group();
  group.add(logo);

  const tetraGeo = new THREE.TetrahedronGeometry(1.15, 0);

  const faceMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b0b0b,
    metalness: 0.20,
    roughness: 0.20,
    transmission: 0.45,
    thickness: 0.9,
    ior: 1.45,
    transparent: true,
    opacity: 0.86,
    clearcoat: 1.0,
    clearcoatRoughness: 0.10
  });
  const faces = new THREE.Mesh(tetraGeo, faceMat);
  logo.add(faces);

  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(tetraGeo),
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.36
    })
  );
  wire.scale.setScalar(1.01);
  logo.add(wire);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(tetraGeo),
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.86
    })
  );
  edges.scale.setScalar(1.02);
  logo.add(edges);

  const limeEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(tetraGeo),
    new THREE.LineBasicMaterial({
      color: 0xb9ff2a,
      transparent: true,
      opacity: 0.30
    })
  );
  limeEdges.scale.setScalar(1.025);
  limeEdges.rotation.set(0.05, 0.10, 0);
  logo.add(limeEdges);

  const inner = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.TetrahedronGeometry(0.74, 0)),
    new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45
    })
  );
  inner.rotation.set(0.25, 0.55, 0.12);
  logo.add(inner);

  const dots = new THREE.Group();
  logo.add(dots);
  const dotGeo = new THREE.SphereGeometry(0.045, 16, 16);
  const dotMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.08,
    roughness: 0.45
  });
  const dotPositions = [
    [ 0.95,  0.25,  0.20],
    [-0.90, -0.05,  0.35],
    [ 0.10, -0.85,  0.10],
    [-0.25,  0.75, -0.10],
    [ 0.55, -0.10, -0.70],
    [-0.55,  0.10, -0.70],
  ];
  dotPositions.forEach((p, i) => {
    const d = new THREE.Mesh(dotGeo, dotMat);
    d.position.set(p[0], p[1], p[2]);
    d.userData.floatSeed = i * 0.7;
    dots.add(d);
  });
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

    group.rotation.y = t * 0.20;
    group.rotation.x = Math.sin(t * 0.55) * 0.08;
    group.rotation.z = Math.cos(t * 0.45) * 0.06;

    logo.rotation.y += 0.012;
    logo.rotation.x += 0.008;

    dots.children.forEach((d) => {
      const s = d.userData.floatSeed || 0;
      d.position.y += Math.sin(t + s) * 0.0008;
    });

    camera.position.x = mx * 0.22;
    camera.position.y = 0.18 + (-my * 0.16);
    renderer.render(scene, camera);
  }
  animate();
}
