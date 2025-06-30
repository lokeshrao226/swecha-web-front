
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Calendar, Camera, Eye, EyeOff, LogOut, Edit } from 'lucide-react';
import { toast } from "sonner";

interface UserProfileProps {
  user: any;
  token: string;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, token, onLogout }) => {
  const [showSensitive, setShowSensitive] = useState(false);
  const [stats, setStats] = useState({
    recordings: 0,
    storageUsed: '0 B',
    daysActive: 0
  });

  useEffect(() => {
    // Fetch user stats
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      // This would be replaced with actual API calls
      setStats({
        recordings: Math.floor(Math.random() * 50),
        storageUsed: `${(Math.random() * 5).toFixed(1)} GB`,
        daysActive: Math.floor(Math.random() * 365)
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    if (showSensitive) return phone;
    return phone.replace(/(\d{3})\d{6}(\d{2})/, '$1******$2');
  };

  const formatEmail = (email: string) => {
    if (!email) return '';
    if (showSensitive) return email;
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}****@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      {/* Header */}
      <div className="gradient-purple text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Profile</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6">
        {/* Profile Card */}
        <Card className="animate-scale-in">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full gradient-purple"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user?.name || user?.username || 'User'}
                </h2>
              </div>

              {/* Contact Information */}
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">{formatPhoneNumber(user?.phone_number)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSensitive(!showSensitive)}
                  >
                    {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {user?.email && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">{formatEmail(user.email)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSensitive(!showSensitive)}
                    >
                      {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-500" />
                  <span className="text-gray-600">Location</span>
                </div>

                <div className="flex items-center justify-center gap-4 p-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Active
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Member since {new Date().getFullYear()}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                Tap on phone or email to reveal
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-500">{stats.recordings}</div>
              <div className="text-sm text-gray-600">Recordings</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">{stats.storageUsed}</div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-500">{stats.daysActive}</div>
              <div className="text-sm text-gray-600">Days Active</div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Settings</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Account Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Privacy Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Notification Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
