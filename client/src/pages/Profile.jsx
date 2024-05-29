import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../utils/date";
import useUpdateUserProfile from "../hooks/useUpdateUserProfile";
import LoadingSpinner from "../components/LoadingSpinner";
import UserPosts from "../components/UserPosts";
import { useTranslation } from "react-i18next";
import EditProfileModal from "../components/EditProfileModal";

const ProfilePage = ({ authUser }) => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const { t } = useTranslation();
  const { username } = useParams();

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { data: user, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await fetch(`/api/users/profile/${username}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
  });

  const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  const isMyProfile = user?._id === authUser?._id;
  const isAdmin = authUser?.access === "admin";
  // console.log("userId", user?._id);
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="flex-[4_4_0] border-gray-700 min-h-20">
        {(isMyProfile || isAdmin) && <div className="flex justify-between items-center ">
          <Link to="/create-collection" className="btn mt-5 mb-5" state={{ userId: user?._id, isAdmin: isAdmin, user: user }}>{t('createcollection-title')}</Link>
          {(isMyProfile && !isAdmin) && <EditProfileModal authUser={authUser} />}
          {(isAdmin) && <EditProfileModal authUser={user} />}
          
        </div>}


        {!isLoading && !isRefetching && !user && (
          <p className="text-center text-lg mt-4">{t('profile-not-found')}</p>
        )}
        {!isLoading && !isRefetching && user && (
          <>
            <div className="flex gap-10 px-4 py-2 items-center">
              <Link to="/">
                <FaArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex flex-col">
                <p className="font-bold text-lg">{user?.fullName}</p>
                <span className="text-sm text-slate-500">
                  
                  Posted Since the Beginning: {user?.userPosts?.length}
                </span>
              </div>
            </div>
            <div>
              <strong>{user?.username}: </strong>{memberSinceDate}
              <p>
              <strong>{t('profile-link')}: </strong>
                <a target="_blank" rel="noreferrer" className="link link-info" href={user?.link}> {user?.link}</a>
              </p>
              <p>
                <strong>{t('profile-bio')}: </strong>
                {user?.bio}
              </p>
            </div>
            <div className="flex justify-end px-4 mt-5">
              {(coverImg || profileImg) && (
                <button
                  className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
                  onClick={async () => {
                    await updateProfile({ coverImg, profileImg });
                    setProfileImg(null);
                    setCoverImg(null);
                    refetch();
                  }}
                >
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {!isLoading && (
        <UserPosts isMyProfile={isMyProfile} userId={user?._id} isAdmin={isAdmin} />
      )}
    </>
  );
};

export default ProfilePage;
