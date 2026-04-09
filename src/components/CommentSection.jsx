import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CommentService from "../services/comment";

export default function CommentSection({ postId, userData }) {
  const [comment, setComment] = useState("");
  const [commentData, setCommentData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const comments = await CommentService.getComments(postId);
      if (comments) setCommentData(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const createComment = async () => {
    if (!comment.trim()) { alert("Please enter a comment"); return; }
    if (!userData) { alert("Please login to comment"); return; }

    setIsSubmitting(true);
    try {
      const newComment = await CommentService.createComment({ comment: comment.trim(), postId });
      if (newComment) { setComment(""); fetchComments(); }
      else alert("Failed to post comment. Please try again.");
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") createComment();
  };

  return (
    <div className="mt-12 pt-8 border-t border-rule">
      <h2 className="font-serif text-xl font-bold text-ink mb-8">
        Comments ({commentData.length})
      </h2>

      {/* Comment input */}
      {userData ? (
        <div className="mb-10 flex items-start gap-4">
          <div className="w-9 h-9 bg-ink flex items-center justify-center text-paper font-sans font-bold text-sm flex-shrink-0">
            {userData.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <textarea
              placeholder="Share your thoughts… (Ctrl+Enter to submit)"
              className="w-full border border-rule bg-paper-white text-ink font-sans px-4 py-3 focus:outline-none focus:border-ink resize-none transition-colors"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
            />
            <div className="flex justify-end mt-2">
              <button
                className={`px-5 py-2 text-sm font-sans uppercase tracking-widest transition-colors ${
                  isSubmitting || !comment.trim()
                    ? 'bg-paper-dark text-ink-faint cursor-not-allowed'
                    : 'bg-ink text-paper hover:bg-ink-mid'
                }`}
                onClick={createComment}
                disabled={isSubmitting || !comment.trim()}
              >
                {isSubmitting ? "Posting…" : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 border border-rule p-6 text-center">
          <p className="font-sans text-ink-mid text-sm">
            Please{" "}
            <Link to="/login" className="text-ink underline hover:text-ink-mid transition-colors">
              sign in
            </Link>{" "}
            to leave a comment.
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-0 divide-y divide-rule">
        {isLoadingComments ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-ink"></div>
          </div>
        ) : commentData.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-sans text-ink-faint text-sm">No comments yet. Be the first to share your thoughts.</p>
          </div>
        ) : (
          commentData.map((commentItem) => (
            <CommentItem key={commentItem._id} commentItem={commentItem} />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ commentItem }) {
  return (
    <div className="py-6 flex items-start gap-4">
      <div className="w-9 h-9 bg-ink flex items-center justify-center text-paper font-sans font-bold text-sm flex-shrink-0">
        {commentItem.userId?.firstName?.charAt(0).toUpperCase() ||
          commentItem.userId?.username?.charAt(0).toUpperCase() ||
          "U"}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline justify-between mb-1">
          <h4 className="font-sans font-semibold text-sm text-ink">
            {commentItem.userId?.firstName && commentItem.userId?.lastName
              ? `${commentItem.userId.firstName} ${commentItem.userId.lastName}`
              : commentItem.userId?.username || "Anonymous"}
          </h4>
          <time className="text-xs font-sans text-ink-faint">
            {new Date(commentItem.createdAt).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric"
            })}
          </time>
        </div>
        <p className="font-sans text-ink-mid text-sm leading-relaxed">
          {commentItem.content}
        </p>
      </div>
    </div>
  );
}
