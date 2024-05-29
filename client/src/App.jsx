import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Collections from './pages/Collections';
import Search from './pages/Search';
import Admin from './pages/Admin';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Tags from './pages/Tags';
import toast, { Toaster } from 'react-hot-toast';
import useLocalstorage from './trans/useLocalstorage';
import i18n from './trans/i18';
import Collection from './pages/Collection';
import PostPage from './components/Post/PostPage';
import CreateCollectionWithPost from './components/Collection/CreateCollectionWithPost';

function App() {
  const [language, setLanguage] = useLocalstorage('language', 'en');

  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong');
        return data;
      } catch (error) {
        throw error;
      }
    }
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.error("You were blocked by admin, try to contact Tech");
      sessionStorage.removeItem("user");
      queryClient.invalidateQueries(['authUser']);
      // navigate('/login');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || "Logout failed");
    },
  });
  useEffect(() => {
    if (authUser) {
      setIsAdmin(authUser.access === 'admin');
    }
    if (authUser?.access === 'blocked') {
      // console.log('blocked');
      logout()
    }
    // console.log(authUser);
  }, [authUser]);



  return (
    <div className="maincontainer flex flex-col items-center w-full">
      <div className="max-w-screen-2xl w-full px-10 relative">
        <Navbar authUser={authUser} language={language} setLanguage={setLanguage} />
        <Routes>
          <Route path={`/`} element={<Home isAdmin={isAdmin} userId={authUser?._id} />} />
          <Route path={`/profile/:username`} element={<Profile authUser={authUser} />} />
          <Route path={`/collections`} element={<Collections authUser={authUser} />} />
          <Route path={`/collections/:collection`} element={<Collection authUser={authUser} isAdmin={isAdmin} />} />
          <Route path={`/search/:input`} element={<Search />} />
          {isAdmin && <Route path={`/admin`} element={<Admin />} />}
          <Route path={`/login`} element={<Login user={authUser} />} />
          <Route path={`/register`} element={<Register />} />
          <Route path={`/tag/:tag`} element={<Tags />} />
          <Route path={`/post/:id`} element={<PostPage />} />
          <Route path={`/create-collection`} element={<CreateCollectionWithPost />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
