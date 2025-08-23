import React, { useEffect, useRef, useState } from 'react';

function App() {
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [logs, setLogs] = useState([]);
  const [url, setUrl] = useState('https://www.google.com/travel/flights'); // Default URL
  const [instruction, setInstruction] = useState('find chepeast flights from bangalore to singapore on septemeber'); // Default instruction
  const [isRunning, setIsRunning] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/ws');

    ws.current.onopen = () => {
      console.log('WebSocket connection established.');
      setLogs(prevLogs => [...prevLogs, '[CLIENT] WebSocket connection established.']);
    };

    ws.current.onmessage = event => {
      console.log('Message received from server:', event.data);
      if (event.data instanceof Blob) {
        console.log('Received Blob, creating object URL.');
        const url = URL.createObjectURL(event.data);
        setImageUrl(url);
        setLogs(prevLogs => [...prevLogs, '[CLIENT] Received screenshot.']);
      } else {
        if (event.data.startsWith('[VIDEO]')) {
          const videoPath = event.data.split('/')[1];
          setVideoUrl(`http://localhost:8000/video/${videoPath}`);
        } else {
          console.log('Received text message.');
          setLogs(prevLogs => [...prevLogs, `[SERVER] ${event.data}`]);
        }
      }
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setLogs(prevLogs => [...prevLogs, '[ERROR] Disconnected from WebSocket server']);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setLogs(prevLogs => [...prevLogs, `[ERROR] WebSocket error: ${error.message}`]);
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
      setLogs(prevLogs => [...prevLogs, '[CLIENT] Sending agent task...']);
      const task = { url, instruction };
      ws.current.send(JSON.stringify(task));
      // The task is now running, but we don't have a direct signal for when it's done.
      // We can set a timeout to re-enable the button, or wait for a "finished" message.
      // For now, a simple timeout will suffice.
      setTimeout(() => setIsRunning(false), 12000); // 12 seconds, to account for streaming
    } else {
      setLogs(prevLogs => [...prevLogs, '[CLIENT] WebSocket not open.']);
    }
  };

  return (
    <div className="bg-gray-100 flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Real-time Browser Automation Dashboard</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl w-full">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agent Control</h2>
        <div className="mb-4">
          <label htmlFor="url-input" className="block text-gray-700 text-sm font-bold mb-2">
            URL:
          </label>
          <input
            type="text"
            id="url-input"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isRunning}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="instruction-input" className="block text-gray-700 text-sm font-bold mb-2">
            Instruction:
          </label>
          <textarea
            id="instruction-input"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isRunning}
          ></textarea>
        </div>
        <div className="flex justify-center mb-8">
          <button
            onClick={runAgent}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isRunning}
          >
            {isRunning ? 'Running Agent...' : 'Run Agent'}
          </button>
        </div>

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
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agent Logs</h2>
          <div id="logs" className="bg-gray-800 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
