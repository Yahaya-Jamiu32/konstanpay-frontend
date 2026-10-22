const P = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z', swap: 'M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7',
  wallet: 'M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14h2', bills: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', bell: 'M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeoff: 'M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.7M6.6 7.6C3.8 9.4 2 12 2 12s4 7 10 7c1.6 0 3-.4 4.3-1M9.9 9.9a3 3 0 0 0 4.2 4.2',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4', mail: 'M3 5h18v14H3zM3 7l9 6 9-6', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  card: 'M3 6h18v12H3zM3 10h18M7 15h3', convert: 'M4 12a8 8 0 0 1 14-5l2 2M20 4v5h-5M20 12a8 8 0 0 1-14 5l-2-2M4 20v-5h5',
  withdraw: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l11-3M16 14h3', history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2L10 21h4l.6-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z',
  users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 3a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6', kyc: 'M4 4h16v16H4zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM5 17a3 3 0 0 1 6 0M14 9h4M14 13h4',
  chat: 'M4 5h16v11H9l-5 4z', audit: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  check: 'M5 12l5 5 9-10', chevron: 'M9 6l6 6-6 6', chevdown: 'M6 9l6 6 6-6', bolt: 'M13 2L4 14h7l-1 8 9-12h-7z', tv: 'M3 7h18v12H3zM8 3l4 4 4-4',
  data: 'M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M2 9.5a15 15 0 0 1 20 0', mobile: 'M7 2h10v20H7zM11 18h2', refresh: 'M20 12a8 8 0 1 1-2.3-5.7L20 8M20 3v5h-5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2', plus: 'M12 5v14M5 12h14', arrowup: 'M12 19V5M5 12l7-7 7 7', arrowdown: 'M12 5v14M5 12l7 7 7-7',
  logout: 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9', back: 'M15 18l-6-6 6-6', fee: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9h5a2 2 0 0 1 0 4H9m0 0h5a2 2 0 0 1 0 4H9M12 7v10',
  export: 'M12 3v12M8 7l4-4 4 4M5 15v5h14v-5', calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', tag: 'M3 12V3h9l9 9-9 9z',
};
export default function Icon({ name, size = 22, className = '', ...p }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d={P[name]} /></svg>;
}
export const GoogleG = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3A12 12 0 1 1 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 1 0 44 24c0-1.3-.1-2.7-.4-3.9z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7A20 20 0 0 0 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z" /><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z" /></svg>
);
