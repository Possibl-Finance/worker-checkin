import React from 'react';

export default function TestTailwind() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-500 mb-4">Tailwind Test Page</h1>
      <div className="bg-gray-900 text-white p-6 rounded-lg mb-4">
        <p>This is a dark background with white text</p>
      </div>
      <div className="bg-orange-500 text-white p-6 rounded-lg mb-4">
        <p>This is an orange background with white text</p>
      </div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Test Button
      </button>
    </div>
  );
}
