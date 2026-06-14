'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.data.accessToken);
        router.push('/dashboard');
      } else {
        alert('Login failed');
      }
    } catch (error) {
      alert('Login error. Is the backend running?');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h1>
        <input 
          type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded text-black"
        />
        <input 
          type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full mb-6 p-2 border rounded text-black"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
}
