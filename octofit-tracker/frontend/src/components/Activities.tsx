import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Activity {
  _id: string;
  user: string;
  team: string;
  type: string;
  minutes: number;
  points: number;
  occurredAt: string;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => {
        setActivities(data.activities);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p role="status">Loading...</p></div></section>;

  if (error) return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p role="alert">Error: {error}</p></div></section>;

  if (activities.length === 0) return <section className="card h-100"><div className="card-body"><h2 className="h4">Activities</h2><p>Track student activity minutes and points.</p><p role="status">No activities recorded yet.</p></div></section>;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Type</th>
              <th>Minutes</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity._id}>
                <td>{activity.type}</td>
                <td>{activity.minutes}</td>
                <td>{activity.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
