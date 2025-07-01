import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogOut, User, Download, Globe } from 'lucide-react';
import { toast } from "sonner";
import { useLanguage } from '@/hooks/useLanguage';

interface UserProfileProps {
  user: any;
  token: string;
  onLogout: () => void;
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, token, onLogout, onBack }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [exportData, setExportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (exportData && exportData.status === 'SUCCESS') {
      toast.success("Data exported successfully!");
      setExportData(null);
    } else if (exportData && exportData.status === 'FAILURE') {
      toast.error("Failed to export data.");
      setExportData(null);
    }
  }, [exportData]);

  const handleExportData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://backend2.swecha.org/api/v1/users/export-data/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExportData(data);
        toast.info("Exporting data... Please wait.");
      } else {
        toast.error("Failed to initiate data export.");
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="gradient-purple text-white p-4 sm:p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 w-10 h-10 rounded-full"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1">
                {t('profile')}
              </h1>
              <p className="text-purple-100 text-sm sm:text-base">
                {user?.name || user?.username || t('user')}
              </p>
            </div>
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
              className="text-white hover:bg-white/20 w-10 h-10 rounded-full"
              onClick={onLogout}
              title={t('logout')}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Info Card */}
          <Card className="shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-6 w-6" />
                {t('profile')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{user?.name || user?.username || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{user?.phone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Data Card */}
          <Card className="shadow-lg border-0 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Download className="h-6 w-6" />
                {t('export_data')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Export your data to download all your content and activities.
                </p>
                <Button
                  onClick={handleExportData}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {t('export_data')}
                    </>
                  )}
                </Button>
                
                {exportData && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700 font-medium">Export Status:</p>
                    <p className="text-sm text-green-600">
                      Task ID: {exportData.task_id}<br/>
                      Status: {exportData.status}<br/>
                      Message: {exportData.message}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={onBack}
              className="px-8"
            >
              {t('back')}
            </Button>
            <Button
              variant="destructive"
              onClick={onLogout}
              className="px-8"
            >
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .gradient-purple {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
    </div>
  );
};

export default UserProfile;
