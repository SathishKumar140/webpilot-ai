import React, { useEffect, useState } from 'react';

const History = () => {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    fetch('/api/runs')
      .then(response => response.json())
      .then(data => setRuns(data));
  }, []);

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Run History</h1>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instruction
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Video
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {runs.map((run) => (
              <tr key={run.id}>
                <td className="px-6 py-4 whitespace-nowrap">{run.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{run.url}</td>
                <td className="px-6 py-4 whitespace-nowrap">{run.instruction}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {run.video_url && (
                    <a href={`/video/${run.video_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      View Video
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
