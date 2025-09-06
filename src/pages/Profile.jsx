// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const Profile = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("questions");
  const [totalUpvotes, setTotalUpvotes] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Get all questions (to get both user's questions and answers)
    const unsubQuestions = onSnapshot(collection(db, "questions"), async (questionsSnap) => {
      // User's questions
      const userQuestions = questionsSnap.docs.filter(doc => doc.data().uid === user.uid).map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(userQuestions);

      // Upvotes for user's questions
      let questionUpvotes = 0;
      userQuestions.forEach(q => {
        if (q.upvotes && Array.isArray(q.upvotes)) {
          questionUpvotes += q.upvotes.length;
        }
      });

      // User's answers and upvotes for user's answers
      let userAnswers = [];
      let answerUpvotes = 0;
      // For each question, get answers
      for (const qDoc of questionsSnap.docs) {
        const qTitle = qDoc.data().title || qDoc.id;
        const answersSnap = await getDocs(collection(db, `questions/${qDoc.id}/answers`));
        answersSnap.forEach(aDoc => {
          const data = aDoc.data();
          if (data.uid === user.uid) {
            userAnswers.push({ id: aDoc.id, ...data, questionId: qDoc.id, questionTitle: qTitle });
            if (data.upvotes && Array.isArray(data.upvotes)) {
              answerUpvotes += data.upvotes.length;
            }
          }
        });
      }
      setAnswers(userAnswers);
      setTotalUpvotes(questionUpvotes + answerUpvotes);
      setLoading(false);
    });
    return () => { unsubQuestions(); };
  }, [user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg("");
    setPassLoading(true);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassMsg("Please fill all fields.");
      setPassLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg("New passwords do not match.");
      setPassLoading(false);
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setPassMsg("Password updated successfully!");
      setShowModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPassMsg("Error: " + (err.message || "Could not update password."));
    }
    setPassLoading(false);
  };

  return (
    <div className="p-6">
  <h1 className="text-2xl font-bold mb-4">Profile</h1>
  <div className="mb-2 text-lg">Hello, <span className="font-semibold">{user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1)}</span></div>
      <div className="mb-4">
        <div className="font-semibold">Email: {user.email}</div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
          onClick={() => setShowModal(true)}
        >
          Change Password
        </button>
        {passMsg && <div className="mt-2 text-green-600">{passMsg}</div>}
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <input
                type="password"
                placeholder="Old Password"
                className="w-full p-2 border rounded"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full p-2 border rounded"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full p-2 border rounded"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={passLoading}>
                  {passLoading ? <span className="loader"></span> : "Submit"}
                </button>
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
            {passMsg && <div className="mt-2 text-red-600">{passMsg}</div>}
          </div>
        </div>
      )}
      <hr className="my-6" />
      <div className="mb-4">
        <span className="font-semibold">Total Upvotes Received: </span>
        <span className="text-green-600 font-bold">{totalUpvotes}</span>
      </div>
      {/* Tabs for Questions and Answers */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-t font-semibold border-b-2 ${activeTab === "questions" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"}`}
          onClick={() => setActiveTab("questions")}
        >
          Your Questions
        </button>
        <button
          className={`px-4 py-2 rounded-t font-semibold border-b-2 ${activeTab === "answers" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"}`}
          onClick={() => setActiveTab("answers")}
        >
          Your Answers
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === "questions" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div>Loading questions...</div>
          ) : questions.length === 0 ? (
            <div>No questions yet.</div>
          ) : (
            questions.map(q => (
              <div key={q.id} className="rounded border p-4 bg-white shadow hover:bg-gray-50">
                <h2 className="font-bold text-lg mb-2">{q.title}</h2>
                <p className="mb-2">{q.description}</p>
                <div className="text-sm text-gray-600 mb-1">Category: {q.category}</div>
                <div className="text-xs text-gray-500 mb-2">Tags: {q.tags && q.tags.join(", ")}</div>
                <div className="text-xs text-gray-400">On {q.createdAt && new Date(q.createdAt.seconds ? q.createdAt.seconds * 1000 : q.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {answers.length === 0 ? (
            <div>No answers yet.</div>
          ) : (
            answers.map(a => (
              <div key={a.id} className="rounded border p-4 bg-white shadow hover:bg-gray-50">
                <div className="mb-2">{a.text}</div>
                <div className="text-xs text-gray-500 mb-2">On Question: {a.questionTitle}</div>
                <div className="text-xs text-gray-400">On {a.createdAt && new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
