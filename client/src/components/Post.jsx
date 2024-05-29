import React from 'react';
import { MdDelete } from "react-icons/md";
import ModalWithTags from './ModalWithTags';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaRegHeart } from 'react-icons/fa';

const Post = ({ userId, post, isMyProfile, canDelete, index, tagsPost, isAdmin }) => {
    const isLiked = post?.likes.includes(userId);
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const { data: authUser } = useQuery({ queryKey: ["authUser"] });
    if (!isMyProfile) {
        isMyProfile = post?.user?._id === authUser?._id
    }
    
    const { mutate: deletePost, isPending: isDeleting } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`/api/posts/${post?._id}`, {
                    method: "DELETE",
                });
                if (!res.ok) throw new Error('Error deleting post');
            } catch (error) {
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("Post deleted successfully");
        }
    });

    const handleDeletePost = (e) => {
        e.preventDefault();
        deletePost();
    };
    console.log("isAdmin", isAdmin);
    console.log("isMyProfile", isMyProfile);

    return (
        <div className="card sm:w-full sm:max-h-200 w-full bg-base-100 shadow-xl border-b-slate-300 border-2 p-4 rounded-md max-h-400 h-full sm:h-300" key={index}>
            <figure className='sm:w-full'>
                <img src={post?.img} alt="" className='xl:w-1/3 sm:w-1/2 md:w1/2' />
            </figure>
            <div className="card-body">
                <h2 className="card-title">
                    {post?.title}
                </h2>
                <p className='truncate ...'>{post?.text}</p>
                <Link to={`/post/${post?._id}`} className='btn btn-outline btn-info' state={{ post, userId: authUser?._id, authUser: authUser, isMyProfile: isMyProfile, isAdmin: isAdmin }}>{t("open")}</Link>
                <div className="card-actions justify-between">
                    {(isMyProfile || isAdmin) && (
                        <div className='flex'>
                            <button className="btn btn-outline cursor-default btn-error" onClick={handleDeletePost}>
                                <MdDelete />
                            </button>
                        </div>
                    )}
                    <div className='flex gap-1 items-center group cursor-pointer'>

                        {!isLiked && (
                            <FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
                        )}
                        {isLiked && (
                            <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />
                        )}

                        <span
                            className={`text-sm  group-hover:text-pink-500 ${isLiked ? "text-pink-500" : "text-slate-500"
                                }`}
                        >
                            {post?.likes.length}
                        </span>
                    </div>
                    {!tagsPost && <label htmlFor={`modal_${post?._id}`} className="btn">{t("post-seetags")}</label>}
                    <input type="checkbox" id={`modal_${post?._id}`} className="modal-toggle" />
                    <div className="modal" role="dialog">
                        <div className="modal-box rounded-xl">
                            <ModalWithTags post={post} />
                            <div className='flex justify-end'>
                                <label htmlFor={`modal_${post?._id}`} className="btn mt-10 justify-end">{t("close")}!</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;
