import React, { useEffect, useRef, useState } from 'react';

function Home() {
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [url, setUrl] = useState('https://www.google.com/travel/flights'); // Default URL
  const [instruction, setInstruction] = useState('find chepeast flights from bangalore to singapore on septemeber'); // Default instruction
  const [isRunning, setIsRunning] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    const backendHost = window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${backendHost}/ws`);

    ws.current.onopen = () => {
      console.log('WebSocket connection established.');
      setLogs(prevLogs => [...prevLogs, { source: 'client', message: '[CLIENT] WebSocket connection established.' }]);
    };

    ws.current.onmessage = event => {
      console.log('Message received from server:', event.data);
      if (event.data instanceof Blob) {
        console.log('Received Blob, creating object URL.');
        const url = URL.createObjectURL(event.data);
        setImageUrl(url);
      } else {
        if (event.data.startsWith('[VIDEO]')) {
          const backendHost = window.location.host;
          const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
          const videoPath = event.data.split('/')[1];
          setVideoUrl(`${protocol}//${backendHost}/video/${videoPath}`);
        } else if (event.data === '[DONE]') {
          setIsRunning(false);
          setLogs(prevLogs => [...prevLogs, { source: 'client', message: '[CLIENT] Task finished.' }]);
        } else {
          console.log('Received text message.');
          setLogs(prevLogs => [...prevLogs, { source: 'server', message: `[SERVER] ${event.data}` }]);
        }
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setLogs(prevLogs => [...prevLogs, { source: 'client', message: '[ERROR] Disconnected from WebSocket server' }]);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setLogs(prevLogs => [...prevLogs, { source: 'client', message: `[ERROR] WebSocket error: ${error.message}` }]);
    };

    // The cleanup function is removed to prevent React's Strict Mode
    // from closing the connection prematurely in development.
    // return () => {
    //   ws.current.close();
    // };
  }, []);

  const runAgent = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      setIsRunning(true);
      setLogs(prevLogs => [...prevLogs, { source: 'client', message: '[CLIENT] Sending agent task...' }]);
      const settings = JSON.parse(localStorage.getItem('settings')) || {};
      const task = { url, instruction, ...settings };
      ws.current.send(JSON.stringify(task));
    } else {
      setLogs(prevLogs => [...prevLogs, { source: 'client', message: '[CLIENT] WebSocket not open.' }]);
    }
  };

  return (
    <div className="flex space-x-8">
      {/* Left Column */}
      <div className="w-1/3 bg-white shadow-2xl rounded-xl p-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-6">WebPilot AI</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="url-input" className="block text-gray-700 text-sm font-bold mb-2">
              URL
            </label>
            <input
              type="text"
              id="url-input"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isRunning}
            />
          </div>
          <div>
            <label htmlFor="instruction-input" className="block text-gray-700 text-sm font-bold mb-2">
              Instruction
            </label>
            <textarea
              id="instruction-input"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 h-48"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              disabled={isRunning}
            ></textarea>
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={runAgent}
            className={`w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isRunning}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
            {isRunning ? 'Running...' : 'Run Agent'}
          </button>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-2/3 space-y-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Live Browser View</h2>
          <div className="flex justify-center items-center bg-gray-200 rounded-md overflow-hidden">
            {videoUrl ? (
              <video src={videoUrl} controls autoPlay className="max-w-full h-auto border-2 border-gray-300" />
            ) : imageUrl ? (
              <img src={imageUrl} className="max-w-full h-auto border-2 border-gray-300" alt="Real-time browser stream" />
            ) : (
              <p className="text-gray-500 p-4">Waiting for browser stream...</p>
            )}
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agent Logs</h2>
          <div id="logs" className="bg-gray-800 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <p key={index} className={log.source === 'client' ? 'text-blue-400' : 'text-green-400'}>
                {log.message}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
