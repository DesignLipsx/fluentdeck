import React, { useState, useEffect, useMemo } from 'react';
import { NavItem } from '../types';

interface Avatar {
  id: number;
  name: string;
  image: string;
  ring: 'outer' | 'inner';
}

interface Position {
  cx: number;
  cy: number;
}

interface Connection {
  from: number | 'center';
  to: number | 'center';
  color: string;
}

interface AvatarPositions {
  [key: string]: Position;
}

interface NetworkVisualizationProps {
  onNavigate: () => void;
}

function NetworkVisualization({ onNavigate }: NetworkVisualizationProps) {
  const [containerSize, setContainerSize] = useState({ width: 700, height: 700 });
  const [contributors, setContributors] = useState<any[]>([]);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/DesignLipsx/WinUI-3-Apps-List/contributors');
        const data = await response.json();
        setContributors(data.filter((c: any) => c.type === 'User'));
      } catch (error) {
        console.error('Failed to fetch contributors:', error);
      }
    };
    fetchContributors();
  }, []);

  const topContributor = useMemo(() => (contributors.length > 0 ? contributors[0] : null), [contributors]);
  const otherContributors = useMemo(() => (contributors.length > 0 ? contributors.slice(1) : []), [contributors]);

  const avatars: Avatar[] = useMemo(() => {
    if (otherContributors.length === 0) return [];
    const contributorsToShow = otherContributors.slice(0, 24);
    return contributorsToShow.map((c, i) => ({
      id: c.id,
      name: c.login,
      image: c.avatar_url,
      ring: i % 3 === 0 && i > 0 ? 'inner' : 'outer',
    }));
  }, [otherContributors]);

  // Responsive scaling logic
  const dimensions = useMemo(() => {
    const baseSize = Math.min(containerSize.width, containerSize.height);
    const scale = baseSize / 700;

    return {
      containerSize: baseSize,
      outerRadius: Math.floor(290 * scale),
      innerRadius: Math.floor(180 * scale),
      centerImageSize: Math.floor(160 * scale),
      outerAvatarSize: Math.floor(80 * scale),
      innerAvatarSize: Math.floor(72 * scale),
      outerImageSize: Math.floor(64 * scale),
      innerImageSize: Math.floor(56 * scale),
      strokeWidth: Math.max(1, Math.floor(3 * scale)),
      tooltipTextSize: scale < 0.6 ? 'text-xs' : 'text-sm',
      centerX: baseSize / 2,
      centerY: baseSize / 2,
    };
  }, [containerSize]);

  // ✅ FIXED: Better responsive container sizing
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
    
      // Use 90% of viewport width with maximum constraints
      const maxWidth = Math.min(width * 0.9, 600);
      const size = Math.max(isMobile ? 280 : 320, maxWidth);
    
      setContainerSize({ width: size, height: size });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []); 

  const outerRingAvatars = avatars.filter((a) => a.ring === 'outer');
  const innerRingAvatars = avatars.filter((a) => a.ring === 'inner');
  const [activeConnections, setActiveConnections] = useState<Connection[]>([]);

  const allAvatarPositions: AvatarPositions = useMemo(() => {
    const getAvatarAbsolutePosition = (index: number, total: number, radius: number, startAngleOffset = 0): Position => {
      const angle = startAngleOffset + (index / total) * 2 * Math.PI;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      return { cx: dimensions.centerX + x, cy: dimensions.centerY + y };
    };

    const positions: AvatarPositions = {};
    outerRingAvatars.forEach((avatar, index) => {
      positions[avatar.id] = getAvatarAbsolutePosition(index, outerRingAvatars.length, dimensions.outerRadius, Math.PI / 2);
    });
    innerRingAvatars.forEach((avatar, index) => {
      positions[avatar.id] = getAvatarAbsolutePosition(index, innerRingAvatars.length, dimensions.innerRadius, Math.PI / 3);
    });
    positions['center'] = { cx: dimensions.centerX, cy: dimensions.centerY } as Position;
    return positions;
  }, [dimensions, outerRingAvatars, innerRingAvatars]);

  const allConnectionPoints: (number | 'center')[] = useMemo(() => [...avatars.map((a) => a.id), 'center'], [avatars]);

  const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Connection animation logic
  useEffect(() => {
    if (allConnectionPoints.length <= 1) return;
    const interval = setInterval(() => {
      let from: number | 'center';
      let to: number | 'center';
      do {
        from = getRandomElement(allConnectionPoints);
        to = getRandomElement(allConnectionPoints);
      } while (from === to);
      
      const newConnection: Connection = {
        from, 
        to, 
        color: getRandomElement(['blue', 'green', 'purple', 'yellow', 'red', 'orange', 'pink', 'cyan', 'white'])
      };
      setActiveConnections([newConnection]);
    }, 4000);

    return () => clearInterval(interval);
  }, [allConnectionPoints]);

  const isCurrentlyConnected = (id: number | 'center'): boolean => {
    return activeConnections.some((conn) => conn.from === id || conn.to === id);
  };

  return (
    // ✅ FIXED: Removed problematic classes and simplified container
    <div className="flex items-center justify-center w-full overflow-hidden network-container">
      <style>{`
        @keyframes draw-line {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
      
      <div
        className="relative mx-auto"
        style={{
          width: `${dimensions.containerSize}px`,
          height: `${dimensions.containerSize}px`,
          maxWidth: '100%', // ✅ Ensures it doesn't exceed parent container
        }}
      >
        {/* Outer + Inner Rings */}
        <div
          className="absolute border-2 border-dashed border-purple-400/50 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `${dimensions.outerRadius * 2}px`,
            height: `${dimensions.outerRadius * 2}px`,
          }}
        />
        <div
          className="absolute border-2 border-dashed border-purple-400/50 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `${dimensions.innerRadius * 2}px`,
            height: `${dimensions.innerRadius * 2}px`,
          }}
        />

        {/* Center Avatar */}
        <div
          className="absolute shadow-lg z-10 group cursor-pointer rounded-full bg-bg-secondary"
          style={{
            left: `${dimensions.centerX}px`,
            top: `${dimensions.centerY}px`,
            transform: `translate(-50%, -50%)`,
          }}
          onClick={onNavigate}
        >
          {topContributor ? (
            <img
              src={topContributor.avatar_url}
              alt={topContributor.login}
              className="rounded-full object-cover"
              style={{
                width: `${dimensions.centerImageSize}px`,
                height: `${dimensions.centerImageSize}px`,
              }}
            />
          ) : (
            <img
              src="https://i.postimg.cc/Vvs6wjNs/logo.png"
              alt="Fluent Deck Logo"
              className="rounded-full object-contain p-4"
              style={{
                width: `${dimensions.centerImageSize}px`,
                height: `${dimensions.centerImageSize}px`,
              }}
            />
          )}
          <div
            className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full font-medium text-gray-800 shadow-lg transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 ${dimensions.tooltipTextSize} ${
              isCurrentlyConnected('center') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {topContributor ? topContributor.login : 'Contributors Hub'}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/90"></div>
          </div>
        </div>

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full z-0 overflow-visible">
          <defs>
            <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="0.5" intercept="0" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {activeConnections.map((conn, i) => {
            const fromPos = allAvatarPositions[conn.from as number];
            const toPos = allAvatarPositions[conn.to as number];
            if (!fromPos || !toPos) return null;
            const dx = toPos.cx - fromPos.cx;
            const dy = toPos.cy - fromPos.cy;
            const lineLength = Math.sqrt(dx * dx + dy * dy);
            return (
              <line
                key={i}
                x1={fromPos.cx}
                y1={fromPos.cy}
                x2={toPos.cx}
                y2={toPos.cy}
                stroke={
                  conn.color.includes('blue')
                    ? '#3b82f6'
                    : conn.color.includes('green')
                    ? '#10b981'
                    : conn.color.includes('purple')
                    ? '#8b5cf6'
                    : '#3b82f6'
                }
                strokeWidth={dimensions.strokeWidth}
                strokeOpacity="0.8"
                fill="none"
                style={{
                  strokeDasharray: lineLength,
                  strokeDashoffset: lineLength,
                  animation: 'draw-line 3s linear forwards',
                }}
                filter="url(#lineGlow)"
              />
            );
          })}
        </svg>

        {/* Avatars */}
        {[...outerRingAvatars, ...innerRingAvatars].map((avatar) => {
          const { cx, cy } = allAvatarPositions[avatar.id];
          const isActive = isCurrentlyConnected(avatar.id);
          const isOuter = avatar.ring === 'outer';
          const avatarSize = isOuter ? dimensions.outerAvatarSize : dimensions.innerAvatarSize;
          const imageSize = isOuter ? dimensions.outerImageSize : dimensions.innerImageSize;

          return (
            <div
              key={avatar.id}
              className="absolute group"
              style={{
                left: `${cx}px`,
                top: `${cy}px`,
                transform: `translate(-50%, -50%)`,
              }}
              onClick={onNavigate}
            >
              <div
                className="bg-bg-secondary rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer relative"
                style={{
                  width: `${avatarSize}px`,
                  height: `${avatarSize}px`,
                }}
              >
                <div
                  className="rounded-full relative overflow-hidden flex items-center justify-center"
                  style={{
                    width: `${imageSize}px`,
                    height: `${imageSize}px`,
                  }}
                >
                  <img src={avatar.image} alt={avatar.name} className="w-full h-full object-cover rounded-full" />
                </div>
                <div
                  className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full font-medium text-gray-800 shadow-lg transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 ${dimensions.tooltipTextSize} ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {avatar.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/90"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NetworkVisualization;