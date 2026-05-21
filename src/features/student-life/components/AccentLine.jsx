export default function AccentLine({ color }) {
  return (
    <div
      className="absolute left-0 right-0 top-0 h-px"
      style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }}
    />
  )
}
