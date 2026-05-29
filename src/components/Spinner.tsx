export default function Spinner({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <svg className="spinner" viewBox="0 0 50 50" width={size} height={size} aria-hidden>
        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
      </svg>
    </div>
  );
}
