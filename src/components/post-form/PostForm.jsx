import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "../";
import service from "../../services/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function PostForm({ post }) {
  const [error, setError] = useState("");
  const [contentParts, setContentParts] = useState(
    post?.contentParts || (post?.content ? [post.content] : [""])
  );

  const { register, handleSubmit, watch, setValue, control } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.$id || "",
      status: post?.status || "active",
    },
  });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const addContentPart = () => {
    setContentParts([...contentParts, ""]);
  };

  const removeContentPart = (index) => {
    if (contentParts.length > 1) {
      const newParts = contentParts.filter((_, i) => i !== index);
      setContentParts(newParts);
    }
  };

  const updateContentPart = (index, value) => {
    const newParts = [...contentParts];
    newParts[index] = value;
    setContentParts(newParts);
  };

  const submit = async (data) => {
    setError("");

    // Extract content from form data (contentPart0, contentPart1, etc.)
    const contentArray = [];
    for (let i = 0; i < contentParts.length; i++) {
      const partContent = data[`contentPart${i}`];
      if (partContent && partContent.trim() !== "") {
        contentArray.push(partContent);
      }
    }

    const content = contentArray.join("\n\n");

    if (!content) {
      setError("Content is required");
      return;
    }

    if (!userData || !userData._id) {
      setError("User not logged in");
      return;
    }

    try {
      if (post) {
        const dbPost = await service.updatePost(post.$id, {
          title: data.title,
          content: content,
          status: data.status,
          featuredimage: data.image[0] || undefined,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      } else {
        const dbPost = await service.createPost({
          title: data.title,
          slug: data.slug,
          content: content,
          status: data.status,
          featuredimage: data.image[0],
          userId: userData._id,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while saving the post"
      );
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\\d\\s]+/g, "-")
        .replace(/\\s/g, "-");

    return "";
  }, []);

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: true })}
        />
        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Parts:
          </label>
          {contentParts.map((content, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Part {index + 1}
                </label>
                {contentParts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContentPart(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <RTE
                name={`contentPart${index}`}
                control={control}
                defaultValue={content}
                onChange={(value) => updateContentPart(index, value)}
              />
              {/* <ReactQuill
                theme="snow"
                value={content}
                onChange={(value) => updateContentPart(index, value)}
                name={`contentPart${index}`}
                control={control}
                defaultValue={content}
                // style={{ height: "200px" }}
              /> */}
            </div>
          ))}
          <button
            type="button"
            onClick={addContentPart}
            className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            + Add Content Part
          </button>
        </div>
        {error && <div className="text-red-500 mt-2 mb-4">{error}</div>}
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {post && (
          <div className="w-full mb-4">
            <img
              src={service.getFilePreview(post.featuredimage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
