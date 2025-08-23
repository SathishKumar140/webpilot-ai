import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [model, setModel] = useState('gemini');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('settings'));
    if (settings) {
      setModel(settings.model || 'gemini');
      setOpenaiApiKey(settings.openaiApiKey || '');
      setGeminiApiKey(settings.geminiApiKey || '');
      setOpenaiModel(settings.openaiModel || 'gpt-4o');
      setGeminiModel(settings.geminiModel || 'gemini-2.5-flash');
    }
  }, []);

  const handleSave = () => {
    const settings = { model, openaiApiKey, geminiApiKey, openaiModel, geminiModel };
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('Settings saved!');
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Settings</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg mx-auto">
        <div className="mb-6">
          <label htmlFor="model-select" className="block text-gray-700 text-sm font-bold mb-2">
            Select Model
          </label>
          <select
            id="model-select"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        {model === 'openai' && (
          <>
            <div className="mb-6">
              <label htmlFor="openai-model" className="block text-gray-700 text-sm font-bold mb-2">
                OpenAI Model
              </label>
              <select
                id="openai-model"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={openaiModel}
                onChange={(e) => setOpenaiModel(e.target.value)}
              >
                <option value="gpt-5">GPT-5</option>
                <option value="gpt-5-mini">GPT-5 mini</option>
                <option value="gpt-5-nano">GPT-5 nano</option>
                <option value="o3-deep-research">o3-deep-research</option>
                <option value="o4-mini-deep-research">o4-mini-deep-research</option>
                <option value="o3-pro">o3-pro</option>
                <option value="gpt-4o-audio">GPT-4o Audio</option>
                <option value="gpt-4o-realtime">GPT-4o Realtime</option>
                <option value="o3">o3</option>
                <option value="o4-mini">o4-mini</option>
                <option value="gpt-4.1">GPT-4.1</option>
                <option value="gpt-4.1-mini">GPT-4.1 mini</option>
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor="openai-api-key" className="block text-gray-700 text-sm font-bold mb-2">
                OpenAI API Key
              </label>
              <input
                type="password"
                id="openai-api-key"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
              />
            </div>
          </>
        )}
        {model === 'gemini' && (
          <>
            <div className="mb-6">
              <label htmlFor="gemini-model" className="block text-gray-700 text-sm font-bold mb-2">
                Gemini Model
              </label>
              <select
                id="gemini-model"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
              >
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite</option>
                <option value="gemini-live-2.5-flash-preview">Gemini 2.5 Flash Live</option>
                <option value="gemini-2.5-flash-preview-native-audio-dialog">Gemini 2.5 Flash Native Audio</option>
                <option value="gemini-2.5-flash-preview-tts">Gemini 2.5 Flash Preview TTS</option>
                <option value="gemini-2.5-pro-preview-tts">Gemini 2.5 Pro Preview TTS</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</option>
                <option value="gemini-2.0-flash-live-001">Gemini 2.0 Flash Live</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor="gemini-api-key" className="block text-gray-700 text-sm font-bold mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                id="gemini-api-key"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
              />
            </div>
          </>
        )}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
