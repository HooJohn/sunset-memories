export enum ServiceRequestStatus {
  PENDING_REVIEW = 'pending_review',     // Submitted by user, awaiting platform review
  AWAITING_USER_INFO = 'awaiting_user_info', // Platform needs more info from user
  SCHEDULED = 'scheduled',             // Service scheduled with an assistant
  IN_PROGRESS = 'in_progress',           // Service delivery is ongoing
  COMPLETED = 'completed',               // Service successfully delivered
  CANCELLED_BY_USER = 'cancelled_by_user', // User cancelled the request
  CANCELLED_BY_PLATFORM = 'cancelled_by_platform', // Platform cancelled (e.g., out of scope)
  REJECTED = 'rejected',                 // Platform cannot fulfill the request
}
