
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import UserProfile from '@/components/UserProfile';
import ContentInput from '@/components/ContentInput';
import Categories from '@/components/Categories';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, User, Home, Activity, Grid3X3, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

type View = 'login' | 'home' | 'profile' | 'content' | 'categories';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    // Check for existing session on load
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setCurrentView('categories');
    }
  }, []);

  const handleLoginSuccess = (accessToken: string, userData: any) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('categories');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('login');
  };

  if (currentView === 'login') {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={toggleLanguage}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'తె' : 'EN'}
          </Button>
        </div>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  if (currentView === 'profile') {
    return (
      <UserProfile 
        user={user} 
        token={token!} 
        onLogout={handleLogout}
        onBack={() => setCurrentView('categories')}
      />
    );
  }

  if (currentView === 'content') {
    return (
      <ContentInput 
        token={token!} 
        onBack={() => setCurrentView('categories')}
      />
    );
  }

  if (currentView === 'categories') {
    return (
      <Categories 
        token={token!} 
        onBack={() => setCurrentView('home')}
        onLogout={handleLogout}
        onProfile={() => setCurrentView('profile')}
        onContentInput={() => setCurrentView('content')}
      />
    );
  }

  // Home View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="gradient-purple text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">{t('welcome_back')}</h1>
            <p className="text-purple-100 text-lg">
              {user?.name || user?.username || t('user')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleLanguage}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <Globe className="h-4 w-4 mr-1" />
              {language === 'en' ? 'తె' : 'EN'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
              onClick={() => setCurrentView('profile')}
            >
              <User className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 pb-24">
        {/* Quick Actions */}
        <Card className="animate-scale-in mb-6 shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">{t('quick_actions')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setCurrentView('categories')}
                className="h-24 flex-col gap-3 gradient-purple text-white hover:opacity-90 rounded-xl shadow-lg border-0 transition-all duration-300 hover:scale-105"
              >
                <Grid3X3 className="h-7 w-7" />
                <span className="font-semibold">{t('categories')}</span>
              </Button>
              <Button
                onClick={() => setCurrentView('content')}
                className="h-24 flex-col gap-3 gradient-purple text-white hover:opacity-90 rounded-xl shadow-lg border-0 transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-7 w-7" />
                <span className="font-semibold">{t('add_content')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-fade-in-up shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 gradient-purple rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{t('recent_activity')}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                <div>
                  <p className="font-semibold text-gray-800">{t('welcome_to_platform')}</p>
                  <p className="text-sm text-gray-600 mt-1">{t('get_started_exploring')}</p>
                </div>
                <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-full">{t('now')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-6 py-4 rounded-t-3xl shadow-2xl">
        <div className="flex justify-around">
          <Button
            variant={currentView === 'home' ? 'default' : 'ghost'}
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              currentView === 'home' 
                ? 'gradient-purple text-white shadow-lg scale-110' 
                : 'hover:bg-purple-50 text-gray-600'
            }`}
            onClick={() => setCurrentView('home')}
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant={currentView === 'categories' ? 'default' : 'ghost'}
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              currentView === 'categories' 
                ? 'gradient-purple text-white shadow-lg scale-110' 
                : 'hover:bg-purple-50 text-purple-600'
            }`}
            onClick={() => setCurrentView('categories')}
          >
            <Grid3X3 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentView('content')}
            className="w-12 h-12 rounded-full text-purple-600 hover:bg-purple-50 transition-all duration-300 hover:scale-110"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant={currentView === 'profile' ? 'default' : 'ghost'}
            className={`w-12 h-12 rounded-full transition-all duration-300 ${
              currentView === 'profile' 
                ? 'gradient-purple text-white shadow-lg scale-110' 
                : 'hover:bg-purple-50 text-gray-600'
            }`}
            onClick={() => setCurrentView('profile')}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
