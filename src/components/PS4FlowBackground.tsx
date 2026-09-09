import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface RibbonParticle {
  ribbonId: number; // 0: Royal Blue Arch, 1: Radiant Cyan/Turquoise S-Wave, 2: Full-Width Lower Blue Ribbon
  colorType: number; // 0: Crisp White, 1: Radiant Cyan, 2: Azure Blue
  u: number;
  speedU: number;
  offsetDist: number;
  offsetDrape: number;
  size: number;
  baseAlpha: number;
  pulseSpeed: number;
  phase: number;
  currentX: number;
  currentY: number;
}

interface VeilConfig {
  colorFn: (u: number, v: number, alpha: number) => string;
  numStrands?: number;
  bodyOpacity?: number;
  strandOpacity?: number;
  isReflection?: boolean;
}

export default function PS4FlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rawCtx = canvas.getContext('2d');
    if (!rawCtx) return;
    const ctx: CanvasRenderingContext2D = rawCtx;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let time = 0;

    // Mouse coordinates tracking with smooth fluid interpolation
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;

    const handlePointerMove = (e: PointerEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handlePointerLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    // 340 subtle, fine dust specks (poussières) - NO large light balls, calm, small & ethereal
    const numParticles = 340;
    const particles: RibbonParticle[] = [];

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        const rChoice = Math.random();
        let ribbonId = 1;
        let colorType = 0;

        if (rChoice < 0.58) {
          ribbonId = 1; // Cyan S-Wave
          colorType = Math.random() < 0.45 ? 0 : (Math.random() < 0.8 ? 1 : 2);
        } else if (rChoice < 0.84) {
          ribbonId = 0; // Royal Blue Arch
          colorType = Math.random() < 0.5 ? 2 : (Math.random() < 0.8 ? 0 : 1);
        } else {
          ribbonId = 2; // Full-width Lower Blue Ribbon
          colorType = Math.random() < 0.6 ? 2 : 0;
        }

        particles.push({
          ribbonId,
          colorType,
          u: 0.03 + Math.random() * 0.94,
          // Very calm, gentle drift ("moins mobile")
          speedU: (Math.random() * 0.00010 + 0.00004) * (Math.random() < 0.5 ? 1 : -1),
          offsetDist: (Math.random() - 0.5) * 36,
          offsetDrape: Math.random() * 0.45,
          // Fine subtle dust specks ("plus petites / subtils") - 0.7px to 1.8px
          size: Math.random() < 0.70 ? Math.random() * 0.5 + 0.7 : Math.random() * 0.6 + 1.2,
          baseAlpha: Math.random() * 0.35 + 0.55,
          pulseSpeed: Math.random() * 1.5 + 0.8,
          phase: Math.random() * Math.PI * 2,
          currentX: 0,
          currentY: 0,
        });
      }
    }

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

      if (particles.length === 0) {
        initParticles();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Fast Catmull-Rom to Cubic Bézier spline sampling
    function getPointOnCubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
      const mt = 1 - t;
      const mt2 = mt * mt;
      const mt3 = mt2 * mt;
      const t2 = t * t;
      const t3 = t2 * t;
      return {
        x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
        y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
      };
    }

    function sampleSpline(points: Point[], numSamples: number): Point[] {
      const result: Point[] = [];
      const n = points.length - 1;
      for (let i = 0; i <= numSamples; i++) {
        const totalT = i / numSamples;
        const segment = Math.min(Math.floor(totalT * n), n - 1);
        const t = totalT * n - segment;

        const p0 = points[Math.max(0, segment - 1)];
        const p1 = points[segment];
        const p2 = points[segment + 1];
        const p3 = points[Math.min(points.length - 1, segment + 2)];

        const c1: Point = {
          x: p1.x + (p2.x - p0.x) / 6,
          y: p1.y + (p2.y - p0.y) / 6,
        };
        const c2: Point = {
          x: p2.x - (p3.x - p1.x) / 6,
          y: p2.y - (p3.y - p1.y) / 6,
        };

        result.push(getPointOnCubic(p1, c1, c2, p2, t));
      }
      return result;
    }

    // High-performance batched sheer linen veil renderer (ultra-fluid 60 FPS, zero lag)
    function renderLinenWaveBatched(crest: Point[], drape: Point[], config: VeilConfig) {
      const {
        colorFn,
        numStrands = 22,
        bodyOpacity = 0.65,
        strandOpacity = 0.16,
        isReflection = false,
      } = config;

      const numPts = crest.length;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // 1. Two sheer gradient body passes with smooth tapering to 0 at ends
      for (let layer = 0; layer < 2; layer++) {
        const vStart = layer * 0.32;
        const vEnd = Math.min(1.0, (layer + 1) * 0.52);
        const layerAlpha =
          (isReflection ? 0.65 : 1.0) * bodyOpacity * (1 - vStart * 0.55) * 0.48;

        ctx.beginPath();
        for (let i = 0; i < numPts; i++) {
          const u = i / (numPts - 1);
          const taper = Math.sin(u * Math.PI);
          const p0 = crest[i];
          const p1 = drape[i];
          const x = p0.x + (p1.x - p0.x) * vStart * taper;
          const y = p0.y + (p1.y - p0.y) * vStart * taper;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = numPts - 1; i >= 0; i--) {
          const u = i / (numPts - 1);
          const taper = Math.sin(u * Math.PI);
          const p0 = crest[i];
          const p1 = drape[i];
          const x = p0.x + (p1.x - p0.x) * vEnd * taper;
          const y = p0.y + (p1.y - p0.y) * vEnd * taper;
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const grad = ctx.createLinearGradient(crest[0].x, 0, crest[numPts - 1].x, 0);
        grad.addColorStop(0, colorFn(0, vStart, 0));
        grad.addColorStop(0.12, colorFn(0.12, vStart, layerAlpha * 0.6));
        grad.addColorStop(0.45, colorFn(0.45, vStart, layerAlpha));
        grad.addColorStop(0.75, colorFn(0.75, vStart, layerAlpha));
        grad.addColorStop(0.92, colorFn(0.92, vStart, layerAlpha * 0.6));
        grad.addColorStop(1, colorFn(1, vStart, 0));
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // 2. Micro-fibres / Strands batched in 3 style groups (reduces GPU draw calls by 95%!)
      const numGroups = 3;
      const strandsPerGroup = Math.ceil(numStrands / numGroups);

      for (let g = 0; g < numGroups; g++) {
        const vMid = ((g + 0.5) * strandsPerGroup) / numStrands;
        const groupAlpha = Math.pow(1 - vMid, 1.1) * strandOpacity * (isReflection ? 0.75 : 1.0);

        ctx.beginPath();
        for (let s = 0; s < strandsPerGroup; s++) {
          const index = g * strandsPerGroup + s;
          if (index > numStrands) break;
          const v = index / numStrands;

          for (let i = 0; i < numPts; i++) {
            const u = i / (numPts - 1);
            const taper = Math.sin(u * Math.PI);
            const p0 = crest[i];
            const p1 = drape[i];

            const flutter =
              Math.sin(u * 7 - time * 1.6 + v * 3.5) * (2.8 * v * (1 - v * 0.3)) * taper;
            const x = p0.x + (p1.x - p0.x) * v * taper;
            const y = p0.y + (p1.y - p0.y) * v * taper + flutter;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = colorFn(0.5, vMid, groupAlpha);
        ctx.lineWidth = Math.max(0.8, 1.8 * (1 - vMid * 0.25));
        ctx.stroke();
      }

      // 3. Soft luminous crest folds: diffused and silky (NO sharp wire lines!)
      ctx.beginPath();
      for (let i = 0; i < numPts; i++) {
        if (i === 0) ctx.moveTo(crest[i].x, crest[i].y);
        else ctx.lineTo(crest[i].x, crest[i].y);
      }

      // Diffused ambient rim
      ctx.lineWidth = isReflection ? 8.0 : 11.0;
      ctx.strokeStyle = colorFn(0.5, 0, isReflection ? 0.32 : 0.44);
      ctx.stroke();

      // Silky luminous fold
      ctx.lineWidth = isReflection ? 3.5 : 4.5;
      ctx.strokeStyle = colorFn(0.5, 0, isReflection ? 0.72 : 0.88);
      ctx.stroke();

      // Soft inner gleam
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = `rgba(255, 255, 255, ${isReflection ? 0.25 : 0.40})`;
      ctx.stroke();

      ctx.restore();
    }

    const animate = () => {
      time += 0.012; // Hypnotic, ultra-fluid wave cadence

      // Smooth mouse tracking interpolation
      if (targetMouseX !== -1000) {
        if (mouseX === -1000) {
          mouseX = targetMouseX;
          mouseY = targetMouseY;
        } else {
          mouseX += (targetMouseX - mouseX) * 0.08;
          mouseY += (targetMouseY - mouseY) * 0.08;
        }
      } else {
        mouseX = -1000;
        mouseY = -1000;
      }

      const w = width;
      const h = height;
      const floorY = h * 0.74;

      // 1. Deep nocturnal background gradient
      const bgGrad = ctx.createRadialGradient(
        w * 0.52,
        h * 0.38,
        50,
        w * 0.5,
        h * 0.45,
        w * 0.92
      );
      bgGrad.addColorStop(0, '#04163d');
      bgGrad.addColorStop(0.35, '#020d26');
      bgGrad.addColorStop(0.70, '#010615');
      bgGrad.addColorStop(1, '#000206');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Atmospheric ambient glow centered behind ribbon intersection
      const centerGlow = ctx.createRadialGradient(
        w * 0.66,
        h * 0.46,
        10,
        w * 0.66,
        h * 0.46,
        w * 0.48
      );
      centerGlow.addColorStop(0, 'rgba(0, 95, 240, 0.32)');
      centerGlow.addColorStop(0.5, 'rgba(0, 45, 140, 0.12)');
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, w, h);

      // Organic mouse parallax offset
      const mxOffset = mouseX !== -1000 ? (mouseX - w * 0.5) * 0.015 : 0;
      const myOffset = mouseY !== -1000 ? (mouseY - h * 0.5) * 0.010 : 0;

      // --- CURVES SETUP WITH FLUID HARMONIC OSCILLATIONS ---

      // 1. Veil 1: The Main Royal Blue Arch (continuous across entire width)
      const v1CrestCtrl: Point[] = [
        { x: -w * 0.12 + mxOffset, y: h * (0.45 + Math.sin(time * 0.8) * 0.035) + myOffset },
        { x: w * 0.10 + mxOffset, y: h * (0.24 + Math.cos(time * 0.9) * 0.040) + myOffset },
        { x: w * 0.30 + mxOffset, y: h * (0.16 + Math.sin(time * 1.1) * 0.035) + myOffset },
        { x: w * 0.52 + mxOffset, y: h * (0.22 + Math.cos(time * 0.95) * 0.038) + myOffset },
        { x: w * 0.72 + mxOffset, y: h * (0.42 + Math.sin(time * 1.05) * 0.035) + myOffset },
        { x: w * 0.92 + mxOffset, y: h * (0.56 + Math.cos(time * 0.85) * 0.030) + myOffset },
        { x: w * 1.15 + mxOffset, y: h * (0.58 + Math.sin(time * 0.8) * 0.025) + myOffset },
      ];
      const v1Crest = sampleSpline(v1CrestCtrl, 60);

      const v1DrapeCtrl: Point[] = [
        { x: -w * 0.12 + mxOffset, y: h * (0.60 + Math.sin(time * 0.8 + 0.8) * 0.035) + myOffset },
        { x: w * 0.10 + mxOffset, y: h * (0.44 + Math.cos(time * 0.9 + 0.8) * 0.040) + myOffset },
        { x: w * 0.30 + mxOffset, y: h * (0.35 + Math.sin(time * 1.1 + 0.8) * 0.040) + myOffset },
        { x: w * 0.52 + mxOffset, y: h * (0.42 + Math.cos(time * 0.95 + 0.8) * 0.038) + myOffset },
        { x: w * 0.72 + mxOffset, y: h * (0.58 + Math.sin(time * 1.05 + 0.8) * 0.035) + myOffset },
        { x: w * 0.92 + mxOffset, y: h * (0.66 + Math.cos(time * 0.85 + 0.8) * 0.030) + myOffset },
        { x: w * 1.15 + mxOffset, y: h * (0.68 + Math.sin(time * 0.8 + 0.8) * 0.025) + myOffset },
      ];
      const v1Drape = sampleSpline(v1DrapeCtrl, 60);

      // 2. Veil 2: The Radiant Emerald/Mint-to-Cyan Wave (smooth parabolic dip, ascending up right!)
      const v2CrestCtrl: Point[] = [
        { x: w * 1.12 - mxOffset, y: h * (0.02 + Math.sin(time * 0.9 + 1.2) * 0.030) - myOffset },
        { x: w * 0.92 - mxOffset, y: h * (0.17 + Math.cos(time * 1.0 + 1.2) * 0.035) - myOffset },
        { x: w * 0.78 - mxOffset, y: h * (0.32 + Math.sin(time * 1.1 + 1.2) * 0.038) - myOffset },
        { x: w * 0.64 - mxOffset, y: h * (0.48 + Math.cos(time * 0.95 + 1.2) * 0.035) - myOffset },
        { x: w * 0.46 - mxOffset, y: h * (0.66 + Math.sin(time * 1.0 + 2.0) * 0.025) - myOffset },
        { x: w * 0.28 - mxOffset, y: h * (0.63 + Math.cos(time * 0.9 + 2.0) * 0.028) - myOffset },
        { x: w * 0.12 - mxOffset, y: h * (0.56 + Math.sin(time * 0.8 + 2.0) * 0.032) - myOffset },
        { x: -w * 0.12 - mxOffset, y: h * (0.46 + Math.cos(time * 0.85 + 2.0) * 0.035) - myOffset },
      ];
      const v2Crest = sampleSpline(v2CrestCtrl, 65);

      const v2DrapeCtrl: Point[] = [
        { x: w * 1.15 - mxOffset, y: -h * 0.06 + Math.sin(time * 0.9 + 1.8) * 25 },
        { x: w * 1.00 - mxOffset, y: h * (0.06 + Math.cos(time * 1.0 + 1.8) * 0.035) - myOffset },
        { x: w * 0.86 - mxOffset, y: h * (0.22 + Math.sin(time * 1.1 + 1.8) * 0.038) - myOffset },
        { x: w * 0.72 - mxOffset, y: h * (0.40 + Math.cos(time * 0.95 + 1.8) * 0.035) - myOffset },
        { x: w * 0.52 - mxOffset, y: h * (0.58 + Math.sin(time * 1.0 + 2.5) * 0.028) - myOffset },
        { x: w * 0.32 - mxOffset, y: h * (0.66 + Math.cos(time * 0.9 + 2.5) * 0.028) - myOffset },
        { x: w * 0.12 - mxOffset, y: h * (0.60 + Math.sin(time * 0.8 + 2.5) * 0.032) - myOffset },
        { x: -w * 0.12 - mxOffset, y: h * (0.48 + Math.cos(time * 0.85 + 2.5) * 0.035) - myOffset },
      ];
      const v2Drape = sampleSpline(v2DrapeCtrl, 65);

      // 3. Veil 3: The Full-Width Lower Royal Blue Ribbon (CONTINUES ACROSS ENTIRE SCREEN TO THE RIGHT!)
      const v3CrestCtrl: Point[] = [
        { x: -w * 0.12, y: h * (0.50 + Math.sin(time * 0.75 + 2.5) * 0.028) },
        { x: w * 0.08, y: h * (0.58 + Math.cos(time * 0.85 + 2.5) * 0.028) },
        { x: w * 0.28, y: h * (0.66 + Math.sin(time * 0.95 + 2.5) * 0.025) },
        { x: w * 0.48, y: h * (0.71 + Math.cos(time * 0.8 + 2.5) * 0.020) },
        { x: w * 0.68, y: h * (0.72 + Math.sin(time * 0.85 + 2.5) * 0.020) },
        { x: w * 0.90, y: h * (0.68 + Math.cos(time * 0.8 + 2.5) * 0.025) },
        { x: w * 1.15, y: h * (0.60 + Math.sin(time * 0.8 + 2.5) * 0.028) },
      ];
      const v3Crest = sampleSpline(v3CrestCtrl, 60);

      const v3DrapeCtrl: Point[] = [
        { x: -w * 0.12, y: h * (0.56 + Math.sin(time * 0.75 + 3.2) * 0.028) },
        { x: w * 0.08, y: h * (0.66 + Math.cos(time * 0.85 + 3.2) * 0.028) },
        { x: w * 0.28, y: h * (0.74 + Math.sin(time * 0.95 + 3.2) * 0.025) },
        { x: w * 0.48, y: h * (0.77 + Math.cos(time * 0.8 + 3.2) * 0.020) },
        { x: w * 0.68, y: h * (0.78 + Math.sin(time * 0.85 + 3.2) * 0.020) },
        { x: w * 0.90, y: h * (0.74 + Math.cos(time * 0.8 + 3.2) * 0.025) },
        { x: w * 1.15, y: h * (0.66 + Math.sin(time * 0.8 + 3.2) * 0.028) },
      ];
      const v3Drape = sampleSpline(v3DrapeCtrl, 60);

      function drawAllVeils(isReflection = false) {
        // Veil 3: Full-width Lower Royal Blue Ribbon
        renderLinenWaveBatched(v3Crest, v3Drape, {
          colorFn: (_u, _v, a) => `rgba(0, 115, 255, ${a})`,
          numStrands: 18,
          bodyOpacity: 0.45,
          strandOpacity: 0.14,
          isReflection,
        });

        // Veil 1: Main Royal Blue Arch
        renderLinenWaveBatched(v1Crest, v1Drape, {
          colorFn: (u, _v, a) => {
            if (u < 0.28) {
              const t = u / 0.28;
              return `rgba(0, ${Math.round(85 + t * 75)}, 255, ${a})`;
            } else if (u < 0.65) {
              const t = (u - 0.28) / 0.37;
              return `rgba(0, ${Math.round(160 + t * 80)}, 255, ${a})`;
            } else {
              return `rgba(0, 240, 255, ${a})`;
            }
          },
          numStrands: 24,
          bodyOpacity: 0.60,
          strandOpacity: 0.18,
          isReflection,
        });

        // Veil 2: Radiant Turquoise/Cyan Wave
        renderLinenWaveBatched(v2Crest, v2Drape, {
          colorFn: (u, _v, a) => {
            if (u < 0.32) {
              const t = u / 0.32;
              return `rgba(0, 255, ${Math.round(140 + t * 80)}, ${a})`;
            } else if (u < 0.65) {
              const t = (u - 0.32) / 0.33;
              return `rgba(0, ${Math.round(255 - t * 10)}, 255, ${a})`;
            } else if (u < 0.85) {
              return `rgba(0, 255, 240, ${a})`;
            } else {
              const t = (u - 0.85) / 0.15;
              return `rgba(0, ${Math.round(245 - t * 35)}, 255, ${a})`;
            }
          },
          numStrands: 26,
          bodyOpacity: 0.66,
          strandOpacity: 0.20,
          isReflection,
        });
      }

      // --- COMPUTE PARTICLE POSITIONS (POUSSIÈRES) ---
      function interpolatePoint(splinePts: Point[], u: number): Point {
        const totalPts = splinePts.length - 1;
        const idx = Math.min(Math.floor(u * totalPts), totalPts - 1);
        const frac = u * totalPts - idx;
        const p0 = splinePts[idx];
        const p1 = splinePts[idx + 1];
        return {
          x: p0.x + (p1.x - p0.x) * frac,
          y: p0.y + (p1.y - p0.y) * frac,
        };
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.u += p.speedU;
        if (p.u > 0.96) p.u = 0.04;
        if (p.u < 0.04) p.u = 0.96;

        let cPt: Point, dPt: Point;
        if (p.ribbonId === 1) {
          cPt = interpolatePoint(v2Crest, p.u);
          dPt = interpolatePoint(v2Drape, p.u);
        } else if (p.ribbonId === 0) {
          cPt = interpolatePoint(v1Crest, p.u);
          dPt = interpolatePoint(v1Drape, p.u);
        } else {
          cPt = interpolatePoint(v3Crest, p.u);
          dPt = interpolatePoint(v3Drape, p.u);
        }

        // Base point along fabric fold
        const bx = cPt.x + (dPt.x - cPt.x) * p.offsetDrape;
        const by = cPt.y + (dPt.y - cPt.y) * p.offsetDrape;

        // Normal unit vector perpendicular to wave
        const tx = dPt.x - cPt.x;
        const ty = dPt.y - cPt.y;
        const len = Math.hypot(tx, ty) || 1;
        const nx = -ty / len;
        const ny = tx / len;

        let targetX = bx + nx * p.offsetDist;
        let targetY = by + ny * p.offsetDist;

        // Subtle, gentle cursor interaction (soft nudging, no violent bouncing)
        if (mouseX !== -1000) {
          const cdx = targetX - mouseX;
          const cdy = targetY - mouseY;
          const dist = Math.hypot(cdx, cdy);
          if (dist < 120 && dist > 0.1) {
            const push = (1 - dist / 120) * 14;
            targetX += (cdx / dist) * push;
            targetY += (cdy / dist) * push;
          }
        }

        if (p.currentX === 0 && p.currentY === 0) {
          p.currentX = targetX;
          p.currentY = targetY;
        } else {
          p.currentX += (targetX - p.currentX) * 0.15;
          p.currentY += (targetY - p.currentY) * 0.15;
        }
      }

      // --- DRAW PARTICLES AS FINE DUST SPECKS (POUSSIÈRES - NO LIGHT BALLS!) ---
      function drawDustBatched(isReflection = false) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // 1. Crisp White Dust Specks
        ctx.fillStyle = isReflection ? 'rgba(255, 255, 255, 0.50)' : 'rgba(255, 255, 255, 0.88)';
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.colorType !== 0) continue;

          let dy = isReflection ? floorY + (floorY - p.currentY) * 0.85 : p.currentY;
          if (isReflection && (dy < floorY || dy > h)) continue;
          if (!isReflection && dy > floorY + 40) continue;

          // Pure tiny circular speck (0.7px to 1.6px) - NO outer blur halo!
          const r = p.size * (isReflection ? 0.75 : 0.9);
          ctx.moveTo(p.currentX + r, dy);
          ctx.arc(p.currentX, dy, r, 0, Math.PI * 2);
        }
        ctx.fill();

        // 2. Pale Cyan Dust Specks
        ctx.fillStyle = isReflection ? 'rgba(0, 240, 255, 0.45)' : 'rgba(0, 245, 255, 0.82)';
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.colorType !== 1) continue;

          let dy = isReflection ? floorY + (floorY - p.currentY) * 0.85 : p.currentY;
          if (isReflection && (dy < floorY || dy > h)) continue;
          if (!isReflection && dy > floorY + 40) continue;

          const r = p.size * (isReflection ? 0.75 : 0.9);
          ctx.moveTo(p.currentX + r, dy);
          ctx.arc(p.currentX, dy, r, 0, Math.PI * 2);
        }
        ctx.fill();

        // 3. Azure/Blue Dust Specks
        ctx.fillStyle = isReflection ? 'rgba(80, 190, 255, 0.45)' : 'rgba(90, 200, 255, 0.78)';
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.colorType !== 2) continue;

          let dy = isReflection ? floorY + (floorY - p.currentY) * 0.85 : p.currentY;
          if (isReflection && (dy < floorY || dy > h)) continue;
          if (!isReflection && dy > floorY + 40) continue;

          const r = p.size * (isReflection ? 0.75 : 0.9);
          ctx.moveTo(p.currentX + r, dy);
          ctx.arc(p.currentX, dy, r, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.restore();
      }

      // --- PASS 1: Floor Reflection (SEAMLESS - ZERO LINE OF SYMMETRY!) ---
      ctx.save();
      ctx.translate(0, floorY);
      ctx.scale(1, -0.72);
      ctx.translate(0, -floorY);
      drawAllVeils(true);
      ctx.restore();

      // Reflected dust specks in glossy ground
      drawDustBatched(true);

      // Smooth progressive dark wash: blends seamlessly from contact point downwards
      const floorOverlay = ctx.createLinearGradient(0, floorY - 50, 0, h);
      floorOverlay.addColorStop(0, 'rgba(0, 2, 7, 0.0)');
      floorOverlay.addColorStop(0.18, 'rgba(0, 2, 7, 0.22)');
      floorOverlay.addColorStop(0.45, 'rgba(0, 2, 6, 0.58)');
      floorOverlay.addColorStop(0.78, 'rgba(0, 1, 4, 0.90)');
      floorOverlay.addColorStop(1, 'rgba(0, 1, 3, 0.98)');
      ctx.fillStyle = floorOverlay;
      ctx.fillRect(0, floorY - 50, w, h - (floorY - 50));

      // --- PASS 2: Soft Contact Glow Pools (NO HORIZON BAR STROKE!) ---
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const poolGrad = ctx.createRadialGradient(
        w * 0.46,
        floorY + 6,
        2,
        w * 0.46,
        floorY + 6,
        w * 0.30
      );
      poolGrad.addColorStop(0, 'rgba(0, 255, 225, 0.95)');
      poolGrad.addColorStop(0.18, 'rgba(0, 225, 255, 0.65)');
      poolGrad.addColorStop(0.48, 'rgba(0, 100, 255, 0.25)');
      poolGrad.addColorStop(1, 'rgba(0, 40, 160, 0)');
      ctx.fillStyle = poolGrad;
      ctx.save();
      ctx.scale(1, 0.26);
      ctx.fillRect(w * 0.16, (floorY - 25) / 0.26, w * 0.62, 180 / 0.26);
      ctx.restore();

      const bluePoolGrad = ctx.createRadialGradient(
        w * 0.16,
        floorY + 2,
        2,
        w * 0.16,
        floorY + 2,
        w * 0.22
      );
      bluePoolGrad.addColorStop(0, 'rgba(0, 130, 255, 0.60)');
      bluePoolGrad.addColorStop(0.4, 'rgba(0, 70, 210, 0.25)');
      bluePoolGrad.addColorStop(1, 'rgba(0, 20, 100, 0)');
      ctx.fillStyle = bluePoolGrad;
      ctx.save();
      ctx.scale(1, 0.24);
      ctx.fillRect(0, (floorY - 20) / 0.24, w * 0.40, 150 / 0.24);
      ctx.restore();

      ctx.restore();

      // --- PASS 3: Main Linen Waves in the Air ---
      drawAllVeils(false);

      // Fine dust specks tightly hugging the linen waves
      drawDustBatched(false);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}
