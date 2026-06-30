// Eco Futures monogram: an upward energy chevron rising through a leaf form —
// "moving homes up the energy bands". Inherits colour from currentColor.
export default function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path
        d="M16 6.5c-4.4 1.1-7.5 4.6-7.5 9.1 0 3.2 1.9 5.9 4.7 7.2"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M10.5 19.5 16 14l5.5 5.5M16 14v9"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
