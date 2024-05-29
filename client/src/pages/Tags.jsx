import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom';

import React from 'react'
import Post from '../components/Post';
import { useTranslation } from 'react-i18next';

const Tags = () => {
    const location = useLocation();
    const state = location.state;
    const isAdmin = state.isAdmin
    const isMyProfile= state.isMyProfile
    const POST_ENDPOINT = "/api/posts/all"
    const { t } = useTranslation()
    const tag = location.pathname.replace('/tag/', '');
    const { data: posts, isLoading: loadingPosts, refetch: refetchPosts, isRefetching: isRefetchingPosts } = useQuery({
        queryKey: ["posts"],
        queryFn: async () => {
            try {
                let res = await fetch(POST_ENDPOINT)
                let data = await res.json()
                if (!res.ok) throw new Error(data.error || "Something went wrong")
                return data
            } catch (error) {
                throw new Error(error.message)
            }
        }
    });

    
    
    const filteredPosts = posts?.filter(post => post?.tags.includes(tag))

    if (loadingPosts) {
        return <div className='w-full h-svh flex justify-center items-center'><div className='loader'></div></div>;
    }



    return (
        <>
            <div className='flex gap-1'>{t('tags-title')} <p className=' cursor-auto'>{tag}</p> </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {
                    filteredPosts.map(post => (

                        <Post key={post._id} post={post} tagsPost={true} isAdmin={isAdmin} isMyProfile={isMyProfile} />
                    ))
                }
            </div>
        </>
    )
}

export default Tags