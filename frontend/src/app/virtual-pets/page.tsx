'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getAccessToken } from '@/utils/auth';
import Image from 'next/image';

interface Pet {
  id: number;
  animal_type: string;
  name: string;
  created_at: string;
}

const petTypes = [
  {
    type: 'cat',
    name: 'Cat',
    image: '/pets/cat.webp',
    description: 'A friendly and playful companion who loves to cuddle.'
  },
  {
    type: 'dog',
    name: 'Dog',
    image: '/pets/dog.webp',
    description: 'A loyal and energetic friend who\'s always excited to see you.'
  },
  {
    type: 'rabbit',
    name: 'Rabbit',
    image: '/pets/rabbit.webp',
    description: 'A gentle and curious pet who brings calm energy.'
  },
  {
    type: 'hamster',
    name: 'Hamster',
    image: '/pets/hamster.webp',
    description: 'A tiny bundle of joy who loves to explore.'
  },
  {
    type: 'bird',
    name: 'Bird',
    image: '/pets/bird.webp',
    description: 'A cheerful companion who fills your day with song.'
  }
];

export default function VirtualPetsPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [petName, setPetName] = useState('');

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch('http://localhost:8000/api/virtual-pets/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pets');
      }

      const data = await response.json();
      setPets(data.pets);
    } catch (error) {
      console.error('Error fetching pets:', error);
      setError('Failed to load pets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createPet = async () => {
    if (!selectedType || !petName.trim()) {
      setError('Please select a pet type and enter a name.');
      return;
    }

    try {
      const token = getAccessToken();
      const response = await fetch('http://localhost:8000/api/virtual-pets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          animal_type: selectedType,
          name: petName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create pet');
      }

      // Refresh pet list
      await fetchPets();
      setIsCreating(false);
      setPetName('');
      setSelectedType('');
    } catch (error) {
      console.error('Error creating pet:', error);
      setError('Failed to create pet. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Virtual Pets</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-pink-400/80 text-white rounded-md hover:bg-pink-500 transition-colors"
          >
            Create New Pet
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Create Pet Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-white mb-6">Create a New Pet</h2>
              
              {/* Pet Type Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {petTypes.map((pet) => (
                  <button
                    key={pet.type}
                    onClick={() => setSelectedType(pet.type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedType === pet.type
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="relative w-full aspect-square mb-3">
                      <Image
                        src={pet.image}
                        alt={pet.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={true}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{pet.name}</h3>
                    <p className="text-sm text-gray-400">{pet.description}</p>
                  </button>
                ))}
              </div>

              {/* Pet Name Input */}
              <div className="mb-6">
                <label className="block text-white mb-2">Pet Name</label>
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Enter your pet's name"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setPetName('');
                    setSelectedType('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createPet}
                  className="px-4 py-2 bg-pink-400/80 text-white rounded-md hover:bg-pink-500 transition-colors"
                >
                  Create Pet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pet List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-2 border-pink-500 border-t-transparent rounded-full"></div>
          </div>
        ) : pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => {
              const petType = petTypes.find(t => t.type === pet.animal_type);
              return (
                <div
                  key={pet.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 hover:border-pink-500/50 transition-all group"
                >
                  <div className="relative w-full aspect-square mb-4">
                    <Image
                      src={petType?.image || '/pets/default.webp'}
                      alt={pet.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-pink-400 transition-colors">
                    {pet.name}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {petType?.name || pet.animal_type}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Created {formatDate(pet.created_at)}
                    </span>
                    <button
                      onClick={() => router.push(`/virtual-pets/${pet.id}`)}
                      className="px-4 py-2 bg-pink-400/80 text-white rounded-md hover:bg-pink-500 transition-colors"
                    >
                      Chat Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">No Pets Yet</h3>
            <p className="text-gray-400 mb-6">Create your first virtual pet to start chatting!</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-pink-400/80 text-white rounded-md hover:bg-pink-500 transition-colors"
            >
              Create Your First Pet
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 