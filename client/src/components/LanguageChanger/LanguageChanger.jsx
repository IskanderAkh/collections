import React from 'react';
import { useLanguage } from '../../Context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <div className="language-switcher">
      <label htmlFor="language-select">Language: </label>
      <select id="language-select" value={language} onChange={handleLanguageChange}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        {/* Add more languages as needed */}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
