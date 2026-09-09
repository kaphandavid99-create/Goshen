export function averageRating(ratings: number[]) {
  if (ratings.length === 0) {
    return null;
  }

  return Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10;
}
