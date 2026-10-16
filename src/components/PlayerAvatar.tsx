import React from 'react';
import { DEFAULT_AVATAR, type PlayerAvatar } from '../lib/rewards';

export default function PlayerAvatar({ avatar, size = 96, className = '' }: { avatar?: Partial<PlayerAvatar>; size?: number; className?: string }) {
  const a = { ...DEFAULT_AVATAR, ...(avatar || {}) };
  const hairVisible = a.hairStyle !== 'bald';
  return (
    <svg role="img" aria-label={`Custom football avatar number ${a.jerseyNumber}`} width={size} height={size * 1.12} viewBox="0 0 120 134" className={className} style={{ display: 'block', maxWidth: '100%' }}>
      <ellipse cx="60" cy="126" rx="35" ry="5" fill="#000" opacity=".2" />
      <path d="M40 91 L35 119 L53 119 L60 96 L67 119 L85 119 L80 91Z" fill={a.jerseyColor} stroke="#07111f" strokeWidth="3" strokeLinejoin="round" />
      <path d="M36 116 L54 116 L53 125 L31 125Z M66 116 L84 116 L89 125 L67 125Z" fill={a.cleatsColor} stroke="#07111f" strokeWidth="3" strokeLinejoin="round" />
      <path d="M30 48 Q17 47 20 67 L28 87 L42 80 L39 58Z M90 48 Q103 47 100 67 L92 87 L78 80 L81 58Z" fill={a.skinTone} stroke="#07111f" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 48 Q60 34 92 48 L85 91 Q60 103 35 91Z" fill={a.jerseyColor} stroke="#07111f" strokeWidth="3" strokeLinejoin="round" />
      <path d="M42 49 L49 64 L60 54 L71 64 L78 49" fill="none" stroke={a.facemaskColor} strokeWidth="4" strokeLinecap="round" />
      <text x="60" y="82" textAnchor="middle" fontSize="24" fontWeight="900" fontFamily="Arial, sans-serif" fill="#fff" stroke="#07111f" strokeWidth=".6">{a.jerseyNumber || '77'}</text>
      <rect x="45" y="30" width="30" height="24" rx="10" fill={a.skinTone} stroke="#07111f" strokeWidth="3" />
      {hairVisible && <path d={a.hairStyle === 'curly' ? 'M38 22 Q31 7 43 10 Q49 1 58 8 Q70 0 76 12 Q88 11 82 27Z' : a.hairStyle === 'long' ? 'M37 19 Q60 -1 83 19 L86 43 L77 50 L76 24 L44 24 L43 50 L34 42Z' : 'M39 18 Q60 4 81 18 L77 28 L43 28Z'} fill="#241b18" />}
      <ellipse cx="60" cy="26" rx="22" ry="23" fill={a.skinTone} stroke="#07111f" strokeWidth="3" />
      <path d="M38 24 Q34 2 60 3 Q86 2 82 24 L76 17 Q60 10 44 18Z" fill={a.helmetColor} stroke="#07111f" strokeWidth="3" />
      <path d="M35 23 Q60 17 85 23 L84 31 Q60 27 36 31Z" fill={a.facemaskColor} stroke="#07111f" strokeWidth="2.5" />
      <path d="M42 28 L39 41 Q60 51 81 41 L78 28" fill="none" stroke={a.facemaskColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M41 34 L79 34 M43 40 L77 40" stroke={a.facemaskColor} strokeWidth="2" />
      {a.visor !== 'clear' && <path d="M40 23 Q60 16 80 23 L77 31 L43 31Z" fill={a.visor === 'gold' ? '#D5B15C' : '#101827'} opacity=".88" />}
      {a.accessory === 'captain' && <path d="M29 49 L40 43 L45 51 L34 57Z" fill="#D5B15C" stroke="#07111f" strokeWidth="2" />}
      {a.accessory === 'chain' && <path d="M45 51 Q60 65 75 51" fill="none" stroke="#f2d16b" strokeWidth="3" />}
      {a.accessory === 'headband' && <path d="M39 17 Q60 9 81 17 L80 22 Q60 15 40 22Z" fill="#f2d16b" />}
    </svg>
  );
}
