// src/pages/Post.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Service from "../services/config";
import { Button, Container, CommentSection } from "../components";
import parse, { domToReact } from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
  const [post, setPost] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const isAuthor = post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    if (slug) {
      Service.getPost(slug).then((post) => {
        if (post) setPost(post);
        else navigate("/");
      });
    } else navigate("/");
  }, [slug, navigate]);

  const deletePost = () => {
    Service.deletePost(post.$id).then((status) => {
      if (status) {
        Service.deleteFile(post.featuredimage);
        navigate("/");
      }
    });
  };

  return post ? (
    <article className="bg-paper min-h-screen pb-20">
      {/* Hero image */}
      <div className="relative h-[45vh] w-full overflow-hidden bg-paper-dark">
        {post.featuredimage ? (
          <img
            src={Service.getFilePreview(post.featuredimage)}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif italic text-ink-faint">No image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full pb-10 pt-20">
          <Container>
            <div className="max-w-3xl mx-auto">
              <span className="text-xs font-sans uppercase tracking-widest text-ink-faint mb-3 block">Reflection</span>
              <h1 className="font-serif text-3xl md:text-5xl font-bold text-paper leading-tight">
                {post.title}
              </h1>
              <p className="mt-3 text-sm font-sans text-ink-faint">
                {new Date(post.$createdAt || Date.now()).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric"
                })}
              </p>
            </div>
          </Container>
        </div>
      </div>

      <Container>
        <div className="max-w-3xl mx-auto pt-10">
          {/* Author controls */}
          {isAuthor && (
            <div className="flex justify-end gap-3 mb-8">
              <Link to={`/edit-post/${post.$id}`}>
                <Button>Edit Post</Button>
              </Link>
              <Button
                className="!bg-paper !text-ink border-ink hover:!bg-paper-dark"
                onClick={deletePost}
              >
                Delete
              </Button>
            </div>
          )}

          {/* Article body */}
          <div className="font-serif text-lg leading-8 text-ink">
            {parse(String(post.content || ""), {
              replace: (node) => {
                if (node.type !== "tag") return undefined;
                const Tag = node.name;
                const children = node.children ? domToReact(node.children) : null;
                const plainText = (node.children || [])
                  .map((c) => {
                    if (c.type === "text") return c.data || "";
                    if (c.children && Array.isArray(c.children))
                      return c.children.map((cc) => cc.data || "").join("");
                    return "";
                  })
                  .join("").trim();

                const isArabic = /[\u0600-\u06FF]/.test(plainText);
                if (isArabic) {
                  return (
                    <div className="border-l-2 border-ink pl-6 my-6" dir="rtl" lang="ar">
                      <p className="font-serif text-xl leading-relaxed text-ink">{children}</p>
                    </div>
                  );
                }

                if (Tag === "h1") return <h1 className="font-serif text-3xl font-bold text-ink mt-12 mb-6">{children}</h1>;
                if (Tag === "h2") return <h2 className="font-serif text-2xl font-bold text-ink mt-10 mb-4">{children}</h2>;
                if (Tag === "h3") return <h3 className="font-serif text-xl font-bold text-ink mt-8 mb-3">{children}</h3>;
                if (Tag === "p") return <p className="text-lg leading-8 text-ink my-4">{children}</p>;
                if (Tag === "blockquote") return (
                  <blockquote className="border-l-2 border-ink pl-6 my-6 italic text-ink-mid">{children}</blockquote>
                );
                if (Tag === "ul") return <ul className="list-disc ml-6 space-y-2 my-4 text-ink">{children}</ul>;
                if (Tag === "ol") return <ol className="list-decimal ml-6 space-y-2 my-4 text-ink">{children}</ol>;
                if (Tag === "img") {
                  return <img src={node.attribs?.src} alt={node.attribs?.alt || "image"} className="my-6 w-full" />;
                }
                return undefined;
              },
            })}
          </div>

          <hr className="border-rule my-12" />

          {/* Comments */}
          <CommentSection postId={post._id} userData={userData} />

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-rule">
            <Link
              to="/all-posts"
              className="text-sm font-sans uppercase tracking-widest text-ink-faint hover:text-ink transition-colors"
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </Container>
    </article>
  ) : null;
}
