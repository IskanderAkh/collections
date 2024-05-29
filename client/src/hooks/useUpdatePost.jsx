import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const useUpdatePost = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync: updatePost, isLoading: isUpdatingPost } = useMutation({
    mutationFn: async (formData) => {
      try {
        const res = await fetch(`/api/posts/${formData._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        // Check if response is JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          throw new Error(text);
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (data) => {
      toast.success("Post updated successfully");

      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts"] }),
        queryClient.invalidateQueries({ queryKey: ["post", data._id] }),
      ]);
      console.log(data);
      navigate(`/collections/${data.collectionId}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { updatePost, isUpdatingPost };
};

export default useUpdatePost;
