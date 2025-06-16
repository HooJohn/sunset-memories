# Backend API Endpoint Summary for Frontend Integration

This document outlines the backend API endpoints expected by the frontend application, including HTTP methods, paths, key payload fields, and key response fields.

## Authentication

1.  **Login**
    *   **Endpoint**: `POST /auth/login`
    *   **Request Payload**: `{ phone: string; verificationCode: string; }`
    *   **Response**: `{ access_token: string; user: User; }`
        *   `User`: `{ id: string; phone: string; name?: string; avatar_url?: string; nickname?: string; created_at: string; updated_at: string; }`

2.  **Register**
    *   **Endpoint**: `POST /auth/register`
    *   **Request Payload**: `{ phone: string; password: string; nickname: string; }`
        *   **Assumption**: Backend `RegisterAuthDto` accepts `nickname`.
    *   **Response**: `{ access_token: string; user: User; }`

## User Profile

1.  **Get User Profile**
    *   **Endpoint**: `GET /users/me`
    *   **Request Payload**: None (Auth token in header)
    *   **Response**: `User` interface (see above)

2.  **Update User Profile**
    *   **Endpoint**: `PATCH /users/me`
    *   **Request Payload**: `{ name?: string; avatar_url?: string; nickname?: string; }`
        *   **Assumption**: Backend `UpdateUserProfileDto` accepts these optional fields.
    *   **Response**: `User` interface (updated user)

## Memoirs Core

1.  **Transcribe Audio**
    *   **Endpoint**: `POST /memoirs/transcribe`
    *   **Request Payload**: `FormData` with a `file` field (audio blob).
    *   **Response**: `{ transcription: string; }`

2.  **Generate Chapters from Text**
    *   **Endpoint**: `POST /memoirs/generate-chapters`
    *   **Request Payload**: `{ transcribedText: string; }`
    *   **Response**: `{ chapters: Array<{ id?: string; title: string; summary?: string; }> }`

3.  **Create Memoir**
    *   **Endpoint**: `POST /memoirs`
    *   **Request Payload (`CreateMemoirPayload`)**:
        *   `title: string`
        *   `content_html?: string`
        *   `transcribed_text?: string`
        *   `chapters?: Array<{ title: string; summary?: string; }>` (Frontend sends this structure)
        *   **Assumption**: Backend `CreateMemoirDto` (or service layer) adapted to handle `content_html`, `transcribed_text`, and structured `chapters` (or `chapters_json` if backend requires stringified JSON).
    *   **Response (`Memoir` interface)**: Includes all fields from payload plus `id`, `user_id`, `created_at`, `updated_at`, `is_public`, etc.

4.  **Get User's Memoirs**
    *   **Endpoint**: `GET /memoirs`
    *   **Request Payload**: None (Auth token for user context)
    *   **Response**: `Memoir[]` (Array of user's memoirs)

5.  **Get Memoir by ID**
    *   **Endpoint**: `GET /memoirs/:memoirId`
    *   **Request Payload**: None
    *   **Response**: `Memoir` interface

6.  **Update Memoir**
    *   **Endpoint**: `PATCH /memoirs/:memoirId`
    *   **Request Payload (`UpdateMemoirPayload`)**:
        *   `title?: string`
        *   `content_html?: string`
        *   `is_public?: boolean`
        *   `transcribed_text?: string` (less common to update)
        *   `chapters?: Array<{ title: string; summary?: string; }>`
        *   **Assumption**: Backend `UpdateMemoirDto` (or service) adapted for these fields.
    *   **Response**: `Memoir` interface (updated memoir)

7.  **Delete Memoir**
    *   **Endpoint**: `DELETE /memoirs/:memoirId`
    *   **Request Payload**: None
    *   **Response**: `204 No Content` or similar success status.

## Memoir Collaborations

1.  **Get Collaborators for a Memoir**
    *   **Endpoint**: `GET /memoirs/:memoirId/collaborators`
    *   **Response**: `MemoirCollaboration[]`
        *   `MemoirCollaboration`: `{ id, memoirId, userId, role: CollaborationRole, status: CollaborationStatus, user?: { nickname?, phone?, name?, avatar_url? } }`
        *   `CollaborationRole`: `'viewer' | 'editor'` (enum)
        *   `CollaborationStatus`: `'pending' | 'accepted' | 'rejected'` (enum)

2.  **Invite Collaborator**
    *   **Endpoint**: `POST /memoirs/:memoirId/collaborators`
    *   **Request Payload**: `{ collaboratorPhone: string; role: CollaborationRole; }`
    *   **Response**: `MemoirCollaboration` (newly created collaboration record)

3.  **Get Pending Invitations for Current User**
    *   **Endpoint**: `GET /collaborations/invitations/pending`
    *   **Response**: `MemoirCollaboration[]` (invitations where current user is the invitee and status is pending, should include `memoir?: { title? }` for context)

4.  **Respond to Invitation**
    *   **Endpoint**: `PATCH /collaborations/invitations/:collaborationId/respond`
    *   **Request Payload**: `{ status: 'accepted' | 'rejected'; }`
    *   **Response**: `MemoirCollaboration` (updated collaboration record)

5.  **Update Collaborator Role**
    *   **Endpoint**: `PATCH /collaborations/:collaborationId/role`
    *   **Request Payload**: `{ role: CollaborationRole; }`
    *   **Response**: `MemoirCollaboration`
    *   **HIGHLIGHT**: Backend endpoint needs implementation.

6.  **Remove Collaborator**
    *   **Endpoint**: `DELETE /collaborations/:collaborationId`
    *   **Response**: `204 No Content` or similar.
    *   **HIGHLIGHT**: Backend endpoint needs implementation.

## Service Requests

1.  **Submit Service Request**
    *   **Endpoint**: `POST /service-requests`
    *   **Request Payload (`CreateServiceRequestPayload`)**:
        *   `memoirId?: string`
        *   `serviceType: ServiceType` (enum: `EDITING_ASSISTANCE`, `INTERVIEW_HELP`, etc.)
        *   `description: string` (Frontend field name)
        *   `contactPhone: string`
        *   `address: string`
        *   `preferredDate?: string`
        *   **Assumption**: Backend DTO (`CreateServiceRequestDto`) accepts `description` or frontend maps it to `details`. For now, frontend sends `details: data.description`.
    *   **Response (`ServiceRequest` interface)**: Includes payload fields plus `id`, `userId`, `status`, `created_at`, `updated_at`, and potentially nested `user` and `memoir` info.
        *   `ServiceRequestStatus`: `'PENDING'`, `'ACCEPTED'`, etc. (enum)

2.  **Get User's Service Requests**
    *   **Endpoint**: `GET /service-requests` (Backend filters by authenticated user)
    *   **Response**: `ServiceRequest[]`

3.  **Get Service Request by ID**
    *   **Endpoint**: `GET /service-requests/:id`
    *   **Response**: `ServiceRequest`

## Publishing Orders

1.  **Submit Publish Order**
    *   **Endpoint**: `POST /publish-orders`
    *   **Request Payload (`PublishOrderData`)**: `{ memoirId: string; format: PublishFormat; quantity: number; notes?: string; shippingAddress?: string; }`
        *   `PublishFormat`: `'ebook' | 'paperback' | 'hardcover'`
    *   **Response (`PublishOrder` interface)**: Includes payload fields plus `id`, `userId`, `status`, `createdAt`, etc.
        *   `PublishOrderStatus`: `'pending'`, `'awaiting_payment'`, etc.

2.  **Get User's Publish Orders**
    *   **Endpoint**: `GET /publish-orders` (Backend filters by authenticated user)
    *   **Response**: `PublishOrder[]`

3.  **Get Publish Order by ID**
    *   **Endpoint**: `GET /publish-orders/:id`
    *   **Response**: `PublishOrder`

## Community Features (Public Memoirs)

1.  **Get Public Memoirs (Paginated)**
    *   **Endpoint**: `GET /memoirs/public`
    *   **Query Parameters**: `page: number`, `limit: number`
    *   **Response**: `{ data: PublicMemoirSummary[]; total: number; page: number; limit: number; }`
        *   `PublicMemoirSummary`: `{ id, title, is_public, created_at, updated_at, author: AuthorInfo, likeCount?, isLikedByCurrentUser?, snippet? }`
        *   `AuthorInfo`: `{ id: string; name?: string; avatar_url?: string; nickname?: string; }`

2.  **Get Public Memoir Details**
    *   **Endpoint**: `GET /memoirs/public/:memoirId`
    *   **Response (`PublicMemoirDetail`)**: `{ id, title, is_public, created_at, updated_at, author: AuthorInfo, chapters: PublicChapter[], content_html?, likeCount?, isLikedByCurrentUser? }`
        *   `PublicChapter`: `{ id, title, content, order }` (content is HTML from chapter editor)
        *   **Assumption**: `content_html` is the full memoir HTML if available, otherwise frontend might construct from chapters. Backend DTO might provide `content_html` directly or chapters with their own `content_html`.

3.  **Get Comments for a Memoir**
    *   **Endpoint**: `GET /memoirs/:memoirId/comments`
    *   **Response**: `MemoirComment[]`
        *   `MemoirComment`: `{ id, memoirId, userId, user?: AuthorInfo, text, created_at }`
    *   **HIGHLIGHT**: Backend endpoint needs implementation.

4.  **Like a Memoir**
    *   **Endpoint**: `POST /memoirs/:memoirId/like`
    *   **Request Payload**: None
    *   **Response (`LikeResponse`)**: `{ success: boolean; likeCount: number; isLikedByCurrentUser?: boolean; }`
    *   **HIGHLIGHT**: Backend endpoint needs implementation.

5.  **Unlike a Memoir**
    *   **Endpoint**: `DELETE /memoirs/:memoirId/like`
    *   **Request Payload**: None
    *   **Response (`LikeResponse`)**: `{ success: boolean; likeCount: number; isLikedByCurrentUser?: boolean; }`
    *   **HIGHLIGHT**: Backend endpoint needs implementation.

6.  **Add Comment to Memoir**
    *   **Endpoint**: `POST /memoirs/:memoirId/comments`
    *   **Request Payload (`AddCommentPayload`)**: `{ text: string; }`
    *   **Response**: `MemoirComment` (the newly created comment)
    *   **HIGHLIGHT**: Backend endpoint needs implementation.

---
This summary should help align frontend expectations with backend development.
