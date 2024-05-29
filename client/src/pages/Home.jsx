import React from 'react'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Posts from '../components/Posts';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const Home = ({userId, isAdmin}) => {
  const { t } = useTranslation();
  
  return (
    <>
      <h1 className='text-center text-3xl py-10'>{t('home-title')}</h1>
      <Posts userId={userId} canDelete={false} isAdmin={isAdmin} />
    </>

  )
}

export default Home