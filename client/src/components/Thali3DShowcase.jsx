import React, { useState, useRef } from 'react';
import { Sparkles, Clock, ShieldCheck, Flame, Star } from 'lucide-react';

export const Thali3DShowcase = () => {
  const [rotate, setRotate] = useState({ x: 12, y: -15 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Smooth tilt angles (-20deg to +20deg)
    const rotateY = ((x - centerX) / centerX) * 18;
    const rotateX = -((y - centerY) / centerY) * 18;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 10, y: -12 }); // Reset to pleasant default 3D isometric angle
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-lg mx-auto aspect-square perspective-1200 cursor-grab active:cursor-grabbing select-none py-6"
    >
      {/* 3D Rotating Plate Container */}
      <div
        className="w-full h-full relative preserve-3d transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {/* Ambient Culinary Glow Aura underneath */}
        <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-amber-600/30 via-gold-500/20 to-transparent blur-3xl animate-glow transform translate-z-[-40px]"></div>

        {/* 3D Plate Outer Rim (Traditional Indian Brass & Gold Polish) */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gold-400 via-amber-600 to-mocha-900 p-2 shadow-2xl preserve-3d">
          {/* Inner Plate Surface */}
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-mocha-950 via-mocha-900 to-mocha-950 p-6 relative overflow-hidden shadow-inner border-4 border-gold-400/40">
            {/* Plate Center Ultra-Clean Top-Down Thali Image */}
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85"
                alt="Traditional Homestyle Indian Thali"
                className="w-full h-full object-cover scale-110 opacity-95 transition-transform duration-500 hover:scale-115"
              />

              {/* Realistic Steam Particle Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-24 bg-white/20 blur-md rounded-full steam-1 transform -translate-x-6"></div>
                <div className="w-10 h-28 bg-white/25 blur-lg rounded-full steam-2"></div>
                <div className="w-8 h-20 bg-white/20 blur-md rounded-full steam-3 transform translate-x-8"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating 3D Satellite Feature Pills (Projected in 3D Space with translateZ) */}
        {/* Pill 1: Skip Guarantee */}
        <div
          className="absolute -top-3 -left-2 z-20 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-gold-300 shadow-xl flex items-center space-x-2 text-xs font-bold text-mocha-950 animate-float-slow"
          style={{ transform: 'translateZ(60px)' }}
        >
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-mocha-500 uppercase tracking-wider">Zero Dispute</p>
            <p>Skip Before 5:00 PM</p>
          </div>
        </div>

        {/* Pill 2: 100% Credit Back */}
        <div
          className="absolute top-1/3 -right-6 z-20 px-4 py-2 rounded-2xl bg-mocha-950 text-white border border-gold-500/50 shadow-2xl flex items-center space-x-2.5 text-xs font-bold animate-float-reverse"
          style={{ transform: 'translateZ(80px)' }}
        >
          <div className="p-1.5 rounded-lg bg-gold-500/20 text-gold-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gold-300 uppercase tracking-wider">Automated Ledger</p>
            <p className="text-white">100% Money Credited</p>
          </div>
        </div>

        {/* Pill 3: FSSAI Verified Kitchens */}
        <div
          className="absolute -bottom-4 left-6 z-20 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-mocha-200 shadow-xl flex items-center space-x-2 text-xs font-bold text-mocha-900 animate-float-slow"
          style={{ transform: 'translateZ(70px)' }}
        >
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-mocha-500 uppercase tracking-wider">Hygienic Home Cooks</p>
            <p className="flex items-center text-mocha-950">
              Verified Kitchens
              <Star className="w-3 h-3 text-amber-500 fill-current ml-1" />
              <span className="text-xs text-amber-600 ml-0.5">4.9</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Thali3DShowcase;
