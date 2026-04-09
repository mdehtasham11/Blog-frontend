import conf from "../conf/conf.js";
import axios from "axios";

export class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: conf.backendUrl + "/users",
      withCredentials: true,
    });
  }

  async createAccount({ email, password, name }) {
    try {
      const response = await this.api.post("/register", {
        email,
        password,
        username: email.split("@")[0], // Generating username from email as fallback
        firstName: name.split(" ")[0],
        lastName: name.split(" ")[1] || "",
      });
      if (response.data) {
        return this.login({ email, password });
      } else {
        return response.data;
      }
    } catch (error) {
      console.log("AuthService :: createAccount :: error", error);
      throw error;
    }
  }

  async login({ email, password }) {
    try {
      const response = await this.api.post("/login", { email, password });
      return response.data;
    } catch (error) {
      console.log("AuthService :: login :: error", error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get("/current-user");
      return response.data.data; // Assuming API returns { data: user }
    } catch (error) {
      console.log("AuthService :: getCurrentUser :: error", error);
      return null;
    }
  }

  async logout() {
    try {
      await this.api.post("/logout");
      return true;
    } catch (error) {
      console.log("AuthService :: logout :: error", error);
      return false;
    }
  }

  async isAdmin() {
    // Check user role from backend (allows both admin and superadmin)
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;
      return user.role === "admin" || user.role === "superadmin";
    } catch (error) {
      return false;
    }
  }

  async isSuperAdmin() {
    // Check if user is superadmin
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;
      return user.role === "superadmin";
    } catch (error) {
      return false;
    }
  }
}

const authService = new AuthService();

export default authService;
