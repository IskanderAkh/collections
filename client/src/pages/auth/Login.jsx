import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useTranslation } from "react-i18next";

const LoginPage = ({ user }) => {
  let navigate = useNavigate();
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(true); // State to track loading
  const queryClient = useQueryClient();
  const { mutate: loginMutation, isPending, isError, error } =
    useMutation({
      mutationFn: async ({ username, password }) => {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
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
        toast.success("Login successful");
        sessionStorage.setItem("user", JSON.stringify(formData.username));
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        navigate("/");
      },
      onError: (error) => {
        console.log(error.message);
        if (error.message.includes("blocked")) {
          toast.error(t('login-blocked'));
        } else {
          toast.error(t('login-invalid'));
        }
        sessionStorage.removeItem("user");
      },
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []); // Empty dependency array to run only once on component mount

  if (isLoading) {
    return <LoadingSpinner />; // Render loading spinner
  }

  if (user) {
    return <Navigate to="/" />;
  } else {
    return (
      <div className="max-w-screen-xl mx-auto flex h-screen">
        <div className="flex-1 flex flex-col justify-center items-center">
          <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
            <h1 className="text-4xl font-extrabold text-white">{"Let's"} go.</h1>
            <label className="input input-bordered rounded flex items-center gap-2">
              <MdOutlineMail />
              <input
                type="text"
                className="grow"
                placeholder={t('login-username')}
                name="username"
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>

            <label className="input input-bordered rounded flex items-center gap-2">
              <MdPassword />
              <input
                type="password"
                className="grow"
                placeholder={t('login-password')}
                name="password"
                onChange={handleInputChange}
                value={formData.password}
              />
            </label>
            <button className="btn rounded-full btn-primary text-white">
              {isPending ? "Loading..." : t('login-btn')}
            </button>
            {isError && <p className="text-red-500">{error && error.message.includes("blocked") ? t('login-blocked') : t('login-invalid')}

            </p>}
          </form>
          <div className="flex flex-col gap-2 mt-4">
            <p className="text-white text-lg">{"Don't"} have an account?</p>
            <Link to="/register">
              <button className="btn rounded-full btn-primary text-white btn-outline w-full">{t('login-register')}</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
};

export default LoginPage;
