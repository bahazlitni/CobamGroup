"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JourneyCategory } from "./catalog-journey";

// --- Shaders ---
const VERTEX_SHADER_SRC = `
  attribute vec2 position;
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SRC = `
  precision mediump float;

  varying vec2 v_texCoord;

  uniform sampler2D u_textTexture;
  uniform sampler2D u_smokeTexture;

  uniform vec2 u_mouse;        // Mouse position in UV space (0 to 1)
  uniform vec2 u_velocity;     // Mouse velocity vector
  uniform float u_time;        // Time in seconds
  uniform float u_distortion;  // Overall distortion strength factor
  uniform float u_aspect;      // Aspect ratio of the canvas (width / height)

  void main() {
    vec2 uv = v_texCoord;
    
    // Adjust mouse vector for aspect ratio to make interaction circular
    vec2 aspectCoord = vec2(uv.x * u_aspect, uv.y);
    vec2 aspectMouse = vec2(u_mouse.x * u_aspect, u_mouse.y);
    
    vec2 toMouse = aspectCoord - aspectMouse;
    float dist = length(toMouse);
    
    // Interaction radius (e.g. 0.22)
    float radius = 0.22;
    vec2 uvOffset = vec2(0.0);
    
    if (dist < radius) {
      // Easing curve: quadratic ease-out towards mouse
      float t = dist / radius; // 0 at mouse, 1 at boundary
      float effect = (1.0 - t) * (1.0 - t);
      
      // 1. Pinching / Stretching (ripple-like displacement along the vector)
      float pinchStrength = -0.04 * u_distortion;
      vec2 pinch = normalize(toMouse) * pinchStrength * effect;
      
      // 2. Bending / Dragging based on mouse velocity
      float dragStrength = 0.25 * u_distortion;
      vec2 drag = u_velocity * dragStrength * effect;
      
      // 3. Rippling waves radiating outward from cursor
      float waveFreq = 26.0;
      float waveAmp = 0.015 * u_distortion;
      float waveSpeed = 8.0;
      float ripple = sin(dist * waveFreq - u_time * waveSpeed) * waveAmp * effect;
      vec2 rippleOffset = normalize(toMouse) * ripple;
      
      uvOffset = pinch + drag + rippleOffset;
    }
    
    // Apply RGB Chromatic Aberration (offsets are scaled per channel)
    // Shift is proportional to distortion offset
    float rShift = 1.0 + 0.16 * u_distortion;
    float gShift = 1.0;
    float bShift = 1.0 - 0.16 * u_distortion;
    
    vec4 textR = texture2D(u_textTexture, uv + uvOffset * rShift);
    vec4 textG = texture2D(u_textTexture, uv + uvOffset * gShift);
    vec4 textB = texture2D(u_textTexture, uv + uvOffset * bShift);
    
    // Combined alpha is the average, or max to prevent thin clipping edges
    float alpha = max(textR.a, max(textG.a, textB.a));
    vec4 textCol = vec4(textR.r, textG.g, textB.b, alpha);
    
    // Sample smoke trail
    vec4 smokeCol = texture2D(u_smokeTexture, uv);
    
    // Smoke Color: Cobam blue-ish cyan translucent mist (#0a8dc1)
    vec4 smokeColor = vec4(0.039, 0.553, 0.757, smokeCol.a * 0.42);
    
    // Blend layers (straight alpha blending)
    vec3 mixRGB = mix(smokeColor.rgb, textCol.rgb, textCol.a);
    float mixAlpha = max(smokeColor.a, textCol.a);
    
    gl_FragColor = vec4(mixRGB, mixAlpha);
  }
`;

// --- Particle Definition for Organic Smoke Trail ---
class SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  alpha: number;
  life: number;
  decay: number;
  angle: number;
  spin: number;

  constructor(x: number, y: number, vx: number, vy: number) {
    this.x = x;
    this.y = y;
    // Slow drift velocity plus a fraction of mouse velocity
    this.vx = vx * 0.15 + (Math.random() - 0.5) * 1.2;
    this.vy = vy * 0.15 + (Math.random() - 0.5) * 1.2;
    this.size = Math.random() * 15 + 15; // Starting size: 15-30px
    this.maxSize = this.size * (Math.random() * 2.5 + 2.5); // Grow to 2.5x - 5x
    this.alpha = Math.random() * 0.12 + 0.15; // Opacity 0.15 - 0.27
    this.life = 1.0;
    this.decay = Math.random() * 0.007 + 0.007; // Fade duration
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.015;
  }

  update(time: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Deceleration (air resistance)
    this.vx *= 0.985;
    this.vy *= 0.985;

    // Organic curling currents (sine wave force field)
    const noiseFreq = 0.006;
    const noiseAmp = 0.18;
    this.vx += Math.sin(this.y * noiseFreq + time * 1.2) * noiseAmp;
    this.vy += Math.cos(this.x * noiseFreq + time * 1.2) * noiseAmp;

    // Diffusion size growth
    this.size += (this.maxSize - this.size) * 0.035;

    // Spin
    this.angle += this.spin;

    // Age
    this.life -= this.decay;
  }
}

interface LiquidHeroProps {
  categories?: JourneyCategory[];
  headline?: string;
  subheading?: string;
  kicker?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  proofRow?: string[];
  rightElement?: React.ReactNode;
}

export function LiquidHero({
  categories = [],
  headline = "L'architecture des matières.",
  subheading = "Un parcours à travers les catégories COBAM Group : des matériaux de construction aux finitions qui signent l'espace final.",
  kicker = "Depuis 1994 / COBAM Group",
  primaryCtaText = "Commencer le parcours",
  primaryCtaHref = "#parcours",
  secondaryCtaText = "Explorer le catalogue",
  secondaryCtaHref = "/produits",
  proofRow,
  rightElement,
}: LiquidHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLHeadingElement | null>(null);
  const glCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [webglSupported, setWebglSupported] = useState(true);

  // Split headline text into words to wrap in spans for DOM coordinate queries
  const words = headline.split(" ");

  useEffect(() => {
    const container = containerRef.current;
    const glCanvas = glCanvasRef.current;
    const textElement = textRef.current;

    if (!container || !glCanvas || !textElement) return;

    // --- Create Offscreen Canvases ---
    const textCanvas = document.createElement("canvas");
    const smokeCanvas = document.createElement("canvas");

    const textCtx = textCanvas.getContext("2d");
    const smokeCtx = smokeCanvas.getContext("2d");

    if (!textCtx || !smokeCtx) {
      setWebglSupported(false);
      return;
    }

    // --- WebGL Context Setup ---
    const gl = glCanvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });

    if (!gl) {
      setWebglSupported(false);
      return;
    }

    // Shader Compiler Helper
    const compileShader = (src: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(VERTEX_SHADER_SRC, gl.VERTEX_SHADER);
    const fs = compileShader(FRAGMENT_SHADER_SRC, gl.FRAGMENT_SHADER);
    if (!vs || !fs) {
      setWebglSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setWebglSupported(false);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      setWebglSupported(false);
      return;
    }

    gl.useProgram(program);

    // Quad Geometry (two triangles covering full screen)
    const vertices = new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Uniform Locations
    const uMouseLoc = gl.getUniformLocation(program, "u_mouse");
    const uVelocityLoc = gl.getUniformLocation(program, "u_velocity");
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uDistortionLoc = gl.getUniformLocation(program, "u_distortion");
    const uAspectLoc = gl.getUniformLocation(program, "u_aspect");
    const uTextTextureLoc = gl.getUniformLocation(program, "u_textTexture");
    const uSmokeTextureLoc = gl.getUniformLocation(program, "u_smokeTexture");

    // Enable Blending for transparency layers
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // Set Texture Units
    gl.uniform1i(uTextTextureLoc, 0);
    gl.uniform1i(uSmokeTextureLoc, 1);

    // Create Textures
    const textTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const smokeTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, smokeTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // --- State and Interaction Variables ---
    let width = 0;
    let height = 0;
    let dpr = 1;

    const mouse = {
      targetX: 0.5,
      targetY: 0.5,
      currentX: 0.5,
      currentY: 0.5,
      prevX: 0.5,
      prevY: 0.5,
      vx: 0,
      vy: 0,
    };

    let distortionStrength = 0.0;
    let targetDistortionStrength = 0.0;
    let lastActivityTime = 0;
    let isMouseOver = false;
    let isFirstFrame = true;

    const particles: SmokeParticle[] = [];

    // --- Text Rendering onto Offscreen Canvas ---
    const drawTextToCanvas = () => {
      if (!textCtx) return;

      // Clear the canvas
      textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      textCtx.save();
      textCtx.scale(dpr, dpr);

      // Query spans in hidden HTML text to align positions perfectly
      const spans = textElement.querySelectorAll("span");
      const parentRect = container.getBoundingClientRect();

      spans.forEach((span) => {
        const spanRect = span.getBoundingClientRect();
        const x = spanRect.left - parentRect.left;
        const y = spanRect.top - parentRect.top;

        // Get computed style properties from the DOM elements
        const style = window.getComputedStyle(span);
        textCtx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        textCtx.fillStyle = "#ffffff";
        textCtx.textBaseline = "top";
        textCtx.fillText(span.textContent || "", x, y);
      });

      textCtx.restore();

      // Upload text texture (static until resized or fonts load)
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    };

    // --- Handle Canvas Resizing ---
    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;

      // GL Canvas
      glCanvas.width = width * dpr;
      glCanvas.height = height * dpr;
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);

      // Smoke Canvas (drawn at 0.75x to optimize performance while keeping it soft)
      smokeCanvas.width = width * dpr * 0.75;
      smokeCanvas.height = height * dpr * 0.75;

      // Text Canvas
      textCanvas.width = width * dpr;
      textCanvas.height = height * dpr;

      // Re-render text coordinates
      drawTextToCanvas();
    };

    resize();
    window.addEventListener("resize", resize);

    // Watch for custom fonts finished loading to redraw cleanly
    if (document.fonts) {
      document.fonts.ready.then(() => {
        drawTextToCanvas();
      });
    }

    // --- Interaction Listeners ---
    const updateMousePos = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const rawX = (clientX - rect.left) / rect.width;
      const rawY = 1.0 - (clientY - rect.top) / rect.height; // Invert for WebGL coordinates

      mouse.targetX = Math.max(0.0, Math.min(1.0, rawX));
      mouse.targetY = Math.max(0.0, Math.min(1.0, rawY));

      lastActivityTime = performance.now();
      isMouseOver = true;
    };

    const handlePointerMove = (e: PointerEvent) => {
      updateMousePos(e.clientX, e.clientY);
    };

    const handlePointerLeave = () => {
      isMouseOver = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0 && e.touches[0]) {
        updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && e.touches[0]) {
        updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });

    // --- Main Animation Loop ---
    let frameId = 0;
    const startTime = performance.now();

    const tick = () => {
      const time = (performance.now() - startTime) * 0.001; // running time in seconds
      const now = performance.now();

      // --- Ambient Attractor logic (for idle or mobile screens) ---
      const idleTime = now - lastActivityTime;
      const isIdle = idleTime > 2000;

      if (isIdle) {
        // Ambient Lissajous drift attractor path
        const speedX = 0.6;
        const speedY = 0.95;
        mouse.targetX = 0.5 + Math.sin(time * speedX) * 0.32;
        mouse.targetY = 0.5 + Math.cos(time * speedY) * 0.22;
        targetDistortionStrength = 0.38; // Gentle ripples
      } else {
        targetDistortionStrength = isMouseOver ? 1.0 : 0.0;
      }

      // Smooth mouse position updates
      const lerpFactor = isFirstFrame ? 1.0 : (isIdle ? 0.04 : 0.08);
      mouse.currentX += (mouse.targetX - mouse.currentX) * lerpFactor;
      mouse.currentY += (mouse.targetY - mouse.currentY) * lerpFactor;

      // Calculate smooth velocity
      if (isFirstFrame) {
        mouse.vx = 0;
        mouse.vy = 0;
      } else {
        mouse.vx = mouse.currentX - mouse.prevX;
        mouse.vy = mouse.currentY - mouse.prevY;
      }

      mouse.prevX = mouse.currentX;
      mouse.prevY = mouse.currentY;

      // Interpolate overall distortion magnitude
      distortionStrength += (targetDistortionStrength - distortionStrength) * 0.075;

      // --- Particle Spawn & Update (Smoke trail) ---
      const particleScaleX = smokeCanvas.width;
      const particleScaleY = smokeCanvas.height;
      const pX = mouse.currentX * particleScaleX;
      const pY = (1.0 - mouse.currentY) * particleScaleY; // Back to 2D coords

      // Velocity in pixels for particle direction
      const pixelVx = mouse.vx * particleScaleX;
      const pixelVy = -mouse.vy * particleScaleY;
      const speed = Math.hypot(pixelVx, pixelVy);

      // Spawn on movement
      const threshold = isIdle ? 0.2 : 1.5;
      if (speed > threshold && particles.length < 160) {
        // Spawn spacing density
        const count = isIdle ? 1 : Math.min(4, Math.floor(speed / 4) + 1);
        for (let i = 0; i < count; i++) {
          particles.push(new SmokeParticle(pX, pY, pixelVx, pixelVy));
        }
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p) {
          p.update(time);
          if (p.life <= 0) {
            particles.splice(i, 1);
          }
        }
      }

      // --- Draw Smoke to Offscreen Canvas ---
      smokeCtx.clearRect(0, 0, smokeCanvas.width, smokeCanvas.height);
      particles.forEach((p) => {
        smokeCtx.save();
        smokeCtx.globalAlpha = p.life * p.alpha;

        const grad = smokeCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        // Soft glowing mist blending from cyan/water blue into transparent
        grad.addColorStop(0.0, "rgba(143, 220, 255, 1.0)");
        grad.addColorStop(0.2, "rgba(10, 141, 193, 0.65)");
        grad.addColorStop(0.6, "rgba(10, 141, 193, 0.16)");
        grad.addColorStop(1.0, "rgba(10, 141, 193, 0.0)");

        smokeCtx.fillStyle = grad;
        smokeCtx.beginPath();
        smokeCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        smokeCtx.fill();
        smokeCtx.restore();
      });

      // Upload Smoke Texture
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, smokeTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, smokeCanvas);

      // --- Render WebGL Web --
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Update Uniforms
      gl.uniform2f(uMouseLoc, mouse.currentX, mouse.currentY);
      gl.uniform2f(uVelocityLoc, mouse.vx, mouse.vy);
      gl.uniform1f(uTimeLoc, time);
      gl.uniform1f(uDistortionLoc, distortionStrength);
      gl.uniform1f(uAspectLoc, width / height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      isFirstFrame = false;
      frameId = requestAnimationFrame(tick);
    };

    tick();

    // --- Cleanup ---
    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(frameId);

      // Delete GL resources
      gl.deleteBuffer(buffer);
      gl.deleteTexture(textTexture);
      gl.deleteTexture(smokeTexture);
      gl.deleteProgram(program);
    };
  }, [headline]);

  return (
    <section
      ref={containerRef}
      className="cobam-catalog-hero relative min-h-[calc(100svh-7rem)] overflow-hidden bg-[#14202e] text-white select-none"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,#1b324d_0%,#0c141d_100%)] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="cobam-static-grid absolute inset-0 opacity-16 pointer-events-none" />

      {/* Interactive WebGL Canvas */}
      {webglSupported && (
        <canvas
          ref={glCanvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none z-0"
        />
      )}

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-7rem)] max-w-[1500px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="cobam-section-kicker text-[#8fdcff] tracking-[0.28em]">
            {kicker}
          </p>

          {/* HTML Headline representation. Used for screen readers, responsive flow, layout parsing, and WebGL failback */}
          <h1
            ref={textRef}
            className={cn(
              "mt-6 max-w-5xl text-balance text-[clamp(4.2rem,8.5vw,7.6rem)] font-normal leading-[0.86] tracking-tight transition-opacity duration-500 select-none",
              webglSupported ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {words.map((word, idx) => (
              <span key={idx} className="inline-block whitespace-nowrap">
                {word}
                {idx < words.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </h1>

          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-white/72 md:text-xl pointer-events-auto">
            {subheading}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row pointer-events-auto">
            {primaryCtaText && (
              <Link href={primaryCtaHref} className="cobam-premium-button cobam-premium-button-light">
                {primaryCtaText}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            {secondaryCtaText && (
              <Link href={secondaryCtaHref} className="cobam-premium-button cobam-premium-button-ghost">
                {secondaryCtaText}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>

          {proofRow && (
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-white/50 tracking-wider">
              {proofRow.map((item, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  {idx > 0 && <span className="text-white/20">·</span>}
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right card sidebar containing custom element or categories menu */}
        <div className="hidden items-end justify-end lg:flex">
          {rightElement ? rightElement : (
            categories && categories.length > 0 && (
              <div
                className="cobam-motion-card w-full max-w-md border border-white/12 bg-white/[0.05] p-6 backdrop-blur-md pointer-events-auto"
                data-landing-reveal
                data-parallax-speed="0.04"
              >
                <p className="cobam-section-kicker text-[#8fdcff] tracking-[0.28em]">Catégories</p>
                <div className="mt-5 max-h-[26rem] divide-y divide-white/10 overflow-y-auto pr-1 scrollbar-hide">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={category.href}
                      className="group flex items-center justify-between gap-4 py-3 text-white/70 transition hover:text-white"
                    >
                      <span className="flex items-center gap-2">
                        {category.name}
                        {category.isPromoted ? (
                          <span className="rounded-full border border-[#8fdcff]/40 bg-[#8fdcff]/12 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#8fdcff]">
                            En promotion
                          </span>
                        ) : null}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 transition group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
