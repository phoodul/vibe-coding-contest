/**
 * 에빙하우스 망각곡선 기반 간격 반복 스케줄
 * Researcher 리서치 결과 기반:
 * 1차: 1시간, 2차: 당일, 3차: 다음날, 4차: 3일, 5차: 1주, 6차: 2주, 7차: 1개월
 */
const REVIEW_INTERVALS_HOURS = [1, 12, 24, 72, 168, 336, 720];

export function getNextReviewDate(
  createdAt: string,
  reviewCount: number
): Date {
  const created = new Date(createdAt);
  const intervalIndex = Math.min(reviewCount, REVIEW_INTERVALS_HOURS.length - 1);
  const hoursUntilNext = REVIEW_INTERVALS_HOURS[intervalIndex];
  return new Date(created.getTime() + hoursUntilNext * 60 * 60 * 1000);
}

export function isReviewDue(createdAt: string, reviewCount: number): boolean {
  const nextReview = getNextReviewDate(createdAt, reviewCount);
  return new Date() >= nextReview;
}

export function getReviewUrgency(
  createdAt: string,
  reviewCount: number
): "overdue" | "due" | "upcoming" | "done" {
  if (reviewCount >= REVIEW_INTERVALS_HOURS.length) return "done";

  const nextReview = getNextReviewDate(createdAt, reviewCount);
  const now = new Date();
  const diffHours = (nextReview.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < -24) return "overdue";
  if (diffHours <= 0) return "due";
  return "upcoming";
}

export function formatTimeUntilReview(
  createdAt: string,
  reviewCount: number
): string {
  if (reviewCount >= REVIEW_INTERVALS_HOURS.length) return "복습 완료!";

  const nextReview = getNextReviewDate(createdAt, reviewCount);
  const now = new Date();
  const diffMs = nextReview.getTime() - now.getTime();

  if (diffMs <= 0) return "지금 복습하세요!";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}일 후`;
  if (diffHours > 0) return `${diffHours}시간 후`;
  return `${Math.floor(diffMs / (1000 * 60))}분 후`;
}
