import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import ThemeToggle from './ThemeToggle';
import i18n from '../trans/i18';
import { useTranslation } from 'react-i18next';
import useLocalstorage from '../trans/useLocalstorage';

const Navbar = ({ authUser }) => {
    const [isAdmin, setIsAdmin] = useState(authUser?.access === "admin");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const [language, setLanguage] = useLocalstorage('language', 'en');
    
    const [searchInput, setSearchInput] = useState(sessionStorage.getItem('query') || 'search');

    useEffect(() => {
        setIsAdmin(authUser?.access === "admin");
    }, [authUser]);

    const handleLanguageChange = () => {
        if (language === 'en') {
            i18n.changeLanguage('ru');
            setLanguage('ru');
        } else if (language === 'ru') {
            i18n.changeLanguage('en');
            setLanguage('en');
        }
    };

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
            toast.success("Logged out successfully");
            sessionStorage.removeItem("user");
            queryClient.invalidateQueries(['authUser']);
            navigate('/login');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        },
        onError: (error) => {
            toast.error(error.message || "Logout failed");
        },
    });

    const handleLogout = async () => {
        try {
            await logout();
            queryClient.invalidateQueries(['authUser']);
            navigate('/login');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            toast.error(error.message || "Logout failed");
        }
    };

    const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

    return (
        <div className='navbar h-20 w-full py-4 border-2 border-zinc-500 mt-2 rounded-xl'>
            <div className='navbar-start'>
                <div className="dropdown md:hidden block">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm sm:w-96 dropdown-content mt-3 p-2 shadow bg-primary rounded-box w-52 z-20 left-0">
                        <li>
                            <Link to={"/"} className='text-white' onClick={() => setCurrentRoute('/')}>
                                Home
                            </Link>
                        </li>
                        <li >
                            <Link
                                to={`/profile/${authUser?.username}`}
                                className='text-white'
                                onClick={() => setCurrentRoute(`/profile/${authUser?.username}`)}
                            >
                                Profile
                            </Link>
                        </li>
                        {isAdmin && <li>
                        <Link
                            to={`/admin`}
                            className={window.location.pathname === '/admin' ? "active" : ""}
                            onClick={() => setCurrentRoute('/admin')}
                        >
                            {t('nav-admin')}
                        </Link>
                    </li>}
                        <li>
                            <Link
                                to={"/collections"}
                                className='text-white'
                                onClick={() => setCurrentRoute('/collections')}
                            >
                                Collections
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={"/search/null"}
                                className='text-white'
                                onClick={() => setCurrentRoute('/search/null')}
                            >
                                Search
                            </Link>
                        </li>
                        {authUser ? (
                            <li>
                                <button className='text-white text-left' onClick={handleLogout}>Logout</button>
                            </li>
                        ) : (
                            <li>
                                <Link
                                    to={"/login"}
                                    className='text-white'
                                    onClick={() => setCurrentRoute('/login')}
                                >
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
                <Link to={"/"} className='hidden md:block italic font-bold'>
                    <img onClick={() => setCurrentRoute('/')} className='w-20' src="./logo.png" alt="" />
                </Link>
            </div>
            <div className='navbar-center'>
                <Link to={"/"} className='block md:hidden italic font-bold'>
                    <img onClick={() => setCurrentRoute('/')} className='w-20' src="./logo.png" alt="" />
                </Link>

                <ul className='flex gap-4 menu menu-horizontal rounded-lg bg-base-200 hidden md:flex'>
                    <li>
                        <Link to={`/`} className={currentRoute === "/" ? "active" : ""} onClick={() => setCurrentRoute('/')}>
                            {t('nav-home')}
                        </Link>
                    </li>
                    <li >
                        <Link
                            to={`/profile/${authUser?.username}`}
                            className={window.location.pathname === `/profile/${authUser?.username}` ? "active" : ""}
                            onClick={() => setCurrentRoute(`/profile/${authUser?.username}`)}
                        >
                            {t('nav-profile')}
                        </Link>
                    </li>
                    {isAdmin && <li>
                        <Link
                            to={`/admin`}
                            className={window.location.pathname === '/admin' ? "active" : ""}
                            onClick={() => setCurrentRoute('/admin')}
                        >
                            {t('nav-admin')}
                        </Link>
                    </li>}
                    <li>
                        <Link
                            to={`/collections`}
                            className={window.location.pathname === '/collections' ? "active" : ""}
                            onClick={() => setCurrentRoute('/collections')}
                        >
                            {t('nav-collections')}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={`/search/${searchInput}`}
                            className={window.location.pathname === '/search' ? "active" : ""}
                            onClick={() => setCurrentRoute(`/search/${searchInput}`)}
                        >
                            {t('nav-search')}
                        </Link>
                    </li>
                    {authUser ? (
                        <button onClick={handleLogout}>{t('nav-logout')}</button>
                    ) : (
                        <li>
                            <Link
                                to={`/login`}
                                className={window.location.pathname === '/login' ? "active" : ""}
                                onClick={() => setCurrentRoute('/login')}
                            >
                                {t('nav-login')}
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
            <div className='navbar-end flex'>
                <button onClick={handleLanguageChange} className='ml-10 btn btn-ghost'>{language}</button>
                <ThemeToggle />
            </div>
        </div>
    );
};

export default Navbar;
