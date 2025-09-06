// src/pages/QuestionDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [voteLoading, setVoteLoading] = useState({}); // { answerId: true/false }
  const [expandedAnswers, setExpandedAnswers] = useState({}); // { answerId: true/false }
  const [expandedComments, setExpandedComments] = useState({}); // { commentId: true/false }
  const [qVoteLoading, setQVoteLoading] = useState(false);
  // Voting logic for question
  const handleQuestionVote = async (type) => {
    if (!user) return;
    setQVoteLoading(true);
    const questionRef = doc(db, "questions", id);
    const field = type === 'up' ? 'upvotes' : 'downvotes';
    // Prevent duplicate votes
    if (question && question[field] && question[field].includes(user.uid)) {
      setQVoteLoading(false);
      return;
    }
    await updateDoc(questionRef, {
      [field]: arrayUnion(user.uid)
    });
    setQVoteLoading(false);
  };
  const [answerText, setAnswerText] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [answerLoading, setAnswerLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // For comments
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentingOn, setCommentingOn] = useState(null); // answerId
  const [comments, setComments] = useState({}); // { answerId: [comments] }

  useEffect(() => {
    const fetchQuestion = async () => {
      const docRef = doc(db, "questions", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setQuestion({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchQuestion();
  }, [id]);

  useEffect(() => {
    const q = query(collection(db, `questions/${id}/answers`), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const ans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnswers(ans);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  // Voting logic for answers
  const handleVote = async (answerId, type) => {
    if (!user) return;
    setVoteLoading(v => ({ ...v, [answerId]: true }));
    const answerRef = doc(db, `questions/${id}/answers/${answerId}`);
    const field = type === 'up' ? 'upvotes' : 'downvotes';
    // Prevent duplicate votes
    const ans = answers.find(a => a.id === answerId);
    if (ans && ans[field] && ans[field].includes(user.uid)) {
      setVoteLoading(v => ({ ...v, [answerId]: false }));
      return;
    }
    await updateDoc(answerRef, {
      [field]: arrayUnion(user.uid)
    });
    setVoteLoading(v => ({ ...v, [answerId]: false }));
  };

  useEffect(() => {
    // Listen for comments for each answer
    const unsubscribes = answers.map(answer => {
      const q = query(collection(db, `questions/${id}/answers/${answer.id}/comments`), orderBy("createdAt", "asc"));
      return onSnapshot(q, (snapshot) => {
        setComments(prev => ({
          ...prev,
          [answer.id]: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        }));
      });
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, [answers, id]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    setAnswerError("");
    if (!answerText.trim()) {
      setAnswerError("Answer cannot be empty.");
      return;
    }
    if (answerText.length < 5) {
      setAnswerError("Answer must be at least 5 characters.");
      return;
    }
    setAnswerLoading(true);
    try {
      await addDoc(collection(db, `questions/${id}/answers`), {
        text: answerText,
        uid: user.uid,
        author: user.email,
        createdAt: new Date()
      });
      setAnswerText("");
    } catch (err) {
      setAnswerError("Failed to submit answer. Please try again.");
    }
    setAnswerLoading(false);
  };

  const handleCommentSubmit = async (answerId) => {
    setCommentError("");
    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }
    if (commentText.length < 2) {
      setCommentError("Comment must be at least 2 characters.");
      return;
    }
    setCommentLoading(true);
    try {
      await addDoc(collection(db, `questions/${id}/answers/${answerId}/comments`), {
        text: commentText,
        uid: user.uid,
        author: user.email,
        createdAt: new Date()
      });
      setCommentText("");
      setCommentingOn(null);
    } catch (err) {
      setCommentError("Failed to submit comment. Please try again.");
    }
    setCommentLoading(false);
  };

  if (!question) return <div className="p-3 sm:p-6">Loading question...</div>;

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-6 p-2 sm:p-4 rounded border bg-white shadow">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 break-words">{question.title}</h1>
        <div className="mb-2 text-gray-700 text-sm sm:text-base break-words">{question.description}</div>
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 mb-2">
          <div className="flex items-center gap-1">
            <button
              className="text-green-600 font-bold text-lg"
              disabled={qVoteLoading || (question.upvotes && question.upvotes.includes(user?.uid))}
              onClick={() => handleQuestionVote('up')}
            >▲</button>
            <span className="font-semibold text-gray-700 text-xs sm:text-base">{question.upvotes?.length || 0} Upvotes</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="text-red-600 font-bold text-lg"
              disabled={qVoteLoading || (question.downvotes && question.downvotes.includes(user?.uid))}
              onClick={() => handleQuestionVote('down')}
            >▼</button>
            <span className="font-semibold text-gray-700 text-xs sm:text-base">{question.downvotes?.length || 0} Downvotes</span>
          </div>
        </div>
        <div className="text-xs sm:text-sm text-gray-600 mb-1">Category: {question.category}</div>
        <div className="text-xs text-gray-500 mb-1">Tags: {question.tags && question.tags.join(", ")}</div>
        <div className="text-xs text-gray-400">By {question.author} on {question.createdAt && new Date(question.createdAt.seconds ? question.createdAt.seconds * 1000 : question.createdAt).toLocaleString()}</div>
      </div>
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">Answers</h2>
        {user && (
          <form onSubmit={handleAnswerSubmit} className="mb-4 flex flex-col sm:flex-row gap-2 items-end w-full" noValidate>
            <textarea
              className={`w-full sm:flex-1 p-2 border rounded min-h-[60px] resize-y ${answerError ? 'border-red-500' : ''}`}
              placeholder="Write your answer..."
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              minLength={5}
              required
            />
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded h-10 mt-2 sm:mt-0" disabled={answerLoading}>
              {answerLoading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
        {answerError && <div className="text-red-600 text-sm font-semibold mb-2">{answerError}</div>}
        {loading ? <div>Loading answers...</div> : answers.length === 0 ? <div>No answers yet.</div> : (
          <div className="space-y-4 sm:space-y-6">
            {answers.map(ans => (
              <div key={ans.id} className="p-2 sm:p-4 border rounded bg-gray-50">
                <div className="mb-1 break-words text-sm sm:text-base">
                  {ans.text.length > 180 && !expandedAnswers[ans.id] ? (
                    <>
                      {ans.text.slice(0, 180)}... 
                      <button className="text-blue-600 text-xs underline" onClick={() => setExpandedAnswers(a => ({ ...a, [ans.id]: true }))}>see more</button>
                    </>
                  ) : (
                    <>
                      {ans.text}
                      {ans.text.length > 180 && (
                        <button className="text-blue-600 text-xs underline ml-1" onClick={() => setExpandedAnswers(a => ({ ...a, [ans.id]: false }))}>see less</button>
                      )}
                    </>
                  )}
                </div>
                <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <button
                      className="text-green-600 font-bold text-lg"
                      disabled={voteLoading[ans.id] || (ans.upvotes && ans.upvotes.includes(user?.uid))}
                      onClick={() => handleVote(ans.id, 'up')}
                    >▲</button>
                    <span className="font-semibold text-gray-700 text-xs sm:text-base">{ans.upvotes?.length || 0} Upvotes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className="text-red-600 font-bold text-lg"
                      disabled={voteLoading[ans.id] || (ans.downvotes && ans.downvotes.includes(user?.uid))}
                      onClick={() => handleVote(ans.id, 'down')}
                    >▼</button>
                    <span className="font-semibold text-gray-700 text-xs sm:text-base">{ans.downvotes?.length || 0} Downvotes</span>
                  </div>
                  <span className="text-xs text-gray-500">By {ans.author} on {ans.createdAt && new Date(ans.createdAt.seconds ? ans.createdAt.seconds * 1000 : ans.createdAt).toLocaleString()}</span>
                </div>
                <div className="ml-2 sm:ml-4">
                  <h3 className="font-semibold text-xs sm:text-sm mb-1">Comments</h3>
                  {comments[ans.id] && comments[ans.id].length > 0 ? (
                    <div className="space-y-2 mb-2">
                      {comments[ans.id].map(com => (
                        <div key={com.id} className="text-xs bg-white border rounded p-2">
                          <span className="font-semibold">{com.author}:</span> 
                          {com.text.length > 100 && !expandedComments[com.id] ? (
                            <>
                              {com.text.slice(0, 100)}... 
                              <button className="text-blue-600 text-xs underline" onClick={() => setExpandedComments(c => ({ ...c, [com.id]: true }))}>see more</button>
                            </>
                          ) : (
                            <>
                              {com.text}
                              {com.text.length > 100 && (
                                <button className="text-blue-600 text-xs underline ml-1" onClick={() => setExpandedComments(c => ({ ...c, [com.id]: false }))}>see less</button>
                              )}
                            </>
                          )}
                          <span className="ml-2 text-gray-400">{com.createdAt && new Date(com.createdAt.seconds ? com.createdAt.seconds * 1000 : com.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-xs text-gray-400 mb-2">No comments yet.</div>}
                  {user && commentingOn === ans.id ? (
                    <form onSubmit={e => { e.preventDefault(); handleCommentSubmit(ans.id); }} className="flex flex-col sm:flex-row gap-2 mt-2 items-end w-full" noValidate>
                      <textarea
                        className={`w-full sm:flex-1 p-1 border rounded min-h-[40px] resize-y ${commentError ? 'border-red-500' : ''}`}
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        minLength={2}
                        required
                      />
                      <button type="submit" className="w-full sm:w-auto bg-blue-500 text-white px-2 py-1 rounded text-xs h-8 mt-2 sm:mt-0" disabled={commentLoading}>
                        {commentLoading ? 'Adding...' : 'Add'}
                      </button>
                      <button type="button" className="w-full sm:w-auto bg-gray-300 text-xs px-2 py-1 rounded h-8 mt-2 sm:mt-0" onClick={() => setCommentingOn(null)}>Cancel</button>
                    </form>
                  ) : user ? (
                    <button className="text-xs text-blue-600 mt-1" onClick={() => setCommentingOn(ans.id)}>Add Comment</button>
                  ) : null}
                  {commentError && commentingOn === ans.id && (
                    <div className="text-red-600 text-xs font-semibold mb-2">{commentError}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
