import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BsGlobe, BsChevronDown } from 'react-icons/bs';
import '../../styles/LanguagePicker.css';

const LanguagePicker = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const dropdownRef = useRef(null);

  // Available languages with country mapping for location detection
  const languages = [
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸',
      countries: ['US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'ZA']
    },
    // {
    //   code: 'hu',
    //   name: 'Magyar',
    //   flag: '🇭🇺',
    //   countries: ['HU']
    // },
    {
      code: 'sl',
      name: 'Slovenščina',
      flag: '🇸🇮',
      countries: ['SI']
    },
    // {
    //   code: 'es',
    //   name: 'Español',
    //   flag: '🇪🇸',
    //   countries: ['ES', 'MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'UR', 'PY', 'BO', 'CR', 'PA', 'DO', 'HN', 'NI', 'GT', 'SV', 'CU']
    // },
    // {
    //   code: 'fr',
    //   name: 'Français',
    //   flag: '🇫🇷',
    //   countries: ['FR', 'BE', 'CH', 'CA', 'LU', 'MC']
    // },
    // {
    //   code: 'de',
    //   name: 'Deutsch',
    //   flag: '🇩🇪',
    //   countries: ['DE', 'AT', 'CH', 'LI', 'LU']
    // }
  ];

  // Get user's country and set appropriate language
  useEffect(() => {
    const detectAndSetLanguage = async () => {
      try {
        // First check if user has already selected a language
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
          setSelectedLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
          return;
        }

        // Try to detect user's country using a free IP geolocation service
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code) {
          const countryCode = data.country_code.toUpperCase();
          console.log('Detected country:', countryCode);
          
          // Find language that matches the user's country
          const matchedLanguage = languages.find(lang => 
            lang.countries.includes(countryCode)
          );
          
          if (matchedLanguage && matchedLanguage.code !== i18n.language) {
            console.log('Setting language to:', matchedLanguage.code);
            setSelectedLanguage(matchedLanguage.code);
            i18n.changeLanguage(matchedLanguage.code);
            localStorage.setItem('selectedLanguage', matchedLanguage.code);
          }
        }
      } catch (error) {
        console.log('Could not detect location, using browser language detection');
        // Fallback to browser language detection (already handled by i18next)
      }
    };

    detectAndSetLanguage();
  }, [i18n]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
    i18n.changeLanguage(languageCode);
    localStorage.setItem('selectedLanguage', languageCode);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  return (
    <div className="language-picker" ref={dropdownRef}>
      <button
        className="language-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <BsGlobe className="language-icon" />
        <span className="language-flag">{currentLanguage.flag}</span>
        {/* <span className="language-name">{currentLanguage.name}</span> */}
        <BsChevronDown className={`language-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <div className="language-dropdown-content">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`language-option ${selectedLanguage === language.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <span className="language-option-flag">{language.flag}</span>
                <span className="language-option-name">{language.name}</span>
                {selectedLanguage === language.code && (
                  <div className="language-option-check">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguagePicker; 