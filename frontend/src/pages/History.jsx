import React, { useEffect, useState } from 'react';
import { marked } from 'marked'; // Assuming 'marked' library is installed or will be installed

const History = () => {
  const [regularRuns, setRegularRuns] = useState([]);
  const [pentestRuns, setPentestRuns] = useState([]);
  const [expandedRunId, setExpandedRunId] = useState(null);
  const [expandedPentestId, setExpandedPentestId] = useState(null);

  useEffect(() => {
    fetch('/api/runs')
      .then(response => response.json())
      .then(data => setRegularRuns(data));

    fetch('/api/pentest-runs')
      .then(response => response.json())
      .then(data => setPentestRuns(data));
  }, []);

  const toggleRegularRunDetails = (id) => {
    setExpandedRunId(expandedRunId === id ? null : id);
  };

  const togglePentestRunDetails = (id) => {
    setExpandedPentestId(expandedPentestId === id ? null : id);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Run History</h1>

      {/* Regular Runs Section */}
      <h2 className="text-3xl font-bold text-gray-700 mb-6">Regular Runs</h2>
      <div className="bg-white shadow-lg rounded-lg p-6 mb-12">
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regularRuns.map((run) => (
              <React.Fragment key={run.id}>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">{run.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{run.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{run.instruction}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {run.video_url && (
                      <a href={`/video/${run.video_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mr-4">
                        View Video
                      </a>
                    )}
                    <button
                      onClick={() => toggleRegularRunDetails(run.id)}
                      className="text-blue-500 hover:underline focus:outline-none"
                    >
                      {expandedRunId === run.id ? 'Hide Info' : 'Show More Info'}
                    </button>
                  </td>
                </tr>
                {expandedRunId === run.id && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4">
                      <div className="bg-gray-100 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Logs:</h3>
                        <pre className="whitespace-pre-wrap text-sm">{run.logs}</pre>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Penetration Test Reports Section */}
      <h2 className="text-3xl font-bold text-gray-700 mb-6">Penetration Test Reports</h2>
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pentestRuns.map((run) => (
              <React.Fragment key={run.id}>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">{run.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{run.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{run.instruction}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {run.video_url && (
                      <a href={`/video/${run.video_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline mr-4">
                        View Video
                      </a>
                    )}
                    <button
                      onClick={() => togglePentestRunDetails(run.id)}
                      className="text-blue-500 hover:underline focus:outline-none"
                    >
                      {expandedPentestId === run.id ? 'Hide Info' : 'Show More Info'}
                    </button>
                  </td>
                </tr>
                {expandedPentestId === run.id && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4">
                      <div className="bg-gray-100 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">Report:</h3>
                        <div className="space-y-4">
                          {run.report ? (
                            (() => {
                              let parsedReport;
                              try {
                                parsedReport = JSON.parse(run.report);
                              } catch (e) {
                                console.error("Failed to parse report JSON:", e);
                                return <p>Error parsing report.</p>;
                              }
                              
                              if (parsedReport && parsedReport.vulnerabilities && parsedReport.vulnerabilities.length > 0) {
                                return parsedReport.vulnerabilities.map((vuln, index) => (
                                  <div key={index} className="bg-gray-200 p-3 rounded-md">
                                    <p className="font-semibold">Label: <span className="font-normal">{vuln.label}</span></p>
                                    <p className="font-semibold">Severity: <span className="font-normal">{vuln.severity}</span></p>
                                    <p className="font-semibold">OWASP Category: <span className="font-normal">{vuln.owasp_category}</span></p>
                                    <p className="font-semibold">Description: </p>
                                    <div className="font-normal" dangerouslySetInnerHTML={{ __html: marked(vuln.description) }}></div>
                                  </div>
                                ));
                              } else {
                                return <p>No vulnerabilities found.</p>;
                              }
                            })()
                          ) : (
                            <p>No vulnerabilities found.</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
