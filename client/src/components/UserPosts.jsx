import React from 'react';
import { useQuery } from "@tanstack/react-query";
import TagsList from './TagsList';
import Post from './Post';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const UserPosts = ({ userId, isMyProfile, isAdmin }) => { 

  const POST_ENDPOINT = "/api/posts/all";
  const COLLECTION_ENDPOINT = "/api/collections/all";
  const { t } = useTranslation();

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

  const { data: collections, isLoading: loadingCollections, refetch: refetchCollections, isRefetching: isRefetchingCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      try {
        let res = await fetch(COLLECTION_ENDPOINT)
        let data = await res.json()
        if (!res.ok) throw new Error(data.error || "Something went wrong")
        return data
      } catch (error) {
        throw new Error(error.message)
      }
    }
  });
  const userPosts = posts ? posts.filter(post => post.user._id === userId) : [];
  // console.log(collections);
  const userCollections = collections ? collections.filter(collection => collection?.userId === userId) : [];

  let tags = [];
  if (userPosts) {
    userPosts.forEach(post => {
      if (post.tags) {
        const postTags = post.tags.split(',').flatMap(tag => tag.split(' ')).map(tag => tag.trim());
        postTags.forEach(tag => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
      }
    });
  }
  return (
    <div className='mt-20'>
      <h1 className='text-primary font-medium text-xl mb-8'>
        {isMyProfile ? `${t("profile-userfound-posts")}` : `${t("profile-userfound-posts")}`}
      </h1>
      {!loadingPosts && !isRefetchingPosts && userPosts.length > 0 && (
        <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4  gap-5'>
          {userPosts.map((post, i) => (
            <Post userId={userId} isAdmin={isAdmin} key={i} post={post} index={i} canDelete={true} isMyProfile={isMyProfile} />
          ))}
        </div>)}
      {loadingPosts && <p>{t("profile-loading-your-posts")}</p>}
      {!loadingPosts && !isRefetchingPosts && userPosts.length === 0 && (
        <p>{t("profile-noposts")}</p>
      )}
      <h1 className='text-primary font-medium text-xl mt-10'>{t("profile-post-tags")}:</h1>
      {!loadingPosts && !isRefetchingPosts && posts && (
        <TagsList isAdmin={isAdmin} isMyProfile={isMyProfile} tags={tags} />
      )}
      <h1 className='text-primary font-medium text-xl mt-10'>{t("profile-collections")}:</h1>
      <div>
        {loadingCollections || isRefetchingCollections ? (
          <p>{t('loading')}</p>
        ) : (
          <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2'>
   
            {userCollections && userCollections.length > 0 ? (
              userCollections.map((collection, i) => (
                <Link key={i} to={`/collections/${collection._id}`} state={{collection: collection}} className='btn'>{collection.name}</Link>
              ))
            ) : (
              <p>{t("profile-nocollections")}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserPosts;
