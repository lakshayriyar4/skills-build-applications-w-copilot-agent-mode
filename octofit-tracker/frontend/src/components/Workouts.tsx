import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Suggestion {
  title: string;
  focus: string;
  minutes: number;
  difficulty: string;
  reason: string;
}

const demoEmail = 'mona@example.com';

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ suggestions: Suggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent(demoEmail)}`)
      .then((data) => {
        setSuggestions(data.suggestions);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p role="status">Loading...</p></div></section>;

  if (error) return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p role="alert">Error: {error}</p></div></section>;

  if (suggestions.length === 0) return <section className="card h-100"><div className="card-body"><h2 className="h4">Workout suggestions</h2><p>Recommend workouts from activity patterns.</p><p role="status">No workout suggestions available yet.</p></div></section>;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        <div className="list-group">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="list-group-item">
              <h5>{suggestion.title}</h5>
              <p className="mb-1">Focus: {suggestion.focus}</p>
              <p className="mb-1">Duration: {suggestion.minutes} minutes ({suggestion.difficulty})</p>
              <p className="mb-0 text-muted">{suggestion.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
