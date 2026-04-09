import React, { useState, useEffect } from 'react'
import appwriteService from "../services/config"
import { Link } from 'react-router-dom'

function PostCard({ $id, title, featuredimage, $createdAt }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (featuredimage) {
      try {
        const url = appwriteService.getFilePreview(featuredimage);
        setImageUrl(url);
      } catch (error) {
        setImageError(true);
      }
    }
  }, [featuredimage]);

  const handleImageError = (e) => {
    setImageError(true);
    e.target.onerror = null;
  };

  return (
    <Link to={`/post/${$id}`} className="block group h-full">
      <article className="bg-paper-white border border-rule hover:border-ink-mid transition-colors duration-200 h-full flex flex-col">
        {/* Image */}
        <div className="aspect-[16/9] overflow-hidden bg-paper-dark">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-ink-faint font-serif italic text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h2 className="font-serif text-lg font-bold italic text-ink leading-snug line-clamp-2 group-hover:text-ink-mid transition-colors mb-3">
            {title}
          </h2>

          <hr className="border-rule my-3" />

          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs font-sans uppercase tracking-widest text-ink-faint border border-rule px-2 py-0.5">
              Reflection
            </span>
            <time className="text-xs font-sans text-ink-faint">
              {new Date($createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </time>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default PostCard
