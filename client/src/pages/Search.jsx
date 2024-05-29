import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../components/Post';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState(() => sessionStorage.getItem('query') || '');
  const [category, setCategory] = useState(() => sessionStorage.getItem('category') || 'title');
  const [results, setResults] = useState(() => JSON.parse(sessionStorage.getItem('results')) || []);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (query) {
      sessionStorage.setItem('query', query);
    }
  }, [query]);

  useEffect(() => {
    sessionStorage.setItem('category', category);
  }, [category]);

  useEffect(() => {
    if (results.length > 0) {
      sessionStorage.setItem('results', JSON.stringify(results));
    }
  }, [results]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    try {
      const response = await axios.get(`/api/posts/search`, {
        params: { query, category }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching posts:', error);
    }
    navigate( `/search/${query}`);
    setTimeout(() => {
      window.location.reload();
      
    }, 500);
  };

  const clearSearch = () => {
    setQuery('');
    // setCategory('title');
    setResults([]);
    sessionStorage.removeItem('query');
    // sessionStorage.removeItem('category');
    sessionStorage.removeItem('results');
    navigate( `/search/null`);
    setTimeout(() => {
      window.location.reload();
      
    }, 500);
  };

  return (
    <>
      <div className=''>
        <form onSubmit={handleSearch}>
          <ul className="flex gap-4 p-4 mt-10 w-full flex-row bg-base-200 rounded-box lg:mb-12">
            <input
              type="text"
              placeholder={t('search-input')}
              className="input input-primary input-info w-full max-w-xs"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className="select select-primary w-full max-w-xs"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="title">{t('search-category-title')}</option>
              <option value="tags">{t("search-category-tags")}</option>
              <option value="collectionName">{t('search-category-collections')}</option>
            </select>
            <div className='w-full flex flex-row justify-between'>

              <button type="submit" className="btn btn-primary">{t('search-btn')}</button>
            </div>
          </ul>
        </form>
        <div className='flex w-full flex-row justify-end mb-10'>
              <button onClick={clearSearch} className="btn btn-error">{t('search-clear')}</button>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {results.map((post) => (
          <Post key={post._id} post={post} />
        ))}
        {results.length === 0 && (
          <div>{t('search-noresults')}</div>
        )}
      </div>
    </>
  );
};

export default Search;
