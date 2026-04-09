import conf from "../conf/conf.js";
import axios from "axios";

export class CommentService {
  constructor() {
    this.api = axios.create({
      baseURL: conf.backendUrl + "/comments",
      withCredentials: true,
    });
  }

  async createComment({ comment, postId }) {
    try {
      const response = await this.api.post("/", { comment, postId });
      return response.data.data;
    } catch (error) {
      console.log("CommentService :: createComment :: error", error);
      console.log("Error response:", error.response?.data);
      return false;
    }
  }

  async getComments(postId) {
    try {
      const response = await this.api.get(`/${postId}`);
      return response.data.data;
    } catch (error) {
      console.log("CommentService :: getComments :: error", error);
      return false;
    }
  }

  async deleteComment(commentId) {
    try {
      await this.api.delete(`/${commentId}`);
      return true;
    } catch (error) {
      console.log("CommentService :: deleteComment :: error", error);
      return false;
    }
  }
}

const commentService = new CommentService();
export default commentService;

