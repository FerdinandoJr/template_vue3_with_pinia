import { defineStore } from 'pinia';
import { ref } from 'vue';
import { httpClient } from '@/core/infra/HttpClient';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface Role {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  isAdmin: boolean;
  order: number;
}

export const useRolesStore = defineStore('roles', {
  state: () => ({
    roles: [] as Role[],
    userRoles: {} as Record<string, Role[]>,
    loading: false
  }),
  actions: {
    async fetchRoles() {
      this.loading = true;
      try {
        const response: ApiResponse<Role[]> = await httpClient.get('/roles');
        this.roles = response.data;
      } catch (error) {
        console.error('Erro ao carregar cargos:', error);
      } finally {
        this.loading = false;
      }
    },

    async createRole(data: { name: string; color?: string }) {
      const response: ApiResponse<Role> = await httpClient.post('/roles', data);
      this.roles.push(response.data);
      return response.data;
    },

    async updateRole(id: string, data: Partial<Role>) {
      const response: ApiResponse<Role> = await httpClient.put(`/roles/${id}`, data);
      const index = this.roles.findIndex(r => r.id === id);
      if (index !== -1) {
        this.roles[index] = response.data;
      }
      return response.data;
    },

    async deleteRole(id: string) {
      await httpClient.delete(`/roles/${id}`);
      this.roles = this.roles.filter(r => r.id !== id);
    },

    async reorderRoles(roleIds: string[]) {
      const response: ApiResponse<Role[]> = await httpClient.post('/roles/reorder', roleIds);
      this.roles = response.data;
    },

    async fetchUserRoles(userId: string) {
      try {
        const response: ApiResponse<Role[]> = await httpClient.get(`/roles/user/${userId}`);
        this.userRoles[userId] = response.data;
        return response.data;
      } catch (error) {
        console.error('Erro ao carregar cargos do usuário:', error);
        return [];
      }
    },

    async assignRoleToUser(userId: string, roleId: string) {
      await httpClient.post(`/roles/${roleId}/assign/${userId}`, {});
      await this.fetchUserRoles(userId);
    },

    async removeRoleFromUser(userId: string, roleId: string) {
      await httpClient.delete(`/roles/${roleId}/remove/${userId}`);
      await this.fetchUserRoles(userId);
    }
  }
});