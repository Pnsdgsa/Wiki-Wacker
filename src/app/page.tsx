"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("https://growagarden.fandom.com/wiki/Crops");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/api/raw?url=${encodeURIComponent(url)}`;
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Wiki Wacker</h1>
      <p>Paste a Fandom.com wiki page URL to extract its content.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter Fandom URL"
          style={{ width: "400px", padding: "0.5rem", fontSize: '1rem' }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", fontSize: '1rem' }}>
          Wack It!
        </button>
      </form>
    </div>
  );
}
