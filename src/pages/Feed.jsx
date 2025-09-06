// src/pages/Feed.jsx
import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const categories = ["General", "Programming", "Science", "Math", "Other"];
const tagsList = ["React", "Firebase", "JavaScript", "CSS", "HTML", "Python", "Other"];

const Feed = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [tags, setTags] = useState([]);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(9); // 9 per page for mobile grid
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Infinite scroll: load more when bottom reached
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(v => v + 9);
        }
      },
      { threshold: 1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!title.trim() || !description.trim()) {
      setFormError("Title and description are required.");
      return;
    }
    if (title.length < 5) {
      setFormError("Title must be at least 5 characters.");
      return;
    }
    if (description.length < 10) {
      setFormError("Description must be at least 10 characters.");
      return;
    }
    setFormLoading(true);
    try {
      await addDoc(collection(db, "questions"), {
        title,
        description,
        category,
        tags,
        uid: user.uid,
        author: user.email,
        createdAt: new Date()
      });
      setTitle("");
      setDescription("");
      setCategory(categories[0]);
      setTags([]);
      setShowForm(false);
    } catch (err) {
      setFormError("Failed to submit question. Please try again.");
    }
    setFormLoading(false);
  };

  // Filter questions by search
  const filteredQuestions = questions.filter(q => {
    const searchLower = search.toLowerCase();
    return (
      q.title.toLowerCase().includes(searchLower) ||
      (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  });
  const paginatedQuestions = filteredQuestions.slice(0, visibleCount);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Forum Feed</h1>
      <input
        type="text"
        placeholder="Search by title or tag..."
        className="w-full max-w-md mb-4 p-2 border rounded"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="mb-6">
        <div
          className="rounded border p-4 bg-white shadow cursor-pointer hover:bg-gray-50"
          onClick={() => setShowForm(!showForm)}
        >
          <span className="font-semibold">Ask a Question</span>
        </div>
        {showForm && (
          <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
            <input
              type="text"
              placeholder="Title"
              className={`w-full p-2 border rounded ${formError && !title ? 'border-red-500' : ''}`}
              value={title}
              onChange={e => setTitle(e.target.value)}
              minLength={5}
              required
            />
            <textarea
              placeholder="Description"
              className={`w-full p-2 border rounded ${formError && !description ? 'border-red-500' : ''}`}
              value={description}
              onChange={e => setDescription(e.target.value)}
              minLength={10}
              required
            />
            <select
              className="w-full p-2 border rounded"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {tagsList.map(tag => (
                <label key={tag} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={tags.includes(tag)}
                    onChange={e => {
                      if (e.target.checked) setTags([...tags, tag]);
                      else setTags(tags.filter(t => t !== tag));
                    }}
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
            {formError && <div className="text-red-600 text-sm font-semibold">{formError}</div>}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={formLoading}>
              {formLoading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>
      <hr className="my-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {loading ? (
          <div>Loading questions...</div>
        ) : paginatedQuestions.length === 0 ? (
          <div>No questions found.</div>
        ) : (
          paginatedQuestions.map(q => (
            <div
              key={q.id}
              className="relative rounded border p-4 bg-white shadow hover:bg-gray-50 cursor-pointer transition-all duration-150"
              onClick={() => navigate(`/question/${q.id}`)}
            >
              <div className="absolute top-2 right-4 flex items-center gap-3">
                <span className="text-green-600 font-semibold">▲ {q.upvotes?.length || 0}</span>
                <span className="text-red-600 font-semibold">▼ {q.downvotes?.length || 0}</span>
              </div>
              <h2 className="font-bold text-lg mb-2 line-clamp-2 break-words">{q.title}</h2>
              <p className="mb-2 text-sm line-clamp-3 break-words">{q.description}</p>
              <div className="text-sm text-gray-600 mb-1">Category: {q.category}</div>
              <div className="text-xs text-gray-500 mb-2">Tags: {q.tags && q.tags.join(", ")}</div>
              <div className="text-xs text-gray-400">By {q.author} on {q.createdAt && new Date(q.createdAt.seconds ? q.createdAt.seconds * 1000 : q.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
      {/* Infinite scroll loader */}
      {paginatedQuestions.length < filteredQuestions.length && (
        <div ref={loaderRef} className="w-full flex justify-center py-4">
          <span className="text-gray-400">Loading more...</span>
        </div>
      )}
    </div>
  );
};

export default Feed;
