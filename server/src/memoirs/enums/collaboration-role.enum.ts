export enum CollaborationRole {
  VIEWER = 'viewer', // Can only view the memoir
  EDITOR = 'editor', // Can view and edit content, chapters
  // OWNER = 'owner', // Owner is implicitly the memoir creator, not managed via this role usually
}
