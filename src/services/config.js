import conf from "../conf/conf.js";
import axios from "axios";

export class Service {
  constructor() {
    this.api = axios.create({
      baseURL: conf.backendUrl + "/posts",
      withCredentials: true,
    });
  }

  // Helper to map backend response to Appwrite format
  mapPost(post) {
    if (!post) return null;
    return {
      ...post,
      $id: post.slug, // Using slug as ID for routing
      $createdAt: post.createdAt,
      featuredimage: post.featuredImage, // Map backend camelCase to frontend expected lowercase
      userId: post.author?._id || post.author, // Handle populated or ID
    };
  }

  async createPost({ title, slug, content, featuredimage, status, userId }) {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("content", content);
      formData.append("status", status);
      formData.append("userId", userId);

      if (featuredimage && typeof featuredimage === "object") {
        formData.append("featuredImage", featuredimage);
      } else {
        console.log("No image to append, featuredimage:", featuredimage);
      }
      const response = await this.api.post("/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return this.mapPost(response.data.data);
    } catch (error) {
      console.log("Backend service :: createPost :: error", error);
      console.log("Error response:", error.response?.data);
      return false;
    }
  }

  async updatePost(slug, { title, content, featuredimage, status }) {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("status", status);

      if (featuredimage && typeof featuredimage === "object") {
        formData.append("featuredImage", featuredimage);
      }

      const response = await this.api.put(`/${slug}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return this.mapPost(response.data.data);
    } catch (error) {
      console.log("Service :: updatePost :: error", error);
      return false;
    }
  }

  async deletePost(slug) {
    try {
      await this.api.delete(`/${slug}`);
      return true;
    } catch (error) {
      console.log("Service :: deletePost :: error", error);
      return false;
    }
  }

  async getPost(slug) {
    try {
      const response = await this.api.get(`/${slug}`);
      return this.mapPost(response.data.data);
    } catch (error) {
      console.log("Service :: getPost :: error", error);
      return false;
    }
  }

  async getPosts(queries = []) {
    try {
      // Queries handling (simplified for now, assuming status=active)
      const response = await this.api.get("/");
      const posts = response.data.data.map((post) => this.mapPost(post));
      return {
        documents: posts,
        total: posts.length,
      };
    } catch (error) {
      console.log("Service :: getPosts :: error", error);
      return false;
    }
  }
  // Comment methods removed - use CommentService from comment.js instead
  
  // File upload service - Modified to return file object for createPost
  async uploadFile(file) {
    try {
      // Return object with $id as the file itself, so it gets passed to createPost
      return { $id: file };
    } catch (error) {
      console.log("Service :: uploadFile :: error", error);
      return false;
    }
  }

  async deleteFile(fileId) {
    // No-op, handled by backend update/delete
    return true;
  }

  getFilePreview(fileId) {
    // fileId is now the URL
    return fileId;
  }
}

const service = new Service();
export default service;

// import conf from '../conf/conf.js';
// import { Client, ID, Databases, Storage, Query } from "appwrite";
// import parse from "html-react-parser";

// function parseSlug(value) {
//     return value
//         .toString()
//         .toLowerCase()           // Convert to lowercase
//         .trim()                  // Trim whitespace
//         .replace(/\s+/g, '-')    // Replace spaces with hyphens
//         .replace(/[^\w\-]+/g, '')// Remove all non-alphanumeric characters (except hyphens)
//         .slice(0, 36);           // Ensure max length of 36 characters
// }

// export class Service{
//     client = new Client();
//     databases;
//     bucket;

//     constructor(){
//         this.client
//         .setEndpoint(conf.appwriteurl)
//         .setProject(conf.appwriteProjectId);
//         this.databases = new Databases(this.client);
//         this.bucket = new Storage(this.client);
//     }

//     async createPost({title, slug, content, featuredimage, status, userId}){
//         // Validate slug before creation
//         if (typeof slug !== 'string' || slug.length > 36 || !/^[a-zA-Z0-9][a-zA-Z0-9_]*$/.test(slug)) {
//             console.log('Invalid slug: must be a valid string, max 36 chars, and cannot start with an underscore.');
//             return false;
//         }

//         try {
//             return await this.databases.createDocument(
//                 conf.appwriteDatabaseId,
//                 conf.appwriteCollectionId,
//                 slug,
//                 { title, content, featuredimage, status, userId }
//             )
//         } catch (error) {
//             console.log("Appwrite service :: createPost :: error", error);
//         }
//     }

//     async updatePost(slug, {title, content, featuredimage, status}){
//         try {
//             return await this.databases.updateDocument(
//                 conf.appwriteDatabaseId,
//                 conf.appwriteCollectionId,
//                 slug,
//                 { title, content, featuredimage, status }
//             )
//         } catch (error) {
//             console.log("Appwrite service :: updatePost :: error", error);
//         }
//     }

//     async deletePost(slug){
//         try {
//             await this.databases.deleteDocument(
//                 conf.appwriteDatabaseId,
//                 conf.appwriteCollectionId,
//                 slug
//             )
//             return true;
//         } catch (error) {
//             console.log("Appwrite service :: deletePost :: error", error);
//             return false;
//         }
//     }

//     async getPost(slug) {
//         // Validate slug before fetching
//         const newSlug = parseSlug(slug);
//         if (typeof slug !== 'string' || slug.length > 36 || !/^[a-zA-Z0-9][a-zA-Z0-9_]*$/.test(slug)) {
//             console.log('Invalid slug: must be a valid string, max 36 chars, and cannot start with an underscore.');
//             return false;
//         }

//         try {
//             return await this.databases.getDocument(
//                 conf.appwriteDatabaseId,
//                 conf.appwriteCollectionId,
//                 slug
//             );
//         } catch (error) {
//             console.log("Appwrite service :: getPost :: error", error);
//             return false;
//         }
//     }

//     async getPosts(queries = []) {
//         try {
//             // Ensure queries is an array and contains at least one Query object
//             const queryArray = Array.isArray(queries) ? queries : [queries];
//             if (queryArray.length === 0) {
//                 queryArray.push(Query.equal("status", "active"));
//             }

//             return await this.databases.listDocuments(
//                 conf.appwriteDatabaseId,
//                 conf.appwriteCollectionId,
//                 queryArray
//             );
//         } catch (error) {
//             console.log("Appwrite service :: getPosts :: error", error);
//             return false;
//         }
//     }

//     // File upload service
//     async uploadFile(file){
//         try {
//             return await this.bucket.createFile(
//                 conf.appwriteBucketId,
//                 ID.unique(),
//                 file
//             );
//         } catch (error) {
//             console.log("Appwrite service :: uploadFile :: error", error);
//             return false;
//         }
//     }

//     async deleteFile(fileId){
//         try {
//             await this.bucket.deleteFile(
//                 conf.appwriteBucketId,
//                 fileId
//             );
//             return true;
//         } catch (error) {
//             console.log("Appwrite service :: deleteFile :: error", error);
//             return false;
//         }
//     }

//     getFilePreview(fileId){
//         return this.bucket.getFilePreview(
//             conf.appwriteBucketId,
//             fileId
//         );
//     }
// }

// const service = new Service();
// export default service;
