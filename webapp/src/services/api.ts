import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Types ---
interface LoginPayload {
  phone: string;
  verificationCode: string;
}

interface RegisterPayload {
  phone: string;
  password: string;
  nickname: string;
}

// --- Response Types ---
export interface User {
  id: string;
  phone: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

const getErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response && axiosError.response.data) {
      const data = axiosError.response.data;
      if (typeof data.message === 'string') return data.message;
      if (Array.isArray(data.message) && data.message.length > 0) return data.message.join(', ');
      if (data.error) return data.error;
      return axiosError.message;
    }
  }
  return error.message || 'An unexpected error occurred.';
};

// --- Auth API ---
export const login = async (credentials: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.data.access_token) localStorage.setItem('authToken', response.data.access_token);
    return response.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
};

export const register = async (userData: RegisterPayload): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
};

export const fetchUserProfile = async (): Promise<User> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found.');
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
};

// --- Memoir API ---
export interface ChapterData { id?: string; title: string; summary?: string; }
export interface MemoirData { title: string; content_html: string; transcribed_text?: string | null; chapters?: ChapterData[] | null; [key: string]: any; }
// MemoirResponse now includes fields needed for public display like authorNickname and likeCount
export interface MemoirResponse extends MemoirData {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  authorNickname?: string; // Added for displaying author name easily
  likeCount?: number;      // Added for like functionality
  isPublic?: boolean;      // Added to indicate if memoir is public
  isLikedByCurrentUser?: boolean; // Added to know if the current user liked this memoir
}

export const createMemoir = async (memoirData: MemoirData): Promise<MemoirResponse> => {
  try {
    const response = await apiClient.post<MemoirResponse>('/memoirs', memoirData);
    return response.data;
  } catch (error) { throw new Error(`Failed to create memoir: ${getErrorMessage(error)}`); }
};

export const getMemoirById = async (id: string): Promise<MemoirResponse> => {
  try {
    console.log(`API (mock): Fetching memoir by ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    // More detailed mock for specific IDs, including community fields
    if (id === "123" || id === "mockMemoirId" || id === "sample-public-id") {
        return {
            id: id, title: `Mock Memoir ${id}`, content_html: `<p>This is mock content for memoir ${id}.</p><h2>Chapter 1: The Beginning</h2><p>It all started on a rainy day...</p><h2>Chapter 2: The Adventure</h2><p>Then, things got exciting.</p>`,
            chapters: [{ title: "Chapter 1: The Beginning", summary: "It all started on a rainy day..." }, {title: "Chapter 2: The Adventure", summary: "Then, things got exciting."}],
            transcribed_text: "Mock transcribed text for memoir " + id,
            user_id: `user-${id.substring(0,3)}`,
            authorNickname: `AuthorOf${id.substring(0,3)}`,
            likeCount: Math.floor(Math.random() * 100),
            isPublic: true,
            isLikedByCurrentUser: Math.random() > 0.5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as MemoirResponse;
    }
     return {
            id: id, title: `Generic Sample Memoir ${id}`, content_html: `<p>Content for memoir ${id}.</p>`,
            chapters: [], user_id: "user-generic", authorNickname: "Generic Author", likeCount: 0, isPublic: false,
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        } as MemoirResponse;
  } catch (error) { throw new Error(`Failed to fetch memoir: ${getErrorMessage(error)}`); }
};

export const updateMemoir = async (id: string, memoirData: MemoirData): Promise<MemoirResponse> => {
  try {
    const response = await apiClient.put<MemoirResponse>(`/memoirs/${id}`, memoirData);
    return response.data;
  } catch (error) { throw new Error(`Failed to update memoir: ${getErrorMessage(error)}`); }
};

// --- Collaboration API ---
export type PermissionLevel = 'view' | 'comment' | 'edit';
export interface CollaborationData { inviteeEmail: string; permission: PermissionLevel; }
export interface Collaborator { id: string; memoirId: string; userId: string; email: string; nickname: string; permission: PermissionLevel; }

export const getCollaborators = async (memoirId: string): Promise<Collaborator[]> => {
  try {
    console.log(`API: Fetching collaborators for memoir ${memoirId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockCollaborators: Collaborator[] = [
      { id: 'collab1', memoirId: memoirId, userId: 'user2', email: 'collaborator1@example.com', nickname: 'CollabUserOne', permission: 'edit' },
      { id: 'collab2', memoirId: memoirId, userId: 'user3', email: 'collaborator2@example.com', nickname: 'ViewerTwo', permission: 'view' },
    ];
    return memoirId === "123" ? mockCollaborators : [];
  } catch (error) { throw new Error(`Failed to get collaborators: ${getErrorMessage(error)}`); }
};

export const inviteCollaborator = async (memoirId: string, data: CollaborationData): Promise<Collaborator> => {
  try {
    console.log(`API: Inviting ${data.inviteeEmail} to memoir ${memoirId} with ${data.permission} permission.`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCollaborator: Collaborator = {
      id: `collab${Math.random().toString(36).substring(2, 9)}`, memoirId: memoirId,
      userId: `user${Math.random().toString(36).substring(2, 9)}`, email: data.inviteeEmail,
      nickname: data.inviteeEmail.split('@')[0], permission: data.permission,
    };
    return newCollaborator;
  } catch (error) { throw new Error(`Failed to invite collaborator: ${getErrorMessage(error)}`); }
};

export const updateCollaboratorPermission = async (collaborationId: string, permission: PermissionLevel): Promise<Collaborator> => {
  try {
    console.log(`API: Updating permission for collaboration ${collaborationId} to ${permission}.`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id: collaborationId, memoirId: "mockMemoirId", userId: "mockUserId", email: "mockemail@example.com", nickname: "Mock User", permission: permission } as Collaborator;
  } catch (error) { throw new Error(`Failed to update permission: ${getErrorMessage(error)}`); }
};

export const removeCollaborator = async (collaborationId: string): Promise<void> => {
  try {
    console.log(`API: Removing collaboration ${collaborationId}.`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return;
  } catch (error) { throw new Error(`Failed to remove collaboration: ${getErrorMessage(error)}`); }
};

// --- Service Request API ---
export type ServiceRequestStatus = 'pending' | 'accepted' | 'in-progress' | 'completed' | 'rejected';
export interface ServiceRequestData { type: string; description: string; contactPhone: string; address: string; preferredDate?: string; }
export interface ServiceRequest extends ServiceRequestData { id: string; userId: string; status: ServiceRequestStatus; createdAt: string; updatedAt?: string; }

export const submitServiceRequest = async (data: ServiceRequestData): Promise<ServiceRequest> => {
  try {
    console.log("API: Submitting service request", data);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newRequest: ServiceRequest = { ...data, id: `sr_${Math.random().toString(36).substring(2, 10)}`, userId: 'currentUserMockId', status: 'pending', createdAt: new Date().toISOString() };
    return newRequest;
  } catch (error) { throw new Error(`Failed to submit service request: ${getErrorMessage(error)}`); }
};

export const getUserServiceRequests = async (): Promise<ServiceRequest[]> => {
  try {
    console.log("API: Fetching user's service requests");
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockRequests: ServiceRequest[] = [
      { id: 'sr_1', userId: 'currentUserMockId', type: 'Plumbing', description: 'Leaky faucet in kitchen.', contactPhone: '123-456-7890', address: '123 Main St, Anytown', status: 'completed', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), preferredDate: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: 'sr_2', userId: 'currentUserMockId', type: 'Electrical', description: 'Outlet not working in living room.', contactPhone: '123-456-7890', address: '123 Main St, Anytown', status: 'in-progress', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    ];
    return mockRequests;
  } catch (error) { throw new Error(`Failed to get user service requests: ${getErrorMessage(error)}`); }
};

export const getServiceRequestById = async (id: string): Promise<ServiceRequest> => {
  try {
    console.log(`API: Fetching service request by ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const list = await getUserServiceRequests();
    const found = list.find(r => r.id === id);
    if (found) return found;
    return { id: id, userId: 'currentUserMockId', type: 'Mock Service Type', description: `This is a detailed description for service request ${id}.`, contactPhone: '555-0101', address: '456 Oak Ave, Mockville', status: 'pending', createdAt: new Date().toISOString() };
  } catch (error) { throw new Error(`Failed to get service request by ID: ${getErrorMessage(error)}`); }
};

// --- Publishing Order API ---
export type PublishFormat = 'ebook' | 'paperback' | 'hardcover';
export type PublishOrderStatus = 'pending' | 'awaiting_payment' | 'in_production' | 'shipped' | 'completed' | 'cancelled';
export interface PublishOrderData { memoirId: string; format: PublishFormat; quantity: number; notes?: string; shippingAddress?: string; }
export interface PublishOrder extends PublishOrderData { id: string; userId: string; status: PublishOrderStatus; estimatedDeliveryDate?: string; trackingNumber?: string; createdAt: string; updatedAt?: string; }

export const submitPublishOrder = async (data: PublishOrderData): Promise<PublishOrder> => {
  try {
    console.log("API: Submitting publish order", data);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newOrder: PublishOrder = { ...data, id: `po_${Math.random().toString(36).substring(2, 10)}`, userId: 'currentUserMockId', status: 'pending', createdAt: new Date().toISOString() };
    return newOrder;
  } catch (error) { throw new Error(`Failed to submit publish order: ${getErrorMessage(error)}`); }
};

export const getUserPublishOrders = async (): Promise<PublishOrder[]> => {
  try {
    console.log("API: Fetching user's publish orders");
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockOrders: PublishOrder[] = [
      { id: 'po_1', userId: 'currentUserMockId', memoirId: 'memoir123', format: 'paperback', quantity: 2, shippingAddress: '123 Reader Ln, Booksville', status: 'shipped', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), trackingNumber: 'TRK12345XYZ', estimatedDeliveryDate: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: 'po_2', userId: 'currentUserMockId', memoirId: 'memoir456', format: 'ebook', quantity: 1, status: 'completed', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    ];
    return mockOrders;
  } catch (error) { throw new Error(`Failed to get user publish orders: ${getErrorMessage(error)}`); }
};

export const getPublishOrderById = async (id: string): Promise<PublishOrder> => {
  try {
    console.log(`API: Fetching publish order by ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const list = await getUserPublishOrders();
    const found = list.find(o => o.id === id);
    if (found) return found;
    return { id: id, userId: 'currentUserMockId', memoirId: 'memoir_fallback', format: 'paperback', quantity: 1, status: 'pending', createdAt: new Date().toISOString() };
  } catch (error) { throw new Error(`Failed to get publish order by ID: ${getErrorMessage(error)}`); }
};

// --- Community / Public Memoir API ---
export interface PublicMemoirSummary { id: string; title: string; authorId: string; authorNickname: string; snippet: string; likeCount: number; isPublic: true; }
export interface MemoirCommentData { memoirId: string; text: string; } // For creating a comment
export interface MemoirComment { id: string; memoirId: string; userId: string; userNickname: string; text: string; createdAt: string; }

export const getPublicMemoirs = async (filters?: any): Promise<PublicMemoirSummary[]> => {
  try {
    console.log("API (mock): Fetching public memoirs with filters:", filters);
    await new Promise(resolve => setTimeout(resolve, 700));
    // This would be: const response = await apiClient.get<PublicMemoirSummary[]>('/community/memoirs', { params: filters });
    return [
      { id: 'sample-public-id', title: 'A Journey Through Time', authorId: 'user123', authorNickname: 'TimeTraveler', snippet: 'This memoir recounts the incredible adventures across various eras...', likeCount: 155, isPublic: true },
      { id: 'memoir-deux', title: 'Baking My Way to Happiness', authorId: 'user456', authorNickname: 'BakerExtraordinaire', snippet: 'Discover how a simple hobby turned into a life-changing passion for baking...', likeCount: 230, isPublic: true },
      { id: 'memoir-trois', title: 'Coding the Future', authorId: 'user789', authorNickname: 'CodeWizard', snippet: 'Insights from a decade of software development, exploring the highs and lows...', likeCount: 98, isPublic: true },
    ];
  } catch (error) { throw new Error(`Failed to get public memoirs: ${getErrorMessage(error)}`); }
};

export const getPublicMemoirDetails = async (id: string): Promise<{ memoir: MemoirResponse; comments: MemoirComment[] }> => {
  try {
    console.log(`API (mock): Fetching public memoir details for ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    // This would be: const response = await apiClient.get<{ memoir: MemoirResponse; comments: MemoirComment[] }>(`/community/memoirs/${id}`);
    // For the memoir part, we can reuse/enhance getMemoirById's mock or create a specific one
    const memoirDetails = await getMemoirById(id); // Assuming getMemoirById gives enough detail (like content_html, author, etc.)
    if (!memoirDetails.isPublic) { // Ensure only public memoirs are fetched this way, or backend handles it.
        // throw new Error("This memoir is not public."); // Or handle as per app's requirements
        console.warn(`API (mock): Memoir ${id} might not be public, but returning details for dev purposes.`);
    }

    const mockComments: MemoirComment[] = [
      { id: 'comment1', memoirId: id, userId: 'userABC', userNickname: 'ReaderFan', text: 'What an inspiring story! Thanks for sharing.', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'comment2', memoirId: id, userId: 'userXYZ', userNickname: 'BookwormGal', text: 'Loved the part about the old library. So vivid!', createdAt: new Date().toISOString() },
    ];
    return { memoir: memoirDetails, comments: id === "sample-public-id" || id === "memoir-deux" ? mockComments : [] };
  } catch (error) { throw new Error(`Failed to get public memoir details: ${getErrorMessage(error)}`); }
};

export const likeMemoir = async (memoirId: string): Promise<{ success: boolean; likeCount: number }> => {
  try {
    console.log(`API (mock): Liking memoir ${memoirId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // This would be: const response = await apiClient.post<{ success: boolean; likeCount: number }>(`/memoirs/${memoirId}/like`); return response.data;
    const currentMemoir = await getMemoirById(memoirId); // Fetch to get current like count for mock
    return { success: true, likeCount: (currentMemoir.likeCount || 0) + 1 };
  } catch (error) { throw new Error(`Failed to like memoir: ${getErrorMessage(error)}`); }
};

export const unlikeMemoir = async (memoirId: string): Promise<{ success: boolean; likeCount: number }> => {
  try {
    console.log(`API (mock): Unliking memoir ${memoirId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // This would be: const response = await apiClient.delete<{ success: boolean; likeCount: number }>(`/memoirs/${memoirId}/like`); return response.data;
    const currentMemoir = await getMemoirById(memoirId); // Fetch to get current like count for mock
    return { success: true, likeCount: Math.max(0, (currentMemoir.likeCount || 0) - 1) };
  } catch (error) { throw new Error(`Failed to unlike memoir: ${getErrorMessage(error)}`); }
};

export const addCommentToMemoir = async (data: MemoirCommentData): Promise<MemoirComment> => {
  try {
    console.log(`API (mock): Adding comment to memoir ${data.memoirId}`, data.text);
    await new Promise(resolve => setTimeout(resolve, 400));
    // This would be: const response = await apiClient.post<MemoirComment>(`/memoirs/${data.memoirId}/comments`, { text: data.text }); return response.data;
    return {
      id: `comment${Math.random().toString(36).substring(2, 9)}`,
      memoirId: data.memoirId,
      userId: 'currentUserMockId', // This would be the actual logged-in user's ID
      userNickname: 'CurrentUser', // Logged-in user's nickname
      text: data.text,
      createdAt: new Date().toISOString(),
    };
  } catch (error) { throw new Error(`Failed to add comment: ${getErrorMessage(error)}`); }
};

// Axios interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
