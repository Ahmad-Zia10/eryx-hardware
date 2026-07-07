'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { moderateReview } from '@/app/admin/actions';

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  product_name: string;
  reviewer_email: string;
  reviewer_name: string;
}

export default function ReviewsTable({ reviews: initialReviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleModerate = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id);
    try {
      await moderateReview(id, status);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } catch (err) {
      console.error('Failed to moderate review:', err);
      alert('Failed to update review status');
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full border border-[#2A2A2A] rounded-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#2A2A2A]">
          <thead className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
            <tr>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Product</th>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Reviewer</th>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Rating</th>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Review</th>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Submitted</th>
              <th className="px-4 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[#0A0A0A] divide-y divide-[#2A2A2A]">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-[#1A1A1A] transition duration-150 ease-in-out">
                <td className="px-4 py-3 text-sm text-[#F5F5F5]">
                  {review.product_name}
                </td>
                <td className="px-4 py-3 text-sm text-[#9A9A9A]">
                  <div>{review.reviewer_email}</div>
                  {review.reviewer_name !== 'Unknown' && (
                    <div className="text-xs text-[#555555] mt-0.5">{review.reviewer_name}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-[#F5F5F5]">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </td>
                <td className="px-4 py-3 text-sm text-[#F5F5F5] max-w-xs">
                  <p className="line-clamp-3">{review.review_text || '—'}</p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-[#9A9A9A]">
                  {new Date(review.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleModerate(review.id, 'approved')}
                      disabled={updatingId === review.id}
                      className="bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 px-3 py-1 text-xs rounded-sm transition duration-200 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerate(review.id, 'rejected')}
                      disabled={updatingId === review.id}
                      className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-3 py-1 text-xs rounded-sm transition duration-200 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#9A9A9A]">
                  No pending reviews.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
