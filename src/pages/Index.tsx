
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
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      {/* Header */}
      <div className="gradient-purple text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome Back!</h1>
            <p className="text-purple-100">
              {user?.name || user?.username || 'User'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setCurrentView('profile')}
          >
            <User className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="px-6 -mt-6 pb-20">
        {/* Quick Actions */}
        <Card className="animate-scale-in mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setCurrentView('content')}
                className="h-20 flex-col gap-2 gradient-purple text-white hover:opacity-90"
              >
                <Plus className="h-6 w-6" />
                Add Content
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => setCurrentView('profile')}
              >
                <User className="h-6 w-6" />
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-fade-in-up">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Welcome to the platform!</p>
                  <p className="text-sm text-gray-600">Get started by adding your first content</p>
                </div>
                <span className="text-xs text-gray-500">Now</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-4">
        <div className="flex justify-around">
          <Button
            variant={currentView === 'home' ? 'default' : 'ghost'}
            className={currentView === 'home' ? 'gradient-purple text-white' : ''}
            onClick={() => setCurrentView('home')}
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setCurrentView('content')}
            className="text-purple-600"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant={currentView === 'profile' ? 'default' : 'ghost'}
            className={currentView === 'profile' ? 'gradient-purple text-white' : ''}
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
