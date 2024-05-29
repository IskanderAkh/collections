import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaRegHeart } from 'react-icons/fa';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';
import { formatPostDate, formatMemberSinceDate } from '../../utils/date/index';
import { useTranslation } from 'react-i18next';
import EditPostModal from './EditPostModal';

const PostPage = () => {
  const location = useLocation();
  const state = location.state;
  const post = state?.post;
  const userId = state?.userId;
  const isAdmin = state?.isAdmin
  const authUser = state?.authUser

  const isMyProfile = state?.isMyProfile
  
  
  
  const { t } = useTranslation()

  const isLiked = post?.likes.includes(userId);
  const queryClient = useQueryClient();
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch('/api/posts/all')
        const data = res.json()
        return data
      } catch (error) {
        console.log(error);
      }
    }
  })
  console.log(authUser);
  const currentPost = posts?.find((p) => p?._id === post?._id);
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${currentPost._id}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes) => {
      queryClient.invalidateQueries(["post", currentPost?._id]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };
  useEffect(() => {
    queryClient.invalidateQueries(["post", currentPost?._id]);
  }, [queryClient, currentPost?._id]);

  if (isLoading) {
    return <div class="text-center">
      <div role="status">
        <svg aria-hidden="true" class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  }
  return (
    <div className="w-full mt-10">
      <div className='flex items-end justify-end mb-20 '>
        {(isAdmin || isMyProfile) &&
          <EditPostModal post={post} user={authUser}></EditPostModal>
        }
      </div>
      <div className="flex">
        <div className="flex-1">
          <img className="w-2/3" src={currentPost?.img} alt="" />
        </div>
        <div className="flex-1">
          <h1><strong>{t("postname")}: </strong>{currentPost?.title}</h1>
          <div className="flex gap-1 items-center group cursor-pointer" onClick={handleLikePost}>
            <strong>{t("likes")}: </strong>
            {isLiking && <LoadingSpinner size='sm' />}
            {!isLiked && !isLiking && (
              <FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
            )}
            {isLiked && !isLiking && (
              <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500' />
            )}

            <span className={`text-sm group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"}`}>
              {currentPost?.likes.length}
            </span>
          </div>
          <p><strong>{t("dsc")}:   </strong>{currentPost?.text}</p>
          <p><strong>{t("home-tags")}:</strong> {currentPost?.tags}</p>
          <p><strong>{t("createcollection-name")}:</strong> {currentPost?.collectionName}</p>
          <p><strong>{t("createdAt")}:</strong> {formatPostDate(currentPost?.createdAt)}</p>
          <p><strong>{t("updatedAt")}:</strong> {formatPostDate(currentPost?.updatedAt)}</p>
          {currentPost?.author && <h1><strong>{t("author")}:</strong> {currentPost?.author}</h1>}
        </div>
      </div>
    </div >
  );
}
export default PostPage;
