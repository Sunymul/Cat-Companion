import { useEffect, useState } from 'react';
import { CompanionSettings, CatState } from '../types';

interface CatSpriteProps {
  state: CatState;
  settings: CompanionSettings;
  lookAngle: number; // in radians, pointing to target
  lookStrength: number; // 0 to 1, distance from center
  isBlinking: boolean;
  typingStep: number; // For paw alternate movement
  scale?: number; // Overall scale multiplier
}

export default function CatSprite({
  state,
  settings,
  lookAngle,
  lookStrength,
  isBlinking,
  typingStep,
  scale = 1,
}: CatSpriteProps) {
  const [tailAngle, setTailAngle] = useState(0);
  const [breathScale, setBreathScale] = useState(1);

  // Animate tail in background
  useEffect(() => {
    let animationId: number;
    let start = Date.now();

    const update = () => {
      const now = Date.now();
      const elapsed = now - start;

      // Tail wag speed based on state
      let wSpeed = 0.003;
      let wAmp = 12;
      if (state === 'excited') {
        wSpeed = 0.012;
        wAmp = 25;
      } else if (state === 'sleeping') {
        wSpeed = 0.001;
        wAmp = 4;
      } else if (state === 'typing') {
        wSpeed = 0.006;
        wAmp = 8;
      }

      setTailAngle(Math.sin(elapsed * wSpeed) * wAmp);

      // Breathing effect
      let bSpeed = 0.002;
      let bAmp = 0.03;
      if (state === 'sleeping') {
        bSpeed = 0.0015;
        bAmp = 0.05;
      } else if (state === 'surprised') {
        bSpeed = 0.01;
        bAmp = 0.02;
      }
      setBreathScale(1 + Math.sin(elapsed * bSpeed) * bAmp);

      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, [state]);

  // Color mappings
  const getCatColors = () => {
    const preset = settings.colorPreset;
    if (preset === 'custom') {
      return settings.customColors;
    }

    const presets: Record<string, typeof settings.customColors> = {
      orange: {
        fur: '#F48C42',
        pattern: '#C95F20',
        eyes: '#5CB35C',
        ears: '#FFB17F',
        snout: '#332211',
        paws: '#FFD7B5',
      },
      black: {
        fur: '#1E1E24',
        pattern: '#121215',
        eyes: '#DFEB1E',
        ears: '#3B3B45',
        snout: '#050505',
        paws: '#333333',
      },
      white: {
        fur: '#F7F7F7',
        pattern: '#E1E1E6',
        eyes: '#3F86E4',
        ears: '#FAD2E1',
        snout: '#222222',
        paws: '#FFFFFF',
      },
      gray: {
        fur: '#7E8A90',
        pattern: '#525B60',
        eyes: '#EFA61B',
        ears: '#A1AEB5',
        snout: '#1C2123',
        paws: '#B4C0C5',
      },
      brown: {
        fur: '#704c38',
        pattern: '#503525',
        eyes: '#25C8B4',
        ears: '#A07c68',
        snout: '#1F120A',
        paws: '#96705B',
      },
      calico: {
        fur: '#EBCB94', // Light tan
        pattern: '#1E2022', // Black blotch (using pattern for secondary)
        eyes: '#77BD2B',
        ears: '#EEA28D', // Peach/orange ears
        snout: '#332B25',
        paws: '#FFFFFF',
      },
    };

    return presets[preset] || presets.orange;
  };

  const colors = getCatColors();
  const baseSize = settings.size; // 20 - 50px
  const pixelFactor = baseSize / 24; // Designed around a 24x24 core canvas
  const finalScale = pixelFactor * scale;

  // Face elements offset calculation based on cursor tracking
  let fx = 0;
  let fy = 0;
  if (settings.enableTracking) {
    if (state === 'look-left') {
      fx = -2;
      fy = 0;
    } else if (state === 'look-right') {
      fx = 2;
      fy = 0;
    } else if (state === 'look-up') {
      fx = 0;
      fy = -2;
    } else if (state === 'look-down') {
      fx = 0;
      fy = 2;
    } else if (state !== 'sleeping') {
      // Calculate continuous offset based on angle
      fx = Math.cos(lookAngle) * lookStrength * 2.5;
      fy = Math.sin(lookAngle) * lookStrength * 2.0;

      // Limit range
      fx = Math.max(-3, Math.min(3, fx));
      fy = Math.max(-2, Math.min(2.5, fy));
    }
  }

  // Handle sleep eye closures or blink
  const showClosedEyes = state === 'sleeping' || isBlinking;
  const isSurprised = state === 'surprised';
  const isExcited = state === 'excited';

  // Specific state modifications
  let sleepingYOffset = state === 'sleeping' ? 3 : 0;
  let headBounce = 0;
  if (state === 'typing') {
    headBounce = typingStep % 2 === 0 ? 0.4 : -0.4;
  } else if (state === 'walking') {
    headBounce = typingStep % 2 === 0 ? 0.6 : -0.2;
  }

  return (
    <div
      style={{
        width: `${baseSize * scale}px`,
        height: `${baseSize * scale}px`,
        transition: 'transform 0.15s ease-out, filter 0.3s ease',
        transform: `scaleY(${breathScale})`,
      }}
      className="relative flex items-center justify-center select-none cursor-pointer"
    >
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        style={{ imageRendering: 'pixelated' }}
        className="overflow-visible fill-none stroke-none"
      >
        {/* Shadow */}
        <ellipse
          cx="12"
          cy="21.5"
          rx="8"
          ry="1.5"
          fill="rgba(0,0,0,0.18)"
        />

        {/* --- ACCESSORY: WINGS --- */}
        {settings.equippedAccessory === 'wings' && state !== 'sleeping' && (
          <g style={{
            transform: `scale(${breathScale})`,
            transformOrigin: '12px 14px'
          }}>
            {/* Left Wing */}
            <path
              d="M 6 15 C 3 12, 1 15, 3 19 C 4 18, 5 17, 6 16"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="0.8"
              style={{
                transform: `rotate(${-tailAngle * 0.4}deg)`,
                transformOrigin: '6px 16px',
                transition: 'transform 0.1s linear'
              }}
            />
            {/* Right Wing */}
            <path
              d="M 18 15 C 21 12, 23 15, 21 19 C 20 18, 19 17, 18 16"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="0.8"
              style={{
                transform: `rotate(${tailAngle * 0.4}deg)`,
                transformOrigin: '18px 16px',
                transition: 'transform 0.1s linear'
              }}
            />
          </g>
        )}

        {/* --- TAIL --- */}
        <g style={{
          transform: `rotate(${tailAngle}deg)`,
          transformOrigin: '7px 18px',
          transition: 'transform 0.1s linear'
        }}>
          {/* Calico or striped tail colors */}
          <path
            d="M7 18 C 5 18, 3 14, 4 9 C 4.5 7, 7 5, 8 6 C 9 7, 6.5 9, 6 12 C 5.5 14, 7 17, 8 17"
            stroke={colors.fur}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {settings.colorPreset === 'orange' || settings.colorPreset === 'gray' ? (
            // Stripes on tail
            <>
              <path d="M4.2 12 L 5.5 12.5" stroke={colors.pattern} strokeWidth="1" />
              <path d="M4.6 9 Z" stroke={colors.pattern} strokeWidth="1" />
            </>
          ) : settings.colorPreset === 'calico' ? (
            // Tri-color tail ring
            <path d="M4.5 10 C 4.7 9, 5.5 8, 6.5 9.5" stroke={colors.pattern} strokeWidth="1.5" />
          ) : null}
        </g>

        {/* --- MAIN BODY --- */}
        {state === 'sleeping' ? (
          // Sleeping curled up body
          <g style={{ transform: 'translate(0, 2px)' }}>
            <ellipse cx="12" cy="16" rx="8" ry="5.5" fill={colors.fur} />
            {/* Calico blotches */}
            {settings.colorPreset === 'calico' && (
              <>
                <path d="M 6 14 Q 8 11 11 15 Z" fill={colors.pattern} />
                <path d="M 14 13 Q 16 11 18 15 Z" fill="#F48C42" /> {/* Orange batch */}
              </>
            )}
            {/* Orange tabby stripes */}
            {(settings.colorPreset === 'orange' || settings.colorPreset === 'gray') && (
              <>
                <path d="M7 14 H9" stroke={colors.pattern} strokeWidth="1" strokeLinecap="round" />
                <path d="M15 14 H17" stroke={colors.pattern} strokeWidth="1" strokeLinecap="round" />
              </>
            )}
            {/* Sleeping back paw tucked */}
            <circle cx="16" cy="19.5" r="1.5" fill={colors.paws} />
          </g>
        ) : (
          // Normal upright standing body
          <g>
            <path
              d="M 6 11 Q 6 19 8 20 Q 9 21 12 21 Q 15 21 16 20 Q 18 19 18 11 Z"
              fill={colors.fur}
            />
            {/* Belly patch */}
            <path
              d="M 9 14 Q 12 11 15 14 Q 16 17 15 20 Q 12 21 9 20 Q 8 17 9 14"
              fill={settings.colorPreset === 'black' ? '#2F2F3B' : '#FFFFFF'}
              opacity="0.85"
            />
            {/* Calico blotches */}
            {settings.colorPreset === 'calico' && (
              <>
                <path d="M6 14 Q 8 13 8 17 Q 6 17 6 14" fill={colors.pattern} />
                <path d="M16 13 Q 17 14 18 17 Q 16 16 16 13" fill="#F48C42" />
              </>
            )}
            {/* Tabby stripes */}
            {(settings.colorPreset === 'orange' || settings.colorPreset === 'gray') && (
              <>
                <path d="M 5.8 13 L 7.5 13.5" stroke={colors.pattern} strokeWidth="1" />
                <path d="M 18.2 13 L 16.5 13.5" stroke={colors.pattern} strokeWidth="1" />
                <path d="M 5.9 16 L 7.2 16.2" stroke={colors.pattern} strokeWidth="1" />
                <path d="M 18.1 16 L 16.8 16.2" stroke={colors.pattern} strokeWidth="1" />
              </>
            )}
          </g>
        )}

        {/* --- REAR & FRONT PAWS --- */}
        {state !== 'sleeping' && (
          <g>
            {/* Left Paw */}
            <ellipse
              cx={state === 'walking' && typingStep % 2 === 0 ? "7.5" : "8"}
              cy={state === 'walking' && typingStep % 2 === 0 ? "19.5" : "20.5"}
              rx="1.5"
              ry="1"
              fill={colors.paws}
            />
            {/* Right Paw */}
            <ellipse
              cx={state === 'walking' && typingStep % 2 === 1 ? "16.5" : "16"}
              cy={state === 'walking' && typingStep % 2 === 1 ? "19.5" : "20.5"}
              rx="1.5"
              ry="1"
              fill={colors.paws}
            />
          </g>
        )}

        {/* --- HEAD AND EARS --- */}
        <g style={{
          transform: `translate(${fx}px, ${fy + sleepingYOffset + headBounce}px)`,
          transition: 'transform 0.08s ease-out'
        }}>
          {/* Left Ear */}
          <polygon
            points="4,3 9,8 4,11"
            fill={colors.fur}
          />
          <polygon
            points="4.8,4.5 8,8 4.8,10.2"
            fill={colors.ears}
          />

          {/* Right Ear */}
          <polygon
            points="20,3 15,8 20,11"
            fill={colors.fur}
          />
          <polygon
            points="19.2,4.5 16,8 19.2,10.2"
            fill={colors.ears}
          />

          {/* Head Shape */}
          <ellipse cx="12" cy="10" rx="7.5" ry="5.8" fill={colors.fur} />

          {/* ACCESSORIES ON HEAD */}
          {settings.equippedAccessory === 'santa' && (
            <g style={{ transform: 'translate(0, -1px)' }}>
              {/* Santa hat cone */}
              <polygon points="6,5 18,5 12,0" fill="#EF4444" />
              {/* White fluff base */}
              <rect x="7" y="4.2" width="10" height="2" rx="1" fill="#FFFFFF" />
              {/* Pompom */}
              <circle cx="12" cy="0" r="1.5" fill="#FFFFFF" />
            </g>
          )}

          {settings.equippedAccessory === 'wizard' && (
            <g style={{ transform: 'translate(0, -1px)' }}>
              {/* Wizard hat cone */}
              <polygon points="6,5 18,5 12,-2" fill="#6366F1" />
              {/* Hat brim */}
              <ellipse cx="12" cy="5.2" rx="6.5" ry="1.2" fill="#4F46E5" />
              {/* Star on hat */}
              <circle cx="12" cy="1.5" r="1" fill="#FBBF24" />
            </g>
          )}

          {settings.equippedAccessory === 'bowtie' && (
            <g style={{ transform: 'translate(12px, 13.5px)' }}>
              {/* Cute red bowtie */}
              <polygon points="-4,-2 0,0 -4,2" fill="#EF4444" />
              <polygon points="4,-2 0,0 4,2" fill="#EF4444" />
              <circle cx="0" cy="0" r="1.5" fill="#EF4444" />
            </g>
          )}

          {/* Calico / Tabby markings on head */}
          {settings.colorPreset === 'calico' && (
            <>
              {/* Black patch over left ear/eye side */}
              <path d="M 4.5 9 Q 8 6 9.5 11 Q 6 13 4.5 9" fill={colors.pattern} />
              {/* Orange patch over right ear/eye side */}
              <path d="M 19.5 9 Q 16 6 14.5 11 Q 18 13 19.5 9" fill="#F48C42" />
            </>
          )}

          {(settings.colorPreset === 'orange' || settings.colorPreset === 'gray') && (
            <>
              {/* Striped forehead crown */}
              <path d="M12 4.2 L12 6" stroke={colors.pattern} strokeWidth="1" />
              <path d="M10 4.5 L10.5 6" stroke={colors.pattern} strokeWidth="1" />
              <path d="M14 4.5 L13.5 6" stroke={colors.pattern} strokeWidth="1" />
              {/* Cheek stripes */}
              <path d="M4.8 10 L 6.5 10.2" stroke={colors.pattern} strokeWidth="0.8" />
              <path d="M19.2 10 L 17.5 10.2" stroke={colors.pattern} strokeWidth="0.8" />
            </>
          )}

          {/* --- FACE DETAILS --- */}
          {/* Blush Cheeks when excited */}
          {isExcited && (
            <>
              <circle cx="7.5" cy="11.5" r="1.2" fill="#FF8BA7" opacity="0.8" />
              <circle cx="16.5" cy="11.5" r="1.2" fill="#FF8BA7" opacity="0.8" />
            </>
          )}

          {/* EYES */}
          <g>
            {settings.equippedAccessory === 'sunglasses' && !showClosedEyes ? (
              <g style={{ transform: 'translate(0, 0.5px)' }}>
                {/* Sunglasses frame */}
                <rect x="6" y="8.5" width="12" height="2" rx="0.5" fill="#111111" />
                {/* Left Lens */}
                <rect x="6.8" y="9.2" width="3.5" height="2" rx="0.8" fill="#1E1E1E" stroke="#111111" strokeWidth="0.5" />
                {/* Right Lens */}
                <rect x="13.7" y="9.2" width="3.5" height="2" rx="0.8" fill="#1E1E1E" stroke="#111111" strokeWidth="0.5" />
                {/* Glint line */}
                <line x1="7.5" y1="9.5" x2="8.5" y2="10.5" stroke="#FFFFFF" strokeWidth="0.5" />
                <line x1="14.5" y1="9.5" x2="15.5" y2="10.5" stroke="#FFFFFF" strokeWidth="0.5" />
              </g>
            ) : showClosedEyes ? (
              // Closed (happy arc or sleeping flat line)
              <>
                <path
                  d="M 7.5 10 Q 9 9 10.5 10"
                  stroke={colors.snout}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M 13.5 10 Q 15 9 16.5 10"
                  stroke={colors.snout}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </>
            ) : isSurprised ? (
              // Big round shocked eyes!
              <>
                <circle cx="9" cy="9.5" r="2.2" fill="#FFFFFF" />
                <circle cx="9" cy="9.5" r="1.2" fill={colors.eyes} />
                <circle cx="9" cy="9.5" r="0.5" fill="#000000" />
                {/* Shiny glint */}
                <circle cx="8.4" cy="8.9" r="0.4" fill="#FFFFFF" />

                <circle cx="15" cy="9.5" r="2.2" fill="#FFFFFF" />
                <circle cx="15" cy="9.5" r="1.2" fill={colors.eyes} />
                <circle cx="15" cy="9.5" r="0.5" fill="#000000" />
                <circle cx="14.4" cy="8.9" r="0.4" fill="#FFFFFF" />
              </>
            ) : isExcited ? (
              // Heart-shaped eyes or starry sparkles!
              <>
                <path d="M 7.5 8.5 C 7.5 7.5, 9.5 7.5, 9 9.5 C 8.5 7.5, 10.5 7.5, 10.5 8.5 L 9 11.2 Z" fill="#E63946" style={{ transform: 'scale(0.85)', transformOrigin: '9px 9.5px' }} />
                <path d="M 13.5 8.5 C 13.5 7.5, 15.5 7.5, 15 9.5 C 14.5 7.5, 16.5 7.5, 16.5 8.5 L 15 11.2 Z" fill="#E63946" style={{ transform: 'scale(0.85)', transformOrigin: '15px 9.5px' }} />
              </>
            ) : (
              // Normal customizable eyes (looking toward cursor)
              <>
                {/* Left Eye socket background */}
                <ellipse cx="9" cy="9.5" r="1.8" ry="1.9" fill="#FFFFFF" />
                {/* Iris (Dynamic pupillary gazing) */}
                <circle
                  cx={9 + (settings.enableTracking ? Math.cos(lookAngle) * lookStrength * 0.7 : 0)}
                  cy={9.5 + (settings.enableTracking ? Math.sin(lookAngle) * lookStrength * 0.5 : 0)}
                  r="1.2"
                  fill={colors.eyes}
                />
                {/* Pupil - classic vertical dark cat slit */}
                <ellipse
                  cx={9 + (settings.enableTracking ? Math.cos(lookAngle) * lookStrength * 0.8 : 0)}
                  cy={9.5 + (settings.enableTracking ? Math.sin(lookAngle) * lookStrength * 0.6 : 0)}
                  rx="0.4"
                  ry="1.1"
                  fill="#111111"
                />
                {/* Tiny glint reflection */}
                <circle
                  cx={8.5 + (settings.enableTracking ? Math.cos(lookAngle) * lookStrength * 0.6 : 0)}
                  cy={9.0 + (settings.enableTracking ? Math.sin(lookAngle) * lookStrength * 0.4 : 0)}
                  r="0.4"
                  fill="#FFFFFF"
                />

                {/* Right Eye */}
                <ellipse cx="15" cy="9.5" r="1.8" ry="1.9" fill="#FFFFFF" />
                <circle
                  cx={15 + (settings.enableTracking ? Math.cos(lookAngle) * lookStrength * 0.7 : 0)}
                  cy={9.5 + (settings.enableTracking ? Math.sin(lookAngle) * lookStrength * 0.5 : 0)}
                  r="1.2"
                  fill={colors.eyes}
                />
                <ellipse
                  cx={15 + (settings.enableTracking ? Math.cos(lookAngle) * lookStrength * 0.8 : 0)}
                  cy={9.5 + (settings.enableTracking ? Math.sin(lookAngle) * lookStrength * 0.6 : 0)}
                  rx="0.4"
                  ry="1.1"
                  fill="#111111"
                />
                <circle
                  cx={14.5 + (settings.enableTracking ? Math.cos(lookAngle) * lookStrength * 0.6 : 0)}
                  cy={9.0 + (settings.enableTracking ? Math.sin(lookAngle) * lookStrength * 0.4 : 0)}
                  r="0.4"
                  fill="#FFFFFF"
                />
              </>
            )}
          </g>

          {/* SNOUT & NOSE */}
          <polygon
            points="11.2,11.5 12.8,11.5 12,12.2"
            fill="#FFAAA6"
          />
          {/* Whiskers mouth / Smile arc */}
          {state === 'sleeping' ? (
            <path
              d="M 11 12.5 Q 12 13.5 13 12.5"
              stroke={colors.snout}
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M 10.5 12.5 Q 12 14.2 13.5 12.5 M 12 12 L 12 13"
              stroke={colors.snout}
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          )}

          {/* WHISKERS */}
          {state !== 'sleeping' && (
            <g opacity="0.7">
              {/* Left whiskers */}
              <line x1="4.5" y1="11.8" x2="1" y2="11.5" stroke={colors.snout} strokeWidth="0.6" />
              <line x1="4.5" y1="12.5" x2="1.5" y2="13.2" stroke={colors.snout} strokeWidth="0.6" />
              {/* Right whiskers */}
              <line x1="19.5" y1="11.8" x2="23" y2="11.5" stroke={colors.snout} strokeWidth="0.6" />
              <line x1="19.5" y1="12.5" x2="22.5" y2="13.2" stroke={colors.snout} strokeWidth="0.6" />
            </g>
          )}

          {/* SPEECH BUBBLE FOR MEOWING OUTSIDE OF HEAD */}
        </g>

        {/* --- TYPING SPRITES / KEYBOARD PAWS LAYER --- */}
        {state === 'typing' && (
          <g>
            {/* Animated Keycaps resting on table desk */}
            {/* Left Keycap */}
            <rect
              x="5"
              y="16.5"
              width="4.5"
              height="3.5"
              rx="0.8"
              fill="#E1E5F2"
              stroke="#8D99AE"
              strokeWidth="0.8"
              style={{
                transform: typingStep % 2 === 0 ? 'translateY(1.2px) scaleY(0.7)' : 'none',
                transformOrigin: '7.25px 18.25px',
                transition: 'transform 0.05s linear',
              }}
            />
            {/* Right Keycap */}
            <rect
              x="14.5"
              y="16.5"
              width="4.5"
              height="3.5"
              rx="0.8"
              fill="#E1E5F2"
              stroke="#8D99AE"
              strokeWidth="0.8"
              style={{
                transform: typingStep % 2 === 1 ? 'translateY(1.2px) scaleY(0.7)' : 'none',
                transformOrigin: '16.75px 18.25px',
                transition: 'transform 0.05s linear',
              }}
            />

            {/* Left typing paw slamming the keys */}
            <ellipse
              cx="7.2"
              cy={typingStep % 2 === 0 ? "18" : "15"}
              rx="1.4"
              ry="1.4"
              fill={colors.paws}
              stroke={colors.pattern}
              strokeWidth="0.5"
              style={{
                transition: 'cy 0.05s ease-in-out',
              }}
            />

            {/* Right typing paw slamming the keys */}
            <ellipse
              cx="16.8"
              cy={typingStep % 2 === 1 ? "18" : "15"}
              rx="1.4"
              ry="1.4"
              fill={colors.paws}
              stroke={colors.pattern}
              strokeWidth="0.5"
              style={{
                transition: 'cy 0.05s ease-in-out',
              }}
            />
          </g>
        )}
      </svg>
    </div>
  );
}
