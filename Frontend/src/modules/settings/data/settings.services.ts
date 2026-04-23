import { httpClient } from "@/core/infra/HttpClient";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserWithPermissions extends UserProfile {
  permissions?: Record<string, { active: boolean; features: Record<string, boolean> }>;
}

export const settingsServices = {
  async getAll(): Promise<Setting[]> {
    const response = await httpClient.get<any>('/settings');
    return response?.data?.data || response?.data || [];
  },

  async get(key: string): Promise<Setting | undefined> {
    const response = await httpClient.get<any>(`/settings/${key}`);
    return response?.data || response;
  },

  async set(key: string, value: string): Promise<Setting> {
    const response = await httpClient.post<any>('/settings', { key, value });
    return response?.data || response;
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/settings/${id}`);
  },

  async getUserProfile(): Promise<UserProfile> {
    const response = await httpClient.get<any>('/users/me');
    return response?.data || response;
  },

  async updateUserProfile(data: { name?: string; phone?: string; avatar?: string }): Promise<UserProfile> {
    const response = await httpClient.put<any>('/users/me', data);
    return response?.data || response;
  },

  async getAllUsers(): Promise<UserWithPermissions[]> {
    const response = await httpClient.get<any>('/users');
    return response?.data?.data || response?.data || [];
  },

  async getUserPermissions(userId: string): Promise<any> {
    const response = await httpClient.get<any>(`/user-permissions/user/${userId}`);
    return response?.data || response;
  },

  async updateUserPermissions(userId: string, permissions: Record<string, any>): Promise<any> {
    const response = await httpClient.put<any>(`/user-permissions/user/${userId}`, permissions);
    return response?.data || response;
  },

  async getSystemPermissions(): Promise<any> {
    const response = await httpClient.get<any>('/settings/system_permissions');
    return response?.data || response;
  },

  async saveSystemPermissions(permissions: Record<string, any>): Promise<any> {
    const response = await httpClient.post<any>('/settings/system_permissions', permissions);
    return response?.data || response;
  },

  async createUser(data: { name: string; email: string; password: string; role: string }): Promise<any> {
    const response = await httpClient.post<ApiResponse<any>>('/users/public-register', data);
    return response.data;
  },
};