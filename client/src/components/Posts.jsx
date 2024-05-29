import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Link } from 'react-router-dom';
import TagsList from './TagsList';
import Post from './Post';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Keyboard, Pagination, Navigation } from 'swiper/modules';
import useLocalstorage from '../trans/useLocalstorage';
import { useTranslation } from 'react-i18next';

const Posts = ({userId, isAdmin}) => {
  const [language, setLanguage] = useLocalstorage('language', 'en')
  const { t } = useTranslation()
  const POST_ENDPOINT = "/api/posts/all";
  const COLLECTION_ENDPOINT = "/api/collections/all";

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

  // Extract and filter unique tags from posts
  let tags = [];
  if (posts) {
    posts.forEach(post => {
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
    <div>
      <h1 className='text-primary font-medium text-xl mt-10 mb-5'>{t('home-posts')}</h1>
      {!loadingPosts && !isRefetchingPosts && posts && (
        <Swiper className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4  gap-5'
          breakpoints={{
            240: { slidesPerView: 1.2 },
            320: { slidesPerView: 1.2 },
            430: { slidesPerView: 1.5 },
            576: { slidesPerView: 2.5 },
            768: { slidesPerView: 3.5 },
            992: { slidesPerView: 3.5 },
            1200: { slidesPerView: 4.5 },
          }}
          keyboard={{
            enabled: true,
          }}

          navigation={true}
          modules={[Keyboard, Navigation]}
          spaceBetween={30}
        >
          {posts.map((post, i) => (
            <SwiperSlide key={i}>
              {/* <Link to={'/post/' + post._id} state={post} > */}
                <Post key={i} userId={userId} post={post} index={i} isAdmin={isAdmin} canDelete={false} />
              {/* </Link> */}
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      <h1 className='text-primary font-medium text-xl mt-10 mb-5'>{t('home-collections')}:</h1>
      {!loadingCollections && !isRefetchingCollections && collections && (
        <div className='grid grid-cols-4 gap-4'>
          {collections.map((collection, i) => (
            <Link className='link-hover' to={`/collections/${collection._id}`} key={i}> {collection.name}</Link>
          ))}
        </div>
      )}

      <h1 className='text-primary font-medium text-xl mt-10 mb-5'>{t('home-tags')}:</h1>
      {!loadingPosts && !isRefetchingPosts && posts && (
        <TagsList tags={tags} />
      )}
    </div>
  )
}

export default Posts;
