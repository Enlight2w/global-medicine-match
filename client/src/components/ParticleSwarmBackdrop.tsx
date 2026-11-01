import { useEffect, useRef } from "react";

type Particle = {
  angle: number;
  radius: number;
  depth: number;
  speed: number;
  size: number;
  phase: number;
  warm: boolean;
};

export default function ParticleSwarmBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles: Particle[] = Array.from({ length: 760 }, (_, index) => {
      const band = index / 760;
      return {
        angle: (index * 2.39996) % (Math.PI * 2),
        radius: band < 0.62 ? 0.18 + band * 1.35 : 1.02 + ((band - 0.62) / 0.38) * 0.82,
        depth: (Math.sin(index * 78.233) * 0.5 + 0.5) * 2 - 1,
        speed: 0.08 + (index % 11) * 0.006,
        size: 0.55 + (index % 5) * 0.22,
        phase: index * 0.73,
        warm: index % 13 === 0,
      };
    });

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let startedAt = performance.now();

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (now: number) => {
      const elapsed = reducedMotion ? 0 : (now - startedAt) / 1000;
      const centerX = width * 0.73;
      const centerY = height * 0.48;
      const scale = Math.min(width, height) * 0.31;

      context.clearRect(0, 0, width, height);
      const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale * 1.75);
      glow.addColorStop(0, "rgba(25, 218, 192, 0.28)");
      glow.addColorStop(0.28, "rgba(25, 138, 149, 0.11)");
      glow.addColorStop(0.7, "rgba(10, 22, 36, 0.03)");
      glow.addColorStop(1, "rgba(5, 10, 17, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      context.save();
      context.globalCompositeOperation = "lighter";
      for (const particle of particles) {
        const ring = particle.radius + Math.sin(elapsed * 1.3 + particle.phase) * 0.018;
        const angle = particle.angle + elapsed * particle.speed;
        const x = centerX + Math.cos(angle) * scale * ring;
        const y = centerY + Math.sin(angle) * scale * ring * 0.57 + particle.depth * scale * 0.055;
        const alpha = Math.max(0.12, 0.78 - Math.abs(particle.depth) * 0.22);
        const color = particle.warm ? `rgba(241, 189, 102, ${alpha})` : `rgba(71, 224, 206, ${alpha})`;
        context.beginPath();
        context.fillStyle = color;
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();

      if (!reducedMotion) animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw(performance.now());
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-swarm" aria-hidden="true" />;
}
