import { useEffect, useRef } from 'react';

interface Wave {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  controlX: number;
  controlY: number;
  speed: number;
  offset: number;
  color: string;
  glowColor: string;
  thickness: number;
}

export default function PS4FlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    console.log('Canvas found, initializing...');

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Context not available');
      return;
    }

    console.log('PS4 Flow animation starting...');

    let animationFrameId: number;
    const waves: Wave[] = [];
    let time = 0;

    // Ajuster la taille du canvas
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      console.log(`Canvas resized to ${window.innerWidth}x${window.innerHeight}`);
      
      // Réinitialiser les vagues après le resize
      initWaves();
    };

    // Initialiser les vagues qui se croisent
    const initWaves = () => {
      waves.length = 0;
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      waves.push(
        // Vague bleue principale (diagonale haut-gauche vers bas-droite)
        {
          startX: -200,
          startY: h * 0.2,
          endX: w + 200,
          endY: h * 0.5,
          controlX: w * 0.3,
          controlY: h * 0.15,
          speed: 0.0003,
          offset: 0,
          color: '#0066FF',
          glowColor: 'rgba(0, 102, 255, 0.6)',
          thickness: 150,
        },
        // Vague cyan/turquoise (diagonale bas-gauche vers haut-droite)
        {
          startX: -200,
          startY: h * 0.7,
          endX: w + 200,
          endY: h * 0.3,
          controlX: w * 0.6,
          controlY: h * 0.85,
          speed: 0.0004,
          offset: Math.PI,
          color: '#00D9FF',
          glowColor: 'rgba(0, 217, 255, 0.6)',
          thickness: 140,
        },
        // Vague bleue secondaire (plus haut)
        {
          startX: -200,
          startY: h * 0.15,
          endX: w + 200,
          endY: h * 0.45,
          controlX: w * 0.5,
          controlY: h * 0.05,
          speed: 0.00025,
          offset: Math.PI * 0.5,
          color: '#0052CC',
          glowColor: 'rgba(0, 82, 204, 0.5)',
          thickness: 120,
        },
        // Vague cyan plus basse
        {
          startX: -200,
          startY: h * 0.75,
          endX: w + 200,
          endY: h * 0.35,
          controlX: w * 0.4,
          controlY: h * 0.9,
          speed: 0.00035,
          offset: Math.PI * 1.5,
          color: '#00FFDD',
          glowColor: 'rgba(0, 255, 221, 0.5)',
          thickness: 130,
        }
      );
      console.log('Waves initialized:', waves.length);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Dessiner une vague avec effet de lumière
    const drawWave = (wave: Wave, timeOffset: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Animation oscillante
      const oscillation = Math.sin(timeOffset + wave.offset) * 30;
      
      // Points de contrôle animés
      const animatedControlX = wave.controlX + oscillation;
      const animatedControlY = wave.controlY + oscillation * 0.5;

      // Créer plusieurs couches pour l'effet de profondeur
      for (let layer = 0; layer < 3; layer++) {
        const layerThickness = wave.thickness * (1 - layer * 0.2);
        const layerOpacity = 0.3 - layer * 0.08;

        // Gradient pour la vague
        const gradient = ctx.createLinearGradient(0, 0, w, h);
        gradient.addColorStop(0, `${wave.color}00`);
        gradient.addColorStop(0.3, `${wave.color}${Math.floor(layerOpacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.5, `${wave.color}${Math.floor(layerOpacity * 1.5 * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(0.7, `${wave.color}${Math.floor(layerOpacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${wave.color}00`);

        // Dessiner la forme de la vague
        ctx.beginPath();
        
        // Point de départ
        ctx.moveTo(wave.startX, wave.startY - layerThickness / 2);
        
        // Courbe supérieure
        ctx.quadraticCurveTo(
          animatedControlX,
          animatedControlY - layerThickness / 2,
          wave.endX,
          wave.endY - layerThickness / 2
        );
        
        // Courbe inférieure (retour)
        ctx.lineTo(wave.endX, wave.endY + layerThickness / 2);
        ctx.quadraticCurveTo(
          animatedControlX,
          animatedControlY + layerThickness / 2,
          wave.startX,
          wave.startY + layerThickness / 2
        );
        
        ctx.closePath();

        // Remplir avec le gradient
        ctx.fillStyle = gradient;
        ctx.fill();

        // Ajouter le glow si c'est la première couche
        if (layer === 0) {
          ctx.shadowBlur = 60;
          ctx.shadowColor = wave.glowColor;
          ctx.fill();
        }
      }

      // Ligne lumineuse centrale
      ctx.beginPath();
      ctx.moveTo(wave.startX, wave.startY);
      ctx.quadraticCurveTo(
        animatedControlX,
        animatedControlY,
        wave.endX,
        wave.endY
      );

      const lineGradient = ctx.createLinearGradient(0, 0, w, h);
      lineGradient.addColorStop(0, `${wave.color}00`);
      lineGradient.addColorStop(0.2, `${wave.color}99`);
      lineGradient.addColorStop(0.5, `${wave.color}FF`);
      lineGradient.addColorStop(0.8, `${wave.color}99`);
      lineGradient.addColorStop(1, `${wave.color}00`);

      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 40;
      ctx.shadowColor = wave.color;
      ctx.stroke();

      // Ligne intérieure plus brillante
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#FFFFFF';
      ctx.globalAlpha = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    // Fonction d'animation
    const animate = () => {
      time += 0.01;

      // Fond noir/bleu très foncé
      const bgGradient = ctx.createRadialGradient(
        window.innerWidth / 2,
        window.innerHeight / 2,
        0,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerWidth
      );
      bgGradient.addColorStop(0, '#001428');
      bgGradient.addColorStop(1, '#000510');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Réinitialiser les effets
      ctx.shadowBlur = 0;

      // Dessiner toutes les vagues
      waves.forEach((wave) => {
        wave.offset += wave.speed;
        drawWave(wave, time);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    console.log('Starting animation loop...');
    animate();

    return () => {
      console.log('Cleaning up animation...');
      window.removeEventListener('resize', resizeCanvas);
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
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}
