'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';

interface Sound {
  id: string;
  name: string;
  icon: string;
  url: string;
  category: 'nature' | 'noise' | 'meditation';
}

const sounds: Sound[] = [
  {
    id: 'rain',
    name: 'Rain',
    icon: '🌧️',
    url: '/sounds/rain.mp3',
    category: 'nature'
  },
  {
    id: 'thunder',
    name: 'Thunder Storm',
    icon: '⛈️',
    url: '/sounds/thunder.mp3',
    category: 'nature'
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: '🌳',
    url: '/sounds/forest.mp3',
    category: 'nature'
  },
  {
    id: 'waves',
    name: 'Ocean Waves',
    icon: '🌊',
    url: '/sounds/waves.mp3',
    category: 'nature'
  },
  {
    id: 'white-noise',
    name: 'White Noise',
    icon: '⚪',
    url: '/sounds/white-noise.mp3',
    category: 'noise'
  },
  {
    id: 'brown-noise',
    name: 'Brown Noise',
    icon: '🟤',
    url: '/sounds/brown-noise.mp3',
    category: 'noise'
  },
  {
    id: 'pink-noise',
    name: 'Pink Noise',
    icon: '🔆',
    url: '/sounds/pink-noise.mp3',
    category: 'noise'
  },
  {
    id: 'meditation',
    name: 'Meditation Bell',
    icon: '🔔',
    url: '/sounds/meditation-bell.mp3',
    category: 'meditation'
  }
];

export default function SoundTherapyPage() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.5);
  const [filter, setFilter] = useState<'all' | 'nature' | 'noise' | 'meditation'>('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio context for better control
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleSoundClick = (soundId: string) => {
    if (activeSound === soundId) {
      // Stop the sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setActiveSound(null);
    } else {
      // Play new sound
      if (audioRef.current) {
        audioRef.current.src = sounds.find(s => s.id === soundId)?.url || '';
        audioRef.current.play();
      }
      setActiveSound(soundId);
    }
  };

  const filteredSounds = filter === 'all' 
    ? sounds 
    : sounds.filter(sound => sound.category === filter);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <audio ref={audioRef} loop />

      <div className="flex-1 p-4 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Sound Therapy</h1>
          <p className="text-gray-300">
            Use these ambient sounds to help you relax, focus, or meditate. 
            Choose from various natural sounds, noise types, and meditation sounds.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-gray-300 text-sm">Volume:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-32 accent-primary"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-gray-300 text-sm">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Sounds</option>
                <option value="nature">Nature</option>
                <option value="noise">Noise</option>
                <option value="meditation">Meditation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sound Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => handleSoundClick(sound.id)}
              className={`p-4 rounded-lg flex flex-col items-center justify-center transition-all ${
                activeSound === sound.id
                  ? 'bg-primary bg-opacity-20 border-2 border-primary'
                  : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
              }`}
            >
              <span className="text-4xl mb-2">{sound.icon}</span>
              <span className="text-white font-medium">{sound.name}</span>
              <span className="text-sm text-gray-400 mt-1 capitalize">
                {sound.category}
              </span>
            </button>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Sound Therapy Tips</h2>
          <ul className="space-y-2 text-gray-300">
            <li>• Use headphones for the best experience</li>
            <li>• Start with a lower volume and adjust as needed</li>
            <li>• Try different combinations of sounds throughout your day</li>
            <li>• Use nature sounds for relaxation</li>
            <li>• Use white/brown/pink noise for focus and concentration</li>
            <li>• Use meditation sounds for mindfulness practice</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 