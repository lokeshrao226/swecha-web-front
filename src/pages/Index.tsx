
import React, { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import UserProfile from '@/components/UserProfile';
import ContentInput from '@/components/ContentInput';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, User, Home, Activity } from 'lucide-react';

type View = 'login' | 'home' | 'profile' | 'content';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session on load
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setCurrentView('home');
    }
  }, []);

  const handleLoginSuccess = (accessToken: string, userData: any) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('home');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('login');
  };

  if (currentView === 'login') {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentView === 'profile') {
    return (
      <UserProfile 
        user={user} 
        token={token!} 
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'content') {
    return (
      <ContentInput 
        token={token!} 
        onBack={() => setCurrentView('home')}
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
            <h1 className="text-3xl font-bold mb-1">Welcome Back!</h1>
            <p className="text-purple-100 text-lg">
              {user?.name || user?.username || 'User'}
            </p>
          </div>
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

      <div className="px-6 -mt-4 pb-24">
        {/* Quick Actions */}
        <Card className="animate-scale-in mb-6 shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setCurrentView('content')}
                className="h-24 flex-col gap-3 gradient-purple text-white hover:opacity-90 rounded-xl shadow-lg border-0 transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-7 w-7" />
                <span className="font-semibold">Add Content</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-3 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                onClick={() => setCurrentView('profile')}
              >
                <User className="h-7 w-7 text-purple-600" />
                <span className="font-semibold text-purple-700">View Profile</span>
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
              <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                <div>
                  <p className="font-semibold text-gray-800">Welcome to the platform!</p>
                  <p className="text-sm text-gray-600 mt-1">Get started by adding your first content</p>
                </div>
                <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-full">Now</span>
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
