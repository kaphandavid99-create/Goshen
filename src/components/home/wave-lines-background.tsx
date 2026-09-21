"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import type { BufferAttribute } from "three";
import { useHasMounted } from "@/hooks/use-has-mounted";

// Matches --accent in dark mode (src/app/globals.css) — the site's real
// dark-theme orange, not an arbitrary decorative color.
const LINE_COLOR = 0xf0902f;
// Target horizontal gap between strands, so they read as isolated ribbons
// rather than a dense thicket — actual count adapts to viewport width.
const STRAND_SPACING = 180;
const MIN_STRANDS = 4;
const MAX_STRANDS = 12;
const SEGMENTS = 48;
// Two layers per strand — a soft wide halo behind a slimmer bright core —
// built as real-width ribbon meshes rather than 1px GL lines, since most
// browsers ignore WebGL line-width and a hairline barely reads on screen.
const RIBBON_LAYERS: { halfWidth: number; opacity: number }[] = [
  { halfWidth: 5, opacity: 0.16 },
  { halfWidth: 1.6, opacity: 0.55 },
];

interface RibbonLayer {
  halfWidth: number;
  positionAttribute: BufferAttribute;
  array: Float32Array;
}

interface Strand {
  baseX: number;
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  layers: RibbonLayer[];
}

function buildStripIndices(segments: number): number[] {
  const indices: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, b, c, b, d, c);
  }
  return indices;
}

export function WaveLinesBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const mounted = useHasMounted();

  useEffect(() => {
    if (!mounted || theme !== "dark" || !isHome) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    import("three").then((THREE) => {
      if (cancelled || !container) return;

      let width = container.clientWidth;
      let height = container.clientHeight;
      let halfW = width / 2;
      let halfH = height / 2;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 1, 1000);
      camera.position.z = 100;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const stripIndices = buildStripIndices(SEGMENTS);
      let strands: Strand[] = [];

      function buildStrands() {
        // Clear any previous strands (on resize/rebuild).
        for (const child of [...group.children] as InstanceType<typeof THREE.Mesh>[]) {
          group.remove(child);
          child.geometry.dispose();
          (child.material as InstanceType<typeof THREE.MeshBasicMaterial>).dispose();
        }

        const count = Math.min(
          MAX_STRANDS,
          Math.max(MIN_STRANDS, Math.round(width / STRAND_SPACING)),
        );
        const usableWidth = width * 0.86; // keep strands off the very edges
        const step = count > 1 ? usableWidth / (count - 1) : 0;
        const startX = -usableWidth / 2;

        strands = [];
        for (let s = 0; s < count; s++) {
          const baseX = count > 1 ? startX + step * s : 0;
          const strand: Strand = {
            baseX,
            amplitude: 14 + Math.random() * 16,
            frequency: 0.006 + Math.random() * 0.006,
            speed: 0.5 + Math.random() * 0.7,
            phase: Math.random() * Math.PI * 2,
            layers: [],
          };

          for (const layer of RIBBON_LAYERS) {
            const vertexCount = (SEGMENTS + 1) * 2;
            const positions = new Float32Array(vertexCount * 3);
            const geometry = new THREE.BufferGeometry();
            const positionAttribute = new THREE.BufferAttribute(positions, 3);
            geometry.setAttribute("position", positionAttribute);
            geometry.setIndex(stripIndices);
            const material = new THREE.MeshBasicMaterial({
              color: new THREE.Color(LINE_COLOR),
              transparent: true,
              opacity: layer.opacity,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
              side: THREE.DoubleSide,
            });
            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
            strand.layers.push({ halfWidth: layer.halfWidth, positionAttribute, array: positions });
          }
          strands.push(strand);
        }
      }

      buildStrands();

      let time = 0;
      const clock = new THREE.Clock();
      let frameId = 0;

      function animate() {
        const delta = Math.min(clock.getDelta(), 0.05);
        time += delta;

        for (const strand of strands) {
          for (const layer of strand.layers) {
            const { array, halfWidth } = layer;
            for (let i = 0; i <= SEGMENTS; i++) {
              const t = i / SEGMENTS;
              const y = -halfH + t * height;
              const wave =
                strand.amplitude *
                Math.sin(y * strand.frequency + time * strand.speed + strand.phase);
              const centerX = strand.baseX + wave;
              const vi = i * 2 * 3;
              // Left edge, then right edge of the ribbon at this sample.
              array[vi] = centerX - halfWidth;
              array[vi + 1] = y;
              array[vi + 2] = 0;
              array[vi + 3] = centerX + halfWidth;
              array[vi + 4] = y;
              array[vi + 5] = 0;
            }
            layer.positionAttribute.needsUpdate = true;
          }
        }

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      }
      animate();

      function handleResize() {
        if (!container) return;
        width = container.clientWidth;
        height = container.clientHeight;
        halfW = width / 2;
        halfH = height / 2;
        camera.left = -halfW;
        camera.right = halfW;
        camera.top = halfH;
        camera.bottom = -halfH;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        buildStrands();
      }
      window.addEventListener("resize", handleResize);

      cleanup = () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", handleResize);
        for (const child of [...group.children] as InstanceType<typeof THREE.Mesh>[]) {
          child.geometry.dispose();
          (child.material as InstanceType<typeof THREE.MeshBasicMaterial>).dispose();
        }
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [mounted, theme, isHome]);

  if (!mounted || theme !== "dark" || !isHome) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    />
  );
}
