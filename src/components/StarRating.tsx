import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

export default function StarRating({ rating, reviewCount, className = '' }: StarRatingProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= Math.round(rating)
                ? 'fill-luxury-citrus text-luxury-citrus'
                : 'fill-luxury-surface text-luxury-surface'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-luxury-cream">
        {(rating || 0).toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className="text-xs text-luxury-text">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
