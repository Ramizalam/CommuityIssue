import React, { useState, useEffect } from 'react';
import { getComments, addComment } from '../lib/supabase';
import type { Comment } from '../lib/supabase';
import { format } from 'date-fns';

interface IssueCommentsProps {
  issueId: string;
}

export function IssueComments({ issueId }: IssueCommentsProps) {
  const [comments, setComments] = useState<(Comment & { users: { email: string } })[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [issueId]);

  async function fetchComments() {
    try {
      const data = await getComments(issueId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await addComment(issueId, newComment);
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <span className="font-medium">{comment.users.email}</span>
              <span className="text-sm text-gray-500">
                {format(new Date(comment.created_at), 'PPp')}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-500">No comments yet.</p>
        )}
      </div>
    </div>
  );
}