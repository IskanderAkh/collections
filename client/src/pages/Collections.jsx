import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../components/LoadingSpinner';
import React, { useState } from 'react';
import Post from '../components/Post';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';

const Collections = () => {
  const FETCH_COLLECTIONS_QUERY = 'api/collections/all';
  const POST_ENDPOINT = 'api/posts/all';
  const [biggestCollections, setBiggestCollections] = useState([])
  const { data: collections, isLoading: loadingCollections, error: collectionsError } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      try {
        let res = await fetch(FETCH_COLLECTIONS_QUERY);
        let data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    }
  });

  const { data: posts, isLoading: loadingPosts, error: postsError } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        let res = await fetch(POST_ENDPOINT);
        let data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    }
  });
  
  if (loadingCollections || loadingPosts) {
    return <LoadingSpinner className="m-auto" />;
  }

  if (collectionsError || postsError) {
    return <div>Error: {collectionsError?.message || postsError?.message}</div>;
  }

  return (
    <div className='collections mt-10'>
      <div className='collection'>
        {collections && collections.length > 0 ? (
          collections.map((collection) => (
            <div key={collection._id}>
              <Link to={`/collections/${collection._id}`} className='card-title link link-primary font-medium mt-10 mb-4' state={{collection: collection}} collection={collection}>{collection.name}</Link>
              <Swiper
                className='posts flex'
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
                modules={[Navigation]}
                spaceBetween={30}
              >
                {posts && posts.length > 0 ? (
                  posts.filter(post => collection.postsId.includes(post._id))
                    .map((post) => (
                      <SwiperSlide className='swiper-slide' key={post._id}>
                        <Post post={post} isMyProfile={false} canDelete={false} index={post?._id} tagsPost={false} />
                      </SwiperSlide>
                    ))
                ) : (
                  <div>No posts found</div>
                )}
              </Swiper>
            </div>
          ))
        ) : (
          <div>No collections found</div>
        )}
      </div>
    </div>
  );
};

export default Collections;
