'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getAccessToken } from '@/utils/auth';
import Image from 'next/image';

interface Message {
  id: number;
  message: string;
  is_user: boolean;
  timestamp: string;
}

interface Pet {
  id: number;
  animal_type: string;
  name: string;
  created_at: string;
}

const petTypes = {
  cat: {
    image: '/pets/cat.webp',
    name: 'Cat',
  },
  dog: {
    image: '/pets/dog.webp',
    name: 'Dog',
  },
  rabbit: {
    image: '/pets/rabbit.webp',
    name: 'Rabbit',
  },
  hamster: {
    image: '/pets/hamster.webp',
    name: 'Hamster',
  },
  bird: {
    image: '/pets/bird.webp',
    name: 'Bird',
  },
};

export default function PetChatPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params?.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!petId) {
      router.push('/virtual-pets');
      return;
    }
    fetchPetDetails();
    fetchChatHistory();
  }, [petId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPetDetails = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(`http://localhost:8000/api/virtual-pets/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pet details');
      }

      const data = await response.json();
      const foundPet = data.pets.find((p: Pet) => p.id === Number(petId));
      if (foundPet) {
        setPet(foundPet);
      } else {
        router.push('/virtual-pets');
      }
    } catch (error) {
      console.error('Error fetching pet details:', error);
      setError('Failed to load pet details');
    }
  };

  const fetchChatHistory = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        `http://localhost:8000/api/virtual-pets/${petId}/chat-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = getAccessToken();
      const response = await fetch(
        `http://localhost:8000/api/virtual-pets/${petId}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: newMessage.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Add user message immediately
      const timestamp = new Date().toISOString();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: newMessage.trim(),
          is_user: true,
          timestamp,
        },
      ]);

      setNewMessage('');
      
      // Fetch updated chat history to get the pet's response
      await fetchChatHistory();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!pet) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-pink-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 p-4 max-w-4xl mx-auto w-full flex flex-col">
        {/* Pet Info Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-4 flex items-center space-x-4 border border-gray-700/50">
          <div className="relative w-16 h-16">
            <Image
              src={petTypes[pet.animal_type as keyof typeof petTypes]?.image || '/pets/default.webp'}
              alt={pet.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={true}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{pet.name}</h1>
            <p className="text-gray-400">
              {petTypes[pet.animal_type as keyof typeof petTypes]?.name || pet.animal_type}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 mb-4 border border-gray-700/50 overflow-y-auto">
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin h-8 w-8 border-2 border-pink-500 border-t-transparent rounded-full"></div>
              </div>
            ) : messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.is_user
                        ? 'bg-pink-500/20 text-white'
                        : 'bg-gray-700/50 text-gray-200'
                    }`}
                  >
                    <p className="break-words">{message.message}</p>
                    <p className="text-xs mt-1 opacity-60">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                Start chatting with {pet.name}!
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${pet.name}...`}
            className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-pink-400/80 text-white rounded-lg hover:bg-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 