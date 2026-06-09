export default function Admin({ bookings }) {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {bookings.map(b => (
        <div key={b.id}>
          {b.date} - {b.status} - {b.golfers} golfers
        </div>
      ))}
    </div>
  );
}
