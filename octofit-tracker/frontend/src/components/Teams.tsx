import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Team {
  _id: string;
  name: string;
  mascot: string;
  members: string[];
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => {
        setTeams(data.teams);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p role="status">Loading...</p></div></section>;

  if (error) return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p role="alert">Error: {error}</p></div></section>;

  if (teams.length === 0) return <section className="card h-100"><div className="card-body"><h2 className="h4">Teams</h2><p>Manage teams and members.</p><p role="status">No teams created yet.</p></div></section>;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        <div className="list-group">
          {teams.map((team) => (
            <div key={team._id} className="list-group-item">
              <h5>{team.name}</h5>
              <p className="mb-1">Mascot: {team.mascot}</p>
              <p className="mb-0">Members: {team.members.length}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
