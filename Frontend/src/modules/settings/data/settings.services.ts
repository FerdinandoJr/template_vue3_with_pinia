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
    const response = await httpClient.get<ApiResponse<Setting[]>>('/settings');
    return response.data;
  },

  async get(key: string): Promise<Setting | undefined> {
    const response = await httpClient.get<ApiResponse<Setting>>(`/settings/${key}`);
    return response.data;
  },

  async set(key: string, value: string): Promise<Setting> {
    const response = await httpClient.post<ApiResponse<Setting>>('/settings', { key, value });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/settings/${id}`);
  },

  async getUserProfile(): Promise<UserProfile> {
    const response = await httpClient.get<ApiResponse<UserProfile>>('/users/me');
    return response.data;
  },

  async updateUserProfile(data: { name?: string; phone?: string; avatar?: string }): Promise<UserProfile> {
    const response = await httpClient.put<ApiResponse<UserProfile>>('/users/me', data);
    return response.data;
  },

  async getAllUsers(): Promise<UserWithPermissions[]> {
    const response = await httpClient.get<ApiResponse<UserWithPermissions[]>>('/users');
    return response.data;
  },

  async getUserPermissions(userId: string): Promise<UserWithPermissions> {
    const response = await httpClient.get<ApiResponse<UserWithPermissions>>(`/users/${userId}`);
    return response.data;
  },

  async updateUserPermissions(userId: string, permissions: Record<string, any>): Promise<UserWithPermissions> {
    const response = await httpClient.put<ApiResponse<UserWithPermissions>>(`/users/${userId}/permissions`, permissions);
    return response.data;
  },
};