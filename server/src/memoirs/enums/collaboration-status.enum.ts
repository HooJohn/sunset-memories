export enum CollaborationStatus {
  PENDING = 'pending',   // Invitation sent, awaiting response
  ACCEPTED = 'accepted', // Invitation accepted by the collaborator
  DECLINED = 'declined', // Invitation declined by the collaborator
  // REVOKED = 'revoked', // Invitation revoked by the owner before acceptance (future)
  // REMOVED = 'removed', // Collaborator removed by the owner after acceptance (future)
}
