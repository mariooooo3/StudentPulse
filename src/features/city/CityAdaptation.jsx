import StudentTransport from './StudentTransport'

export default function CityAdaptation({ profile, session, onNavigate }) {
  return (
    <div>
      <StudentTransport
        profile={profile}
        session={session}
        onBack={() => onNavigate('discounts', 'life')}
        onNavigate={onNavigate}
      />
    </div>
  )
}
