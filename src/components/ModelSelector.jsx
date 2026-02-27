import React from 'react'

export default function ModelSelector({ selected, onChange }) {
  const models = [
    { id: 'chatgpt', name: 'ChatGPT' },
    { id: 'llama', name: 'Meta Llama' },
    { id: 'gemini', name: 'Gemini' },
  ];

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border rounded-lg dark:bg-gray-800 dark:text-white"
    >
      {models.map(m => (
        <option key={m.id} value={m.id}>{m.name}</option>
      ))}
    </select>
  );
}