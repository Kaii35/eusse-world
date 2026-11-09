// @ts-nocheck
import * as THREE from 'three';

const HUBS = [
  { id: 'BOG', lat: 4.71, lng: -74.07 },
  { id: 'SJO', lat: 9.93, lng: -84.08 },
  { id: 'MGA', lat: 12.13, lng: -86.25 },
  { id: 'MIA', lat: 25.76, lng: -80.19 },
];
const ROUTES = [[0, 3], [1, 3], [2, 3], [0, 1], [1, 2], [0, 2]];
const LAND_MASK = 'https://unpkg.com/three-globe@2.31.1/example/img/earth-water.png';

function ll(lat, lng, r = 1) {
  const phi = (90 - lat) * Math.PI / 180, th = (lng + 180) * Math.PI / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
}

function loadMask() {
  return new Promise((res) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = 720; c.height = 360;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, 720, 360);
      try { res(ctx.getImageData(0, 0, 720, 360).data); } catch { res(null); }
    };
    img.onerror = () => res(null);
    img.src = LAND_MASK;
  });
}

export function createGlobe(el, opts = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.style.cssText = 'width:100%;height:100%;display:block;opacity:0;transition:opacity 1.6s ease';
  el.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 5.6);

  const tilt = new THREE.Group();
  const spin = new THREE.Group();
  tilt.add(spin); scene.add(tilt);
  const baseX = 0.24, baseY = -0.16;
  tilt.rotation.x = baseX;

  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };

  const core = new THREE.Mesh(track(new THREE.SphereGeometry(0.995, 64, 64)), track(new THREE.MeshBasicMaterial({ color: 0x1a2a3a })));
  spin.add(core);

  const glow = new THREE.Mesh(
    track(new THREE.SphereGeometry(1, 64, 64)),
    track(new THREE.ShaderMaterial({
      vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vN; void main(){ float i = pow(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(0.58,0.74,0.89,1.0) * i; }',
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    }))
  );
  glow.scale.setScalar(1.18);
  scene.add(glow);

  const gratMat = track(new THREE.LineBasicMaterial({ color: 0x5980a6, transparent: true, opacity: 0.22 }));
  for (let lat = -80; lat <= 80; lat += 20) {
    const pts = [];
    for (let lng = -180; lng <= 180; lng += 4) pts.push(ll(lat, lng, 1.001));
    spin.add(new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(pts)), gratMat));
  }
  for (let lng = -180; lng < 180; lng += 20) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 4) pts.push(ll(lat, lng, 1.001));
    spin.add(new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(pts)), gratMat));
  }

  const dotMat = track(new THREE.PointsMaterial({ color: 0x94bce3, size: 0.0115, sizeAttenuation: true, transparent: true, opacity: 0.95 }));
  loadMask().then((mask) => {
    if (disposed) return;
    const N = mask ? 16000 : 5000, golden = Math.PI * (3 - Math.sqrt(5)), pos = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = golden * i;
      const v = new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r);
      const lat = Math.asin(v.y) * 180 / Math.PI;
      let lng = Math.atan2(v.z, -v.x) * 180 / Math.PI - 180;
      if (lng < -180) lng += 360;
      if (mask) {
        const px = Math.min(719, Math.floor(((lng + 180) / 360) * 720));
        const py = Math.min(359, Math.floor(((90 - lat) / 180) * 360));
        if (mask[(py * 720 + px) * 4] > 110) continue;
      } else if (i % 3) continue;
      v.multiplyScalar(1.003);
      pos.push(v.x, v.y, v.z);
    }
    const g = track(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    spin.add(new THREE.Points(g, dotMat));
  });

  const hubMat = track(new THREE.MeshBasicMaterial({ color: 0xeef6ff }));
  const ringMat = track(new THREE.MeshBasicMaterial({ color: 0xb5d9fd, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  const hubGeo = track(new THREE.SphereGeometry(0.014, 16, 16));
  const ringGeo = track(new THREE.RingGeometry(0.022, 0.028, 48));
  const rings = HUBS.map((h, i) => {
    const p = ll(h.lat, h.lng, 1.004);
    const dot = new THREE.Mesh(hubGeo, hubMat); dot.position.copy(p); spin.add(dot);
    const ring = new THREE.Mesh(ringGeo, ringMat.clone()); disposables.push(ring.material);
    ring.position.copy(p); ring.lookAt(p.clone().multiplyScalar(2)); spin.add(ring);
    return { ring, phase: i * 0.6 };
  });

  const arcMat = track(new THREE.LineBasicMaterial({ color: 0x94bce3, transparent: true, opacity: 0.45 }));
  const pulseMat = track(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 }));
  const headGeo = track(new THREE.SphereGeometry(0.009, 12, 12));
  const SEG = 90, TAIL = 16;
  const arcs = ROUTES.map(([a, b], i) => {
    const A = ll(HUBS[a].lat, HUBS[a].lng), B = ll(HUBS[b].lat, HUBS[b].lng);
    const d = A.distanceTo(B);
    const M = A.clone().add(B).multiplyScalar(0.5).normalize().multiplyScalar(1 + d * 0.75);
    const curve = new THREE.QuadraticBezierCurve3(A, M, B);
    const geo = track(new THREE.BufferGeometry().setFromPoints(curve.getPoints(SEG)));
    spin.add(new THREE.Line(geo, arcMat));
    const pulse = new THREE.Line(track(geo.clone()), pulseMat); spin.add(pulse);
    const head = new THREE.Mesh(headGeo, hubMat); spin.add(head);
    return { curve, pulse, head, speed: 0.16 + (i % 3) * 0.05, offset: i * 0.37, dir: i % 2 ? -1 : 1 };
  });

  const orbit = new THREE.Group();
  orbit.rotation.set(1.15, 0.2, -0.35);
  scene.add(orbit);
  const orbitPts = [];
  for (let i = 0; i <= 160; i++) { const t = i / 160 * Math.PI * 2; orbitPts.push(new THREE.Vector3(Math.cos(t) * 1.42, Math.sin(t) * 1.42, 0)); }
  orbit.add(new THREE.LineLoop(track(new THREE.BufferGeometry().setFromPoints(orbitPts)), track(new THREE.LineDashedMaterial({ color: 0x5980a6, dashSize: 0.03, gapSize: 0.03, transparent: true, opacity: 0.55 }))));
  orbit.children[0].computeLineDistances();
  const sats = [0, 2.1, 4.2].map((o) => { const m = new THREE.Mesh(headGeo, hubMat); m.scale.setScalar(1.3); orbit.add(m); return o; });

  let w = 0, h = 0;
  const resize = () => {
    const r = el.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(el); resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); });
  io.observe(el);

  let px = 0, py = 0, scroll = 0, raf = 0, disposed = false, shown = false;
  const clock = new THREE.Clock();
  function loop() {
    raf = 0;
    if (disposed || !visible) return;
    const t = clock.getElapsedTime();
    spin.rotation.y = baseY + Math.sin(t * 0.12) * 0.22 + px * 0.28 + scroll * 0.9;
    tilt.rotation.x = baseX + py * 0.12 - scroll * 0.15;
    rings.forEach(({ ring, phase }) => {
      const k = ((t * 0.7 + phase) % 1.6) / 1.6;
      ring.scale.setScalar(0.6 + k * 1.3);
      ring.material.opacity = 0.9 * (1 - k);
    });
    arcs.forEach((a) => {
      let k = (t * a.speed + a.offset) % 1;
      if (a.dir < 0) k = 1 - k;
      const s = Math.floor(k * (SEG - TAIL));
      a.pulse.geometry.setDrawRange(s, TAIL);
      a.head.position.copy(a.curve.getPoint(a.dir > 0 ? Math.min(1, (s + TAIL) / SEG) : s / SEG));
    });
    sats.forEach((o, i) => { const m = orbit.children[i + 1]; const a = t * 0.25 + o; m.position.set(Math.cos(a) * 1.42, Math.sin(a) * 1.42, 0); });
    renderer.render(scene, camera);
    if (!shown) { shown = true; canvas.style.opacity = '1'; }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  return {
    setPointer(x, y) { px = x; py = y; },
    setScroll(s) { scroll = s; },
    dispose() {
      disposed = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose(); canvas.remove();
    },
  };
}
