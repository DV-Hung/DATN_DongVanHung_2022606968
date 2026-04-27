import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm font-medium text-gray-700"
      title={i18n.language === 'en' ? 'Switch to Vietnamese' : 'Switch to English'}
    >
      <span className="text-lg">
        {i18n.language === 'en' ? '🇬🇧' : '🇻🇳'}
      </span>
      <span>{i18n.language === 'en' ? 'EN' : 'VI'}</span>
    </button>
  );
};
