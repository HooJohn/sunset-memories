import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Types ---
interface LoginPayload {
  phone: string;
  password: string;
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
  name?: string;
  avatar_url?: string;
  nickname?: string;
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

export const getErrorMessage = (error: any): string => {
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
  return error.message || '发生未知错误';
};

// --- Auth API ---
export const login = async (credentials: LoginPayload): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials, { headers: {'Content-Type': 'application/json'} });
    if (response.data.access_token) localStorage.setItem('authToken', response.data.access_token);
    return response.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
};

export const register = async (userData: RegisterPayload): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData, { headers: {'Content-Type': 'application/json'} });
    return response.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
};

export const fetchUserProfile = async (): Promise<User> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('未找到认证令牌，请先登录');
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
};

export const updateUserProfile = async (data: { name?: string; avatar_url?: string; nickname?: string }): Promise<User> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('未找到认证令牌，请先登录');
    const payload: { name?: string; avatar_url?: string; nickname?: string } = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.avatar_url !== undefined) payload.avatar_url = data.avatar_url;
    if (data.nickname !== undefined) payload.nickname = data.nickname;
    const response = await apiClient.patch<User>('/users/me', payload, { headers: {'Content-Type': 'application/json'} });
    return response.data;
  } catch (error) { throw new Error(getErrorMessage(error)); }
};


// --- Memoir API ---
export interface Chapter {
  id?: string;
  title: string;
  summary?: string;
}
export interface Memoir {
  id: string;
  title: string;
  content_html?: string | null;
  is_public?: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  transcribed_text?: string | null;
  chapters?: Chapter[] | null;
  authorNickname?: string;
  likeCount?: number;
  isLikedByCurrentUser?: boolean;
}
export interface CreateMemoirPayload {
  title: string;
  content_html?: string;
  transcribed_text?: string;
  chapters?: Chapter[];
}
export interface UpdateMemoirPayload {
  title?: string;
  content_html?: string;
  is_public?: boolean;
  transcribed_text?: string;
  chapters?: Chapter[];
}

export const transcribeAudio = async (file: File): Promise<{ transcription: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ transcription: string }>('/memoirs/transcribe', formData);
    return response.data;
  } catch (error) { throw new Error(`语音转文字失败: ${getErrorMessage(error)}`); }
};
export const generateChapters = async (transcribedText: string): Promise<{ chapters: Chapter[] }> => {
  try {
    const response = await apiClient.post<{ chapters: Chapter[] }>('/memoirs/generate-chapters', { transcribedText }, { headers: {'Content-Type': 'application/json'} });
    return response.data;
  } catch (error) { throw new Error(`章节生成失败: ${getErrorMessage(error)}`); }
};
export const createMemoir = async (data: CreateMemoirPayload): Promise<Memoir> => {
  try {
    const response = await apiClient.post<Memoir>('/memoirs', data, { headers: {'Content-Type': 'application/json'} });
    return response.data;
  } catch (error) { throw new Error(`创建回忆录失败: ${getErrorMessage(error)}`); }
};
export const getMemoirs = async (): Promise<Memoir[]> => {
    try {
        const response = await apiClient.get<Memoir[]>('/memoirs');
        return response.data;
    } catch (error) { throw new Error(`Failed to get memoirs: ${getErrorMessage(error)}`); }
};
export const getMemoirById = async (id: string): Promise<Memoir> => {
  try {
    const response = await apiClient.get<Memoir>(`/memoirs/${id}`);
    return response.data;
  } catch (error) { throw new Error(`Failed to fetch memoir: ${getErrorMessage(error)}`); }
};
export const updateMemoir = async (memoirId: string, data: UpdateMemoirPayload): Promise<Memoir> => {
  try {
    const response = await apiClient.patch<Memoir>(`/memoirs/${memoirId}`, data, { headers: {'Content-Type': 'application/json'} });
    return response.data;
  } catch (error) { throw new Error(`更新回忆录失败: ${getErrorMessage(error)}`); }
};
export const deleteMemoir = async (memoirId: string): Promise<void> => {
    try {
        await apiClient.delete(`/memoirs/${memoirId}`);
    } catch (error) { throw new Error(`Failed to delete memoir: ${getErrorMessage(error)}`); }
};

// --- Collaboration API ---
export const CollaborationRole = {
  VIEWER: 'viewer',
  EDITOR: 'editor',
} as const;
export type CollaborationRole = typeof CollaborationRole[keyof typeof CollaborationRole];

export const CollaborationStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;
export type CollaborationStatus = typeof CollaborationStatus[keyof typeof CollaborationStatus];

export interface MemoirCollaboration {
  id: string;
  memoirId: string;
  userId: string;
  role: CollaborationRole;
  status: CollaborationStatus;
  user?: {
    nickname?: string;
    phone?: string;
    name?: string;
    avatar_url?: string;
  };
  memoir?: {
    title?: string;
  };
}
export interface InviteCollaboratorPayload {
  collaboratorPhone: string;
  role: CollaborationRole;
}
export interface RespondToInvitationPayload {
  status: 'accepted' | 'rejected';
}

export const getCollaborators = async (memoirId: string): Promise<MemoirCollaboration[]> => {
  try {
    const response = await apiClient.get<MemoirCollaboration[]>(`/memoirs/${memoirId}/collaborators`);
    return response.data;
  } catch (error) { throw new Error(`Failed to get collaborators: ${getErrorMessage(error)}`); }
};
export const inviteCollaborator = async (memoirId: string, data: InviteCollaboratorPayload): Promise<MemoirCollaboration> => {
  try {
    const response = await apiClient.post<MemoirCollaboration>(`/memoirs/${memoirId}/collaborators`, data, { headers: {'Content-Type': 'application/json'} });
    return response.data;
  } catch (error) { throw new Error(`邀请协作者失败: ${getErrorMessage(error)}`); }
};
export const getPendingInvitations = async (): Promise<MemoirCollaboration[]> => {
    try {
        const response = await apiClient.get<MemoirCollaboration[]>('/collaborations/invitations/pending');
        return response.data;
    } catch (error) { throw new Error(`Failed to fetch pending invitations: ${getErrorMessage(error)}`);}
};
export const respondToInvitation = async (collaborationId: string, data: RespondToInvitationPayload): Promise<MemoirCollaboration> => {
    try {
        const response = await apiClient.patch<MemoirCollaboration>(`/collaborations/invitations/${collaborationId}/respond`, data, { headers: {'Content-Type': 'application/json'} });
        return response.data;
    } catch (error) { throw new Error(`Failed to respond to invitation: ${getErrorMessage(error)}`);}
};
export const updateCollaboratorRole = async (collaborationId: string, role: CollaborationRole): Promise<MemoirCollaboration> => {
  try {
    // TODO: Backend endpoint for this needs to be implemented. Assuming PATCH /collaborations/:collaborationId/role
    const response = await apiClient.patch<MemoirCollaboration>(`/collaborations/${collaborationId}/role`, { role }, { headers: {'Content-Type': 'application/json'} });
    return response.data;
  } catch (error) { throw new Error(`Failed to update collaborator role: ${getErrorMessage(error)}`); }
};
export const removeCollaborator = async (collaborationId: string): Promise<void> => {
  try {
    // TODO: Backend endpoint for this needs to be implemented. Assuming DELETE /collaborations/:collaborationId
    await apiClient.delete(`/collaborations/${collaborationId}`);
  } catch (error) { throw new Error(`Failed to remove collaboration: ${getErrorMessage(error)}`); }
};


// --- Service Request API ---
export const ServiceType = {
  EDITING_ASSISTANCE: "EDITING_ASSISTANCE",
  INTERVIEW_HELP: "INTERVIEW_HELP",
  TECHNICAL_SUPPORT: "TECHNICAL_SUPPORT",
  PHOTO_ORGANIZATION: "PHOTO_ORGANIZATION",
  PUBLISHING_GUIDANCE: "PUBLISHING_GUIDANCE",
  OTHER: "OTHER",
} as const;
export type ServiceType = typeof ServiceType[keyof typeof ServiceType];

export const ServiceRequestStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
} as const;
export type ServiceRequestStatus = typeof ServiceRequestStatus[keyof typeof ServiceRequestStatus];

export interface CreateServiceRequestPayload {
  memoirId?: string; serviceType: ServiceType; description: string;
  contactPhone: string; address: string; preferredDate?: string;
}
export interface ServiceRequest {
  id: string; userId: string; memoirId?: string | null; serviceType: ServiceType;
  details: string; contactPhone?: string | null; address?: string | null;
  preferredDate?: string | null; status: ServiceRequestStatus; created_at: string;
  updated_at?: string | null; user?: Partial<User>; memoir?: Partial<Memoir>;
}
export const submitServiceRequest = async (data: CreateServiceRequestPayload): Promise<ServiceRequest> => {
  try {
    const payload = { ...data, details: data.description, };
    const response = await apiClient.post<ServiceRequest>('/service-requests', payload, { headers: {'Content-Type': 'application/json'} });
    return response.data;
  } catch (error) { throw new Error(`提交服务请求失败: ${getErrorMessage(error)}`); }
};
export const getUserServiceRequests = async (): Promise<ServiceRequest[]> => {
  try {
    const response = await apiClient.get<ServiceRequest[]>('/service-requests');
    return response.data;
  } catch (error) { throw new Error(`Failed to get user service requests: ${getErrorMessage(error)}`); }
};
export const getServiceRequestById = async (id: string): Promise<ServiceRequest> => {
  try {
    const response = await apiClient.get<ServiceRequest>(`/service-requests/${id}`);
    return response.data;
  } catch (error) { throw new Error(`Failed to get service request by ID: ${getErrorMessage(error)}`); }
};

// --- Publishing Order API ---
export type PublishFormat = 'ebook' | 'paperback' | 'hardcover';
export type PublishOrderStatus = 'pending' | 'awaiting_payment' | 'in_production' | 'shipped' | 'completed' | 'cancelled';
export interface PublishOrderData { memoirId: string; format: PublishFormat; quantity: number; notes?: string; shippingAddress?: string; }
export interface PublishOrder extends PublishOrderData { id: string; userId: string; status: PublishOrderStatus; estimatedDeliveryDate?: string; trackingNumber?: string; createdAt: string; updatedAt?: string; }

export const submitPublishOrder = async (data: PublishOrderData): Promise<PublishOrder> => {
  try {
    const response = await apiClient.post<PublishOrder>('/publish-orders', data, { headers: {'Content-Type': 'application/json'} });
    return response.data;
  } catch (error) { throw new Error(`提交出版订单失败: ${getErrorMessage(error)}`); }
};
export const getUserPublishOrders = async (): Promise<PublishOrder[]> => {
  try {
    const response = await apiClient.get<PublishOrder[]>('/publish-orders'); // Assuming endpoint gets orders for current user
    return response.data;
  } catch (error) { throw new Error(`Failed to get user publish orders: ${getErrorMessage(error)}`); }
};
export const getPublishOrderById = async (id: string): Promise<PublishOrder> => {
  try {
    const response = await apiClient.get<PublishOrder>(`/publish-orders/${id}`);
    return response.data;
  } catch (error) { throw new Error(`Failed to get publish order by ID: ${getErrorMessage(error)}`); }
};


// --- Community / Public Memoir API ---
export interface AuthorInfo { id: string; name?: string; avatar_url?: string; nickname?: string; }
export interface PublicChapter { id: string; title: string; content: string; order: number; }
export interface PublicMemoirSummary {
  id: string; title: string; is_public: boolean; created_at: string; updated_at: string;
  author: AuthorInfo;
  likeCount?: number;
  commentCount?: number; // New field for comment count
  isLikedByCurrentUser?: boolean;
  snippet?: string;
}
export interface PublicMemoirDetail {
  id: string; title: string; is_public: boolean; created_at: string; updated_at: string;
  author: AuthorInfo;
  chapters: PublicChapter[];
  content_html?: string | null;
  likeCount?: number; isLikedByCurrentUser?: boolean;
}
export interface MemoirComment {
  id: string; memoirId: string; userId: string;
  user?: AuthorInfo;
  text: string; created_at: string;
}
export interface AddCommentPayload { text: string; }
export interface LikeResponse { success: boolean; likeCount: number; isLikedByCurrentUser?: boolean; }

export const getPublicMemoirs = async (page: number = 1, limit: number = 10): Promise<{ data: PublicMemoirSummary[]; total: number; page: number; limit: number; }> => {
  try {
    const response = await apiClient.get<{ data: PublicMemoirSummary[]; total: number; page: number; limit: number; }>('/memoirs/public', { params: { page, limit } });
    return response.data;
  } catch (error) { throw new Error(`获取公共回忆录失败: ${getErrorMessage(error)}`); }
};

export const getPublicMemoirDetails = async (memoirId: string): Promise<PublicMemoirDetail> => {
  try {
    const response = await apiClient.get<PublicMemoirDetail>(`/memoirs/public/${memoirId}`);
    return response.data;
  } catch (error) { throw new Error(`获取回忆录详情失败: ${getErrorMessage(error)}`); }
};

export const getCommentsForMemoir = async (memoirId: string): Promise<MemoirComment[]> => {
  try {
    // TODO: Backend endpoint GET /memoirs/:memoirId/comments needs implementation.
    const response = await apiClient.get<MemoirComment[]>(`/memoirs/${memoirId}/comments`);
    return response.data;
  } catch (error) { throw new Error(`获取评论失败: ${getErrorMessage(error)}`); }
};

export const likeMemoir = async (memoirId: string): Promise<LikeResponse> => {
  try {
    // TODO: Backend endpoint POST /memoirs/:memoirId/like needs implementation.
    const response = await apiClient.post<LikeResponse>(`/memoirs/${memoirId}/like`, {}, { headers: {'Content-Type': 'application/json'} });
    return response.data;
  } catch (error) { throw new Error(`点赞失败: ${getErrorMessage(error)}`); }
};

export const unlikeMemoir = async (memoirId: string): Promise<LikeResponse> => {
  try {
    // TODO: Backend endpoint DELETE /memoirs/:memoirId/like needs implementation.
    const response = await apiClient.delete<LikeResponse>(`/memoirs/${memoirId}/like`);
    return response.data;
  } catch (error) { throw new Error(`取消点赞失败: ${getErrorMessage(error)}`); }
};

export const addCommentToMemoir = async (memoirId: string, data: AddCommentPayload): Promise<MemoirComment> => {
  try {
    // TODO: Backend endpoint POST /memoirs/:memoirId/comments needs implementation.
    const response = await apiClient.post<MemoirComment>(`/memoirs/${memoirId}/comments`, data, { headers: {'Content-Type': 'application/json'} });
    return response.data;
  } catch (error) { throw new Error(`添加评论失败: ${getErrorMessage(error)}`); }
};


// Axios interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    if (config.data && !(config.data instanceof FormData) && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
