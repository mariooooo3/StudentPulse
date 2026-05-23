import StudentTransport from './StudentTransport'

export default function CityAdaptation({ profile, onNavigate }) {
  return (
    <div>
      <StudentTransport profile={profile} onBack={() => {}} onNavigate={onNavigate} />
    </div>
  )
}
