import { ImageResponse } from 'next/og';

export const alt = 'Hummingbird Storyhouse — Stories don’t sit still. Neither do we.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: '#080B14', color: '#F8F7FC', display: 'flex', flexDirection: 'column', fontFamily: 'serif', height: '100%', justifyContent: 'space-between', padding: '72px 80px', position: 'relative', width: '100%' }}>
      <div style={{ background: '#A855F7', borderRadius: 999, filter: 'blur(90px)', height: 260, opacity: 0.35, position: 'absolute', right: 10, top: 10, width: 260 }} />
      <div style={{ color: '#36E4DA', display: 'flex', fontFamily: 'sans-serif', fontSize: 22, letterSpacing: 4, textTransform: 'uppercase' }}>Hummingbird Storyhouse</div>
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 92, letterSpacing: -4, lineHeight: 0.88 }}>
        <span>Stories don’t sit still.</span>
        <span style={{ color: '#FF5C7A' }}>Neither do we.</span>
      </div>
      <div style={{ color: '#A9A7BA', display: 'flex', fontFamily: 'sans-serif', fontSize: 24 }}>Culture × Storytelling × Media Systems</div>
    </div>,
    size
  );
}
