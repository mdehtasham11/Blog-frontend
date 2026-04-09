import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import { AuthLayout, Login, Signup, ForgotPassword, ResetPassword } from "./components/index.js";
import AdminLayout from "./components/AdminLayout";

import AddPost from "./pages/AddPost";
import EditPost from "./pages/EditPost";
import Post from "./pages/Post";
import AllPosts from "./pages/AllPosts";
import AdminPanel from "./pages/AdminPanel";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: (
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        ),
      },
      {
        path: "/signup",
        element: (
          <AuthLayout authentication={false}>
            <Signup />
          </AuthLayout>
        ),
      },
      {
        path: "/forgot-password",
        element: (
          <AuthLayout authentication={false}>
            <ForgotPassword />
          </AuthLayout>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <AuthLayout authentication={false}>
            <ResetPassword />
          </AuthLayout>
        ),
      },
      {
        path: "/all-posts",
        element: <AllPosts />,
      },
      {
        path: "/add-post",
        element: (
          <AuthLayout authentication>
            <AddPost />
          </AuthLayout>
        ),
      },
      {
        path: "/edit-post/:slug",
        element: (
          <AdminLayout>
            <AuthLayout authentication>
              <EditPost />
            </AuthLayout>
          </AdminLayout>
        ),
      },
      {
        path: "/admin",
        element: (
          <AdminLayout>
            <AuthLayout authentication>
              <AdminPanel />
            </AuthLayout>
          </AdminLayout>
        ),
      },
      {
        path: "/post/:slug",
        element: <Post />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
