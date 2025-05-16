import React, { useEffect } from 'react';
import NGOProfile from '../components/profile/NGOProfile';
import SocialMediaLinks from '../components/profile/SocialMediaLinks';
import ContactInfo from '../components/profile/ContactInfo';
import '../styles/Profile.css';

const Profile = () => {
  useEffect(() => {
    // Update document title when component mounts
    document.title = "NGO Profile | Greenie Help2Go";
    
    // Optional: restore the original title when component unmounts
    return () => {
      document.title = "NGO Portal | Greenie Help2Go"; 
    };
  }, []);

  return (
    <div className="profile-page">
      <NGOProfile />
      
      <div className="profile-section-row">
        <SocialMediaLinks />
        <ContactInfo />
      </div>
    </div>
  );
};

export default Profile; 