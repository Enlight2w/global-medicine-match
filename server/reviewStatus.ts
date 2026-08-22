export type ReviewStatus = "pending" | "approved" | "hold" | "rejected";

const allowedTransitions: Record<ReviewStatus, ReviewStatus[]> = {
  pending: ["approved", "hold", "rejected"],
  hold: ["approved", "rejected"],
  approved: ["hold", "rejected"],
  rejected: [],
};

export function canTransitionReviewStatus(current: ReviewStatus, next: ReviewStatus) {
  return allowedTransitions[current].includes(next);
}
