import React, { useEffect, useState } from "react";
import { getTestResults } from "../../services/testResults";

const PreviousTestResultDataList = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        const data = await getTestResults();
        setResults(data);
      } catch (err) {
        console.error("❌ Failed to load results:", err);
        setError("Failed to load test results");
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, []);

  if (loading) return <p className="text-gray-500">Loading results...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
      <h2 className="text-lg font-semibold mb-4">Previous Test Results</h2>

      {results.length === 0 ? (
        <p className="text-gray-500">No results found.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Duration</th>
              <th className="px-3 py-2 text-left">WPM</th>
              <th className="px-3 py-2 text-left">Accuracy</th>
              <th className="px-3 py-2 text-left">Mistakes</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r._id}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="px-3 py-2">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">{r.duration}s</td>
                <td className="px-3 py-2">{r.wpm}</td>
                <td className="px-3 py-2">{r.accuracy}%</td>
                <td className="px-3 py-2">{r.mistakes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PreviousTestResultDataList;
