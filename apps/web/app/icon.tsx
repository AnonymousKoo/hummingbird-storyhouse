import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div style={{ alignItems: 'center', background: '#080B14', display: 'flex', height: '100%', justifyContent: 'center', width: '100%' }}>
      <div style={{ alignItems: 'center', border: '2px solid #A855F7', borderRadius: 32, color: '#F8F7FC', display: 'flex', fontFamily: 'serif', fontSize: 32, height: 52, justifyContent: 'center', width: 52 }}>H</div>
    </div>,
    size
  );
}
