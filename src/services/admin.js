import axios from 'axios';

class AdminService {
  constructor() {
    this.usersApi = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL + '/users',
      withCredentials: true,
    });
    this.postsApi = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_URL + '/posts',
      withCredentials: true,
    });
  }

  // User Management
  async getAllUsers() {
    const response = await this.usersApi.get('/');
    return response.data.data; // Extract data from ApiResponse
  }

  async updateUserRole(id, role) {
    const response = await this.usersApi.patch(`/${id}/role`, { role });
    return response.data.data;
  }

  async updateUserStatus(id, status) {
    const response = await this.usersApi.patch(`/${id}/status`, { status });
    return response.data.data;
  }

  async blockUser(id) {
    const response = await this.usersApi.patch(`/${id}/status`, { status: 'blocked' });
    return response.data.data;
  }

  async unblockUser(id) {
    const response = await this.usersApi.patch(`/${id}/status`, { status: 'active' });
    return response.data.data;
  }

  async deleteUser(id) {
    const response = await this.usersApi.delete(`/${id}`);
    return response.data.data;
  }

  // Post Management
  async getAllPosts() {
    const response = await this.postsApi.get('/admin/all');
    return response.data.data; // Extract data from ApiResponse
  }

  async togglePostStatus(id, isActive) {
    const response = await this.postsApi.patch(`/${id}/status`, { 
      status: isActive ? 'active' : 'inactive' 
    });
    return response.data.data;
  }

  async deletePost(id) {
    const response = await this.postsApi.delete(`/${id}`);
    return response.data.data;
  }

  // Admin Stats
  async getAdminStats() {
    const response = await this.usersApi.get('/admin/stats');
    return response.data.data; // Extract data from ApiResponse
  }
}

export const adminService = new AdminService();
