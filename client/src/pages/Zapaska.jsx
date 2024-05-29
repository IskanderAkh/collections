import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { formatPostDate } from '../utils/date/index';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';
import axios from 'axios';
import DeleteCollection from '../components/DeleteCollection';
import { useLocation } from 'react-router-dom';

const Collection = ({ authUser }) => {
  const location = useLocation()
  const state = location.state;
  const [collection, setCollection] = useState(state?.collection)
  const userId = state?.userId;
  const [addable, setAddable] = useState(false);

  const collectionName = collection?.name || location.pathname.replace('/collections/', '');
  ;

  const POST_ENDPOINT = '/api/posts/all';

  const isAdmin = authUser?.access == "admin";



  const { data: posts, isLoading: isLoadingPosts, isError: isErrorPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT);
        const data = await res.json();
        return data;
      } catch (error) {
        console.log(error);
      }
    }
  });





  let postCreatedAt = collection?.createdAt;
  const collectionUserId = collection?.userId;

  const formattedPostDate = formatPostDate(postCreatedAt);

  const postsIdArray = collection?.postsId || [];

  const filteredPosts = posts ? posts.filter(post => postsIdArray.includes(post._id)) : [];

  const canCreatePost = isAdmin || (collection?.userId === authUser?._id);
  const user = collection?.author



  return (
    <>
      {canCreatePost && <CreatePost collectionName={collectionName} userId={authUser?._id} collectionUserId={collection?.userId} isAdmin={isAdmin} />}
      <div className='flex-col w-full text-center flex items-center justify-center mt-10'>
        {(isAdmin || authUser?._id === collectionUserId) && <DeleteCollection collection={collection} />}
        <div className='flex text-start flex-col mt-10'>

          <h1 className='card-title text-3xl font-medium'>Collection: <p className='font-bold'>{collectionName}</p></h1>
          <h1 className='card-title text-3xl font-medium'>Author:  <p className='font-bold'>{user}</p></h1>
        </div>
      </div>
      <div className='hidden grid-cols-1 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-10'>
        {filteredPosts.map((post) => (
          <Post
            post={post}
            key={post._id}
            isAdmin={isAdmin}
            isMyProfile={post.user._id === authUser?._id}
          />
        ))}
      </div>

      <div className='block sm:hidden'>
        <Swiper
          slidesPerView={1.6}
          spaceBetween={30}
          centeredSlides={true}
          navigation={true}
          modules={[Pagination, Navigation]}
          className="mySwiper"
        >
          {filteredPosts.map((post) => (
            <SwiperSlide key={post._id}>
              <Post
                post={post}
                isAdmin={isAdmin}
                isMyProfile={post.user === authUser?._id}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}

export default Collection;
