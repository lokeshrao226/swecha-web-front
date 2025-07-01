
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'te';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Common
    welcome_back: "Welcome Back!",
    user: "User",
    quick_actions: "Quick Actions",
    categories: "Categories",
    add_content: "Add Content",
    recent_activity: "Recent Activity",
    welcome_to_platform: "Welcome to the platform!",
    get_started_exploring: "Get started by exploring categories",
    now: "Now",
    
    // Login
    login_title: "Welcome Back",
    login_subtitle: "Sign in to your account",
    phone_number: "Phone Number",
    password: "Password",
    login: "Login",
    request_otp: "Request OTP",
    verify_otp: "Verify OTP",
    enter_otp: "Enter OTP",
    enter_password: "Enter Password",
    login_with_password: "Login with Password",
    login_with_otp: "Login with OTP",
    
    // Categories
    select_category: "Select a Category",
    explore_categories: "Explore Categories",
    
    // Content Input
    choose_input_method: "Choose Input Method",
    text_input: "Text Input",
    audio_input: "Audio Input",
    video_input: "Video Input",
    image_input: "Image Input",
    enter_content: "Enter Your Content",
    upload_audio: "Upload Your Audio",
    upload_video: "Upload Your Video",
    upload_image: "Upload Your Image",
    submit_content: "Submit Content",
    submit_audio: "Submit Audio",
    submit_video: "Submit Video",
    submit_image: "Submit Image",
    submitting: "Submitting...",
    
    // Profile
    profile: "Profile",
    logout: "Logout",
    export_data: "Export Data",
    
    // Common actions
    back: "Back",
    cancel: "Cancel",
    submit: "Submit",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
  },
  te: {
    // Common
    welcome_back: "తిరిగి స్వాగతం!",
    user: "వినియోగదారు",
    quick_actions: "శీఘ్ర చర్యలు",
    categories: "వర్గాలు",
    add_content: "కంటెంట్ జోడించండి",
    recent_activity: "ఇటీవలి కార్యకలాపాలు",
    welcome_to_platform: "ప్లాట్‌ఫారమ్‌కు స్వాగతం!",
    get_started_exploring: "వర్గాలను అన్వేషించడం ద్వారా ప్రారంభించండి",
    now: "ఇప్పుడు",
    
    // Login
    login_title: "తిరిగి స్వాగతం",
    login_subtitle: "మీ ఖాతాలోకి సైన్ ఇన్ చేయండి",
    phone_number: "ఫోన్ నంబర్",
    password: "పాస్‌వర్డ్",
    login: "లాగిన్",
    request_otp: "OTP అభ్యర్థించండి",
    verify_otp: "OTP ధృవీకరించండి",
    enter_otp: "OTP నమోదు చేయండి",
    enter_password: "పాస్‌వర్డ్ నమోదు చేయండి",
    login_with_password: "పాస్‌వర్డ్‌తో లాగిన్",
    login_with_otp: "OTP తో లాగిన్",
    
    // Categories
    select_category: "వర్గం ఎంచుకోండి",
    explore_categories: "వర్గాలను అన్వేషించండి",
    
    // Content Input
    choose_input_method: "ఇన్‌పుట్ పద్ధతిని ఎంచుకోండి",
    text_input: "టెక్స్ట్ ఇన్‌పుట్",
    audio_input: "ఆడియో ఇన్‌పుట్",
    video_input: "వీడియో ఇన్‌పుట్",
    image_input: "చిత్రం ఇన్‌పుట్",
    enter_content: "మీ కంటెంట్‌ను నమోదు చేయండి",
    upload_audio: "మీ ఆడియోను అప్‌లోడ్ చేయండి",
    upload_video: "మీ వీడియోను అప్‌లోడ్ చేయండి",
    upload_image: "మీ చిత్రాన్ని అప్‌లోడ్ చేయండి",
    submit_content: "కంటెంట్ సమర్పించండి",
    submit_audio: "ఆడియో సమర్పించండి",
    submit_video: "వీడియో సమర్పించండి",
    submit_image: "చిత్రం సమర్పించండి",
    submitting: "సమర్పిస్తోంది...",
    
    // Profile
    profile: "ప్రొఫైల్",
    logout: "లాగ్ అవుట్",
    export_data: "డేటా ఎగుమతి",
    
    // Common actions
    back: "వెనుకకు",
    cancel: "రద్దు చేయండి",
    submit: "సమర్పించండి",
    save: "భద్రపరచండి",
    delete: "తొలగించండి",
    edit: "సవరించండి",
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'te' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
