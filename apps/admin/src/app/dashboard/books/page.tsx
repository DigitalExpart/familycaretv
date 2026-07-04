'use client';
import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Link as LinkIcon, QrCode } from 'lucide-react';

export default function BooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', author: '', description: '', storeUrl: '', qrCodeUrl: '', imageUrl: '', featured: false, language: 'en', displayOrder: 0 });

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/books`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch(e) { console.error('Failed to fetch books', e); }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/books/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/books`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        fetchBooks();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save book', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://carefree-endurance-production-7621.up.railway.app'}/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBooks();
    } catch (e) { console.error('Delete failed', e); }
  };

  const openEdit = (book: any) => {
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description || '',
      storeUrl: book.storeUrl || '',
      qrCodeUrl: book.qrCodeUrl || '',
      imageUrl: book.imageUrl || '',
      featured: book.featured || false,
      language: book.language || 'en',
      displayOrder: book.displayOrder || 0
    });
    setEditId(book.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ title: '', author: '', description: '', storeUrl: '', qrCodeUrl: '', imageUrl: '', featured: false, language: 'en', displayOrder: 0 });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 rounded-2xl text-pink-600">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Books Promotion</h1>
            <p className="text-slate-500 mt-1">Manage promoted books, authors, and store links.</p>
          </div>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Book
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4">
                {book.imageUrl ? (
                  <img src={book.imageUrl} alt={book.title} className="w-16 h-24 object-cover rounded-md border border-slate-200" />
                ) : (
                  <div className="w-16 h-24 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200">
                    <BookOpen className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{book.title}</h3>
                  <p className="text-sm text-pink-600 font-medium">{book.author}</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{book.language === 'es' ? 'Spanish' : 'English'}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(book)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(book.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{book.description}</p>
            
            <div className="mt-auto flex flex-wrap gap-2">
              {book.storeUrl && (
                <a href={book.storeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100">
                  <LinkIcon className="w-3 h-3" /> Store Link
                </a>
              )}
              {book.qrCodeUrl && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                  <QrCode className="w-3 h-3" /> QR Code
                </span>
              )}
              {book.featured && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg">
                  ★ Featured
                </span>
              )}
            </div>
          </div>
        ))}
        {books.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 border-dashed">
            No books found. Add a book to get started.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" placeholder="Enter book title" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Author *</label>
                  <input required type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" placeholder="Enter author name" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all h-24 resize-none" placeholder="Enter brief description" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Language</label>
                  <select value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Display Order</label>
                  <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Store URL</label>
                  <input type="text" value={formData.storeUrl} onChange={(e) => setFormData({...formData, storeUrl: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" placeholder="https://amazon.com/..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">QR Code Image URL</label>
                  <input type="text" value={formData.qrCodeUrl} onChange={(e) => setFormData({...formData, qrCodeUrl: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Cover Image URL</label>
                  <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all" placeholder="https://..." />
                </div>
                <div className="col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500" />
                  <label htmlFor="featured" className="text-sm font-semibold text-slate-700 cursor-pointer">Featured Book (Shows prominently)</label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md">
                  {isEditing ? 'Save Changes' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
