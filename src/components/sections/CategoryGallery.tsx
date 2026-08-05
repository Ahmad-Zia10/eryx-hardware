"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
  type OGLRenderingContext,
} from "ogl";
import ProductImage from "@/components/ui/ProductImage";
import type { FocusPanel } from "@/components/sections/CategoriesFocus";

/**
 * "Categories in focus" — the floating WebGL gallery.
 *
 * A horizontal, lightly-bent row of category cards you drag / scroll
 * through. Cards render GREYSCALE at rest and bloom to COLOUR on the
 * card under the cursor (per-card, driven in the fragment shader). Runs
 * on the light section surface, consistent with the rest of the page.
 *
 * Built on `ogl` (a small self-hosted WebGL wrapper — no CDN). The heavy
 * lifting is one shader that samples the texture, mixes greyscale↔colour
 * by a per-card `uColor` uniform, and rounds the corners with an SDF.
 *
 * Accessibility / resilience: when WebGL is unavailable OR the user
 * prefers reduced motion, we render a plain CSS horizontal-scroll strip
 * of the same cards (see `<FallbackStrip>`), so the section is never
 * blank and stays keyboard-navigable. The captions (name / count / from
 * price) are real HTML overlaid on the canvas so text stays crisp and
 * the links remain clickable.
 */

// ─── Tunables ────────────────────────────────────────────────────────
// Horizontal row with a gentle arc. BEND controls the curve depth (a
// little more than the first pass), SCROLL_SPEED the drag/wheel pace
// (eased down), and CARD_SCALE the on-screen card size (bumped up).
const BEND = 1.2;
const BORDER_RADIUS = 0.06;
const SCROLL_EASE = 0.055;
const SCROLL_SPEED = 1.15;
// Base card dimensions in "design px" (scaled to the viewport in
// onResize). Larger = bigger cards; the width/height ratio stays ~0.8.
// A modest step up from the original 680×840.
const CARD_W = 840;
const CARD_H = 1035;

type CardData = FocusPanel;

export default function CategoryGallery({ panels }: { panels: CardData[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // null = not yet decided; true = WebGL path; false = CSS fallback.
  const [webgl, setWebgl] = useState<boolean | null>(null);
  // The card whose caption/link is currently focused (center-most or
  // hovered), so the HTML overlay can position + link correctly.
  const [active, setActive] = useState(0);
  const appRef = useRef<GalleryApp | null>(null);

  useEffect(() => {
    if (!containerRef.current || panels.length === 0) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Probe WebGL availability up front.
    let hasWebGL = false;
    try {
      const test = document.createElement("canvas");
      hasWebGL = !!(
        test.getContext("webgl") || test.getContext("experimental-webgl")
      );
    } catch {
      hasWebGL = false;
    }

    if (prefersReduced || !hasWebGL) {
      setWebgl(false);
      return;
    }

    setWebgl(true);
    const app = new GalleryApp(containerRef.current, panels, (i) =>
      setActive(i)
    );
    appRef.current = app;
    return () => {
      app.destroy();
      appRef.current = null;
    };
  }, [panels]);

  if (panels.length === 0) return null;

  // CSS fallback (also the SSR / first-paint markup until the effect
  // decides). Rendered whenever webgl === false.
  if (webgl === false) {
    return <FallbackStrip panels={panels} />;
  }

  const activePanel = panels[active] ?? panels[0];

  return (
    <div className="flex flex-col">
      {/* WebGL canvas — its own fixed height. The caption lives in a
          separate band BELOW so text never overlaps a card. A soft
          horizontal mask fades cards out at both edges instead of hard-
          clipping them at the section boundary. */}
      <div
        ref={containerRef}
        className="relative h-[52vh] min-h-[400px] max-h-[580px] w-full cursor-grab active:cursor-grabbing select-none touch-pan-y [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]"
        aria-hidden="true"
      />

      {/* Reserved caption band — fixed min-height so the arc above never
          shifts as labels of different lengths swap in. Centered. */}
      <div className="mt-6 flex min-h-[132px] flex-col items-center px-4 text-center">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink">
          {activePanel.label}
        </div>
        <div className="mt-1.5 text-sm text-ink-muted">
          {typeof activePanel.count === "number" && (
            <>
              {activePanel.count}{" "}
              {activePanel.count === 1 ? "product" : "products"}
              {activePanel.fromPrice ? (
                <>
                  {" · from "}
                  <span className="text-gold-deep font-semibold">
                    {activePanel.fromPrice}
                  </span>
                </>
              ) : null}
            </>
          )}
        </div>
        <Link
          href={activePanel.href}
          className="mt-4 inline-flex items-center gap-2 bg-gold hover:bg-gold-bright text-on-gold text-sm font-bold px-6 py-3 transition-colors duration-200"
        >
          Explore {activePanel.label}
        </Link>
      </div>

      {/* Keyboard-accessible category links, visually hidden but present
          for a11y / SEO (the canvas itself is aria-hidden). */}
      <ul className="sr-only">
        {panels.map((p) => (
          <li key={p.href}>
            <Link href={p.href}>{p.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── CSS fallback: horizontal scroll strip ───────────────────────────
// Greyscale → colour on hover (pure CSS), horizontal scroll. Shown when
// WebGL is unavailable or reduced-motion is preferred.
function FallbackStrip({ panels }: { panels: CardData[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-12 py-4">
      {panels.map((panel, i) => (
        <Link
          key={panel.href}
          href={panel.href}
          className="group relative shrink-0 w-[260px] sm:w-[300px] h-[400px] sm:h-[440px] overflow-hidden rounded-card bg-surface-sunken"
        >
          <ProductImage
            src={panel.image}
            alt={panel.label}
            grayscale
            className="absolute inset-0 h-full w-full transition-[filter,transform] duration-500 ease-out group-hover:[filter:grayscale(0)] group-hover:scale-[1.04]"
          />
          <span className="absolute top-3.5 left-3.5 text-xs font-extrabold text-white drop-shadow">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 px-4 pb-4">
            <div className="text-lg sm:text-xl font-extrabold tracking-[-0.01em] text-white">
              {panel.label}
            </div>
            {typeof panel.count === "number" && (
              <div className="text-xs text-white/70 mt-1">
                {panel.count} {panel.count === 1 ? "product" : "products"}
                {panel.fromPrice ? ` · from ${panel.fromPrice}` : ""}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
//  WebGL implementation (ogl)
// ─────────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const VERT = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Samples the texture with "cover" fit, mixes greyscale↔colour by
// uColor (0 = grey, 1 = full colour), and rounds the corners via an SDF.
const FRAG = /* glsl */ `
  precision highp float;
  uniform vec2 uImageSizes;
  uniform vec2 uPlaneSizes;
  uniform sampler2D tMap;
  uniform float uColor;
  uniform float uBorderRadius;
  varying vec2 vUv;

  float roundedBoxSDF(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b;
    return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
  }

  void main() {
    vec2 ratio = vec2(
      min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
      min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
    );
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    vec4 color = texture2D(tMap, uv);
    float g = dot(color.rgb, vec3(0.299, 0.587, 0.114)) * 1.03;
    vec3 mixed = mix(vec3(g), color.rgb, clamp(uColor, 0.0, 1.0));

    float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
    float alpha = 1.0 - smoothstep(-0.002, 0.002, d);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(mixed, alpha);
  }
`;

class GalleryMedia {
  gl: OGLRenderingContext;
  plane: Mesh;
  program: Program;
  index: number;
  length: number;
  screen: { width: number; height: number };
  viewport: { width: number; height: number };
  extra = 0;
  width = 0;
  widthTotal = 0;
  x = 0;
  scale = 1;
  padding = 1.4;
  colorTarget = 0; // 1 when hovered
  colorCurrent = 0;
  hoverTarget = 0; // 1 when hovered → eased into a subtle scale-up
  hoverCurrent = 0;
  baseScaleX = 1; // resting plane scale (hover multiplies this)
  baseScaleY = 1;
  cardW = CARD_W; // live-tunable card size (design px)
  cardH = CARD_H;

  constructor(opts: {
    gl: OGLRenderingContext;
    geometry: Plane;
    scene: Transform;
    image: string;
    index: number;
    length: number;
    screen: { width: number; height: number };
    viewport: { width: number; height: number };
  }) {
    this.gl = opts.gl;
    this.index = opts.index;
    this.length = opts.length;
    this.screen = opts.screen;
    this.viewport = opts.viewport;

    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      transparent: true,
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [1, 1] },
        uColor: { value: 0 },
        uBorderRadius: { value: BORDER_RADIUS },
      },
    });

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = opts.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [
        img.naturalWidth,
        img.naturalHeight,
      ];
    };

    this.plane = new Mesh(this.gl, { geometry: opts.geometry, program: this.program });
    this.plane.setParent(opts.scene);
    this.onResize();
  }

  update(scroll: number, direction: "left" | "right") {
    this.plane.position.x = this.x - scroll - this.extra;

    // Gentle arc: cards tilt as they move off-centre (rotation carries
    // the "bend" feel), with the vertical drop DAMPENED so cards stay
    // roughly centred in the canvas rather than bowing to the bottom.
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;
    const B = Math.abs(BEND);
    const R = (H * H + B * B) / (2 * B);
    const effX = Math.min(Math.abs(x), H);
    const arc = R - Math.sqrt(Math.max(0, R * R - effX * effX));
    this.plane.position.y = -arc * 0.55;
    this.plane.rotation.z = -Math.sign(x) * Math.asin(Math.min(1, effX / R));

    // Ease the per-card colour toward its target (hovered = 1).
    this.colorCurrent = lerp(this.colorCurrent, this.colorTarget, 0.12);
    this.program.uniforms.uColor.value = this.colorCurrent;

    // Ease a subtle scale-up on the hovered card (lifts it toward the
    // viewer — the "pop" cue that pairs with the colour reveal).
    this.hoverCurrent = lerp(this.hoverCurrent, this.hoverTarget, 0.14);
    const hoverScale = 1 + this.hoverCurrent * 0.07;
    this.plane.scale.x = this.baseScaleX * hoverScale;
    this.plane.scale.y = this.baseScaleY * hoverScale;
    this.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];

    // Infinite wrap.
    const half = this.plane.scale.x / 2;
    const vpHalf = this.viewport.width / 2;
    const isBefore = this.plane.position.x + half < -vpHalf;
    const isAfter = this.plane.position.x - half > vpHalf;
    if (direction === "right" && isBefore) this.extra -= this.widthTotal;
    if (direction === "left" && isAfter) this.extra += this.widthTotal;
  }

  onResize(sizes?: {
    screen: { width: number; height: number };
    viewport: { width: number; height: number };
  }) {
    if (sizes) {
      this.screen = sizes.screen;
      this.viewport = sizes.viewport;
    }
    this.scale = this.screen.height / 1500;
    // Base (resting) scale. Card size comes from the app's live cardW/H
    // (defaults to the CARD_W/CARD_H constants) so it can be tuned at
    // runtime without a rebuild.
    this.baseScaleY =
      (this.viewport.height * (this.cardH * this.scale)) / this.screen.height;
    this.baseScaleX =
      (this.viewport.width * (this.cardW * this.scale)) / this.screen.width;
    this.plane.scale.x = this.baseScaleX;
    this.plane.scale.y = this.baseScaleY;
    this.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];
    this.width = this.baseScaleX + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class GalleryApp {
  container: HTMLElement;
  renderer: Renderer;
  gl: OGLRenderingContext;
  camera: Camera;
  scene: Transform;
  geometry!: Plane;
  medias: GalleryMedia[] = [];
  panels: CardData[];
  onActive: (i: number) => void;

  scroll = { current: 0, target: 0, last: 0, ease: SCROLL_EASE };
  isDown = false;
  startX = 0;
  startScroll = 0;
  raf = 0;
  screen = { width: 0, height: 0 };
  viewport = { width: 0, height: 0 };
  hovered = -1;
  lastActive = -1;
  resizeObserver: ResizeObserver | null = null;
  cardW = CARD_W;
  cardH = CARD_H;

  // Bound handlers (so add/removeEventListener match).
  bOnResize = () => this.onResize();
  bOnWheel = (e: Event) => this.onWheel(e as WheelEvent);
  bOnDown = (e: Event) => this.onDown(e as PointerEvent);
  bOnMove = (e: Event) => this.onMove(e as PointerEvent);
  bOnUp = () => this.onUp();

  constructor(
    container: HTMLElement,
    panels: CardData[],
    onActive: (i: number) => void
  ) {
    this.container = container;
    this.panels = panels;
    this.onActive = onActive;

    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    container.appendChild(this.gl.canvas);

    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
    this.scene = new Transform();

    this.onResize();
    this.geometry = new Plane(this.gl, { heightSegments: 1, widthSegments: 20 });
    this.createMedias();

    this.addEvents();
    this.update();
  }

  createMedias() {
    // Duplicate the panel list so the loop is seamless even with few
    // categories.
    const doubled = [...this.panels, ...this.panels];
    this.medias = doubled.map(
      (panel, index) =>
        new GalleryMedia({
          gl: this.gl,
          geometry: this.geometry,
          scene: this.scene,
          image: panel.image,
          index,
          length: doubled.length,
          screen: this.screen,
          viewport: this.viewport,
        })
    );
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    // Guard: if the container has no width yet (mounted while hidden or
    // below the fold), skip — the ResizeObserver re-fires this once the
    // element gets real dimensions, so we don't init at a 0-width canvas.
    if (this.screen.width === 0 || this.screen.height === 0) return;
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    this.medias.forEach((m) =>
      m.onResize({ screen: this.screen, viewport: this.viewport })
    );
  }

  onWheel(e: WheelEvent) {
    const delta = e.deltaY || (e as unknown as { wheelDelta: number }).wheelDelta || 0;
    this.scroll.target += (delta > 0 ? 1 : -1) * SCROLL_SPEED;
    e.preventDefault();
  }

  onDown(e: PointerEvent) {
    this.isDown = true;
    this.startX = e.clientX;
    this.startScroll = this.scroll.target;
  }

  onMove(e: PointerEvent) {
    const rect = this.gl.canvas.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    if (this.isDown) {
      const distance = (this.startX - e.clientX) * (SCROLL_SPEED * 0.02);
      this.scroll.target = this.startScroll + distance;
    }
    // Map the pointer into viewport units around the plane origin. Y is
    // flipped (screen y grows down, world y grows up).
    const vpX = (relX / rect.width - 0.5) * this.viewport.width;
    const vpY = -(relY / rect.height - 0.5) * this.viewport.height;
    // 2D hit-test: the pointer must fall inside a card's actual x/y box
    // (cards dip on the arc, so a y-check is required — an x-only test
    // let some cards, e.g. the taller shutter/glass shots, never win).
    // Use the RESTING scale so a card doesn't grow itself out from under
    // the cursor. Tie-break by nearest centre.
    let best = -1;
    let bestDist = Infinity;
    this.medias.forEach((m, i) => {
      const dx = Math.abs(m.plane.position.x - vpX);
      const dy = Math.abs(m.plane.position.y - vpY);
      if (
        dx < m.baseScaleX / 2 &&
        dy < m.baseScaleY / 2 &&
        dx < bestDist
      ) {
        bestDist = dx;
        best = i;
      }
    });
    this.hovered = best;
    this.container.style.cursor = this.isDown
      ? "grabbing"
      : best >= 0
        ? "pointer"
        : "grab";
  }

  onUp() {
    this.isDown = false;
  }

  update() {
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";

    // The list is doubled for the seamless loop, so colour/scale BOTH
    // copies of the hovered category (compare by original panel index),
    // not just the single matched media — otherwise the on-screen copy
    // can stay grey while its off-screen twin is the one that matched.
    const hoveredOrig =
      this.hovered >= 0 ? this.hovered % this.panels.length : -1;
    this.medias.forEach((m, i) => {
      const isHovered = i % this.panels.length === hoveredOrig;
      m.colorTarget = isHovered ? 1 : 0;
      m.hoverTarget = isHovered ? 1 : 0;
      m.update(this.scroll.current, direction);
    });

    // Report the center-most card so the HTML caption tracks it. Map
    // back to the ORIGINAL panel index (medias are doubled).
    let center = 0;
    let centerDist = Infinity;
    this.medias.forEach((m, i) => {
      const d = Math.abs(m.plane.position.x);
      if (d < centerDist) {
        centerDist = d;
        center = i;
      }
    });
    const orig = center % this.panels.length;
    if (orig !== this.lastActive) {
      this.lastActive = orig;
      this.onActive(orig);
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = requestAnimationFrame(() => this.update());
  }

  addEvents() {
    window.addEventListener("resize", this.bOnResize);
    this.container.addEventListener("wheel", this.bOnWheel, { passive: false });
    this.container.addEventListener("pointerdown", this.bOnDown);
    window.addEventListener("pointermove", this.bOnMove);
    window.addEventListener("pointerup", this.bOnUp);
    // Re-size to the container itself, not just the window. Handles the
    // element getting its first non-zero width (mounted below the fold /
    // while hidden) and any layout-driven width changes.
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.onResize());
      this.resizeObserver.observe(this.container);
    }
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.bOnResize);
    this.container.removeEventListener("wheel", this.bOnWheel);
    this.container.removeEventListener("pointerdown", this.bOnDown);
    window.removeEventListener("pointermove", this.bOnMove);
    window.removeEventListener("pointerup", this.bOnUp);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    const canvas = this.gl.canvas;
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    const ext = this.gl.getExtension("WEBGL_lose_context");
    if (ext) ext.loseContext();
  }
}
