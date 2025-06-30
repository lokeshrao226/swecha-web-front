import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Calendar, Camera, Eye, EyeOff, LogOut, Edit, ArrowLeft, Download, Loader2 } from 'lucide-react';
import { toast } from "sonner";

interface UserData {
  task_id: string;
  task_name: string;
  status: string;
  message: string;
}

interface UserProfileData {
  user_id: string;
  username: string;
  name?: string;
  email?: string;
  phone_number?: string;
  created_at?: string;
  profile_picture?: string;
  location?: string;
  [key: string]: any;
}

interface DailyReportData {
  total_uploads: number;
  videos_uploaded: number;
  images_uploaded: number;
  audio_uploaded: number;
  storage_used: number;
  last_upload_date?: string;
  active_days: number;
  [key: string]: any;
}

interface UserProfileProps {
  user: UserProfileData;
  token: string;
  onLogout: () => void;
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, token, onLogout, onBack }) => {
  const [showSensitive, setShowSensitive] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyReportData | null>(null);
  const [exportData, setExportData] = useState<UserData | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
    fetchDailyReports();
  }, [token]);

  const fetchUserProfile = async (): Promise<void> => {
    try {
      const response = await fetch('https://backend2.swecha.org/api/v1/tasks/reports/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: UserProfileData = await response.json();
        setProfileData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to fetch user profile");
        toast.error(errorData.detail || "Failed to fetch user profile");
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    }
  };

  const fetchDailyReports = async (): Promise<void> => {
    try {
      const response = await fetch('https://backend2.swecha.org/api/v1/tasks/reports/daily', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: DailyReportData = await response.json();
        setDailyStats(data);
      } else {
        const errorData = await response.json();
        console.error('Daily stats error:', errorData);
        toast.error(errorData.detail || "Failed to fetch daily statistics");
      }
    } catch (error) {
      console.error('Daily stats fetch error:', error);
      toast.error("Failed to fetch daily statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async (): Promise<void> => {
    setIsExporting(true);
    try {
      const response = await fetch('https://backend2.swecha.org/api/v1/tasks/export-data?export_format=json', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: ''
      });

      if (response.ok) {
        const data: UserData = await response.json();
        setExportData(data);
        toast.success("Data export initiated successfully");
        console.log('Export Data:', data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Failed to export data");
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Network error. Please try again.");
    }
    setIsExporting(false);
  };

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    if (showSensitive) return phone;
    return phone.replace(/(\d{3})\d{6}(\d{2})/, '$1******$2');
  };

  const formatEmail = (email: string): string => {
    if (!email) return '';
    if (showSensitive) return email;
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}****@${domain}`;
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getUserInitials = (name?: string, username?: string): string => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return username ? username.slice(0, 2).toUpperCase() : 'U';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const currentUser = profileData || user;
  const displayName = currentUser?.name || currentUser?.username || 'User';
  const memberSince = currentUser?.created_at ? new Date(currentUser.created_at).getFullYear() : new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
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
        <Card className="transform transition-all duration-300 hover:scale-105">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={currentUser?.profile_picture || ""} />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-2xl">
                    {currentUser?.profile_picture ? (
                      <User className="w-12 h-12" />
                    ) : (
                      getUserInitials(currentUser?.name, currentUser?.username)
                    )}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {displayName}
                </h2>
                {currentUser?.username && currentUser?.name && (
                  <p className="text-gray-600">@{currentUser.username}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="w-full space-y-3">
                {currentUser?.phone_number && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">{formatPhoneNumber(currentUser.phone_number)}</span>
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

                {currentUser?.email && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">{formatEmail(currentUser.email)}</span>
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

                {currentUser?.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-500" />
                    <span className="text-gray-600">{currentUser.location}</span>
                  </div>
                )}

                <div className="flex items-center justify-center gap-4 p-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Active
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Member since {memberSince}
                  </Badge>
                </div>
              </div>

              {(currentUser?.phone_number || currentUser?.email) && (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  Tap the eye icon to reveal sensitive information
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-6">
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-500">
                {dailyStats?.total_uploads || 0}
              </div>
              <div className="text-sm text-gray-600">Total Uploads</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">
                {dailyStats?.videos_uploaded || 0}
              </div>
              <div className="text-sm text-gray-600">Videos</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-500">
                {dailyStats?.images_uploaded || 0}
              </div>
              <div className="text-sm text-gray-600">Images</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-500">
                {dailyStats?.audio_uploaded || 0}
              </div>
              <div className="text-sm text-gray-600">Audio</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-500">
                {dailyStats?.storage_used ? formatStorageSize(dailyStats.storage_used) : '0 B'}
              </div>
              <div className="text-sm text-gray-600">Storage Used</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-indigo-500">
                {dailyStats?.active_days || 0}
              </div>
              <div className="text-sm text-gray-600">Active Days</div>
            </CardContent>
          </Card>
        </div>

        {/* Last Upload Info */}
        {dailyStats?.last_upload_date && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Last Upload</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(dailyStats.last_upload_date)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Export Section */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">Data Export</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Export your data in JSON format</p>
              
              <Button 
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Exporting..." : "Export My Data"}
              </Button>

              {exportData && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Export Status</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Task ID:</span> {exportData.task_id}</p>
                    <p><span className="font-medium">Status:</span> 
                      <Badge className={exportData.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                        {exportData.status}
                      </Badge>
                    </p>
                    <p><span className="font-medium">Message:</span> {exportData.message}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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