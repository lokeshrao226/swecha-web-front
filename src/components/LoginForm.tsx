import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Lock, Key } from 'lucide-react';
import { toast } from "sonner";
import { useLanguage } from '@/hooks/useLanguage';

interface LoginFormProps {
  onLoginSuccess: (token: string, user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const validatePhoneNumber = (phone: string) => {
    const phoneWithoutCountryCode = phone.replace('+91', '');
    return phoneWithoutCountryCode.length === 10 && /^\d{10}$/.test(phoneWithoutCountryCode);
  };

  const handlePhoneChange = (value: string) => {
    if (!value.startsWith('+91')) {
      setPhoneNumber('+91');
      return;
    }
    
    const phoneWithoutCountryCode = value.replace('+91', '');
    if (phoneWithoutCountryCode.length <= 10 && /^\d*$/.test(phoneWithoutCountryCode)) {
      setPhoneNumber(value);
    }
  };

  const requestOtp = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://backend2.swecha.org/api/v1/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber })
      });

      if (response.ok) {
        setIsOtpSent(true);
        toast.success("OTP sent successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Network error occurred");
    }
    setIsLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://backend2.swecha.org/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone_number: phoneNumber,
          otp: otp
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Login successful!");
        onLoginSuccess(data.access_token, data.user || { phone: phoneNumber });
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Network error occurred");
    }
    setIsLoading(false);
  };

  const loginWithPassword = async () => {
    if (!validatePhoneNumber(phoneNumber) || !password.trim()) {
      toast.error("Please enter valid phone number and password");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', phoneNumber);
      formData.append('password', password);

      const response = await fetch('https://backend2.swecha.org/api/v1/auth/login', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Login successful!");
        onLoginSuccess(data.access_token, data.user || { phone: phoneNumber });
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Network error occurred");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl overflow-hidden animate-fade-in-up">
        <CardHeader className="gradient-purple text-white text-center py-8">
          <h1 className="text-3xl font-bold mb-2">{t('login_title')}</h1>
          <p className="text-purple-100">{t('login_subtitle')}</p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-purple-600" />
              {t('phone_number')}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="h-12 border-2 border-gray-200 focus:border-purple-400 rounded-xl transition-colors"
              placeholder="+91XXXXXXXXXX"
            />
          </div>

          {/* Password or OTP Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={!isOtpMode ? "default" : "outline"}
              onClick={() => setIsOtpMode(false)}
              className="flex-1 h-10 rounded-xl"
            >
              {t('login_with_password')}
            </Button>
            <Button
              variant={isOtpMode ? "default" : "outline"}
              onClick={() => setIsOtpMode(true)}
              className="flex-1 h-10 rounded-xl"
            >
              {t('login_with_otp')}
            </Button>
          </div>

          {/* Password Mode */}
          {!isOtpMode && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-600" />
                {t('password')}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-purple-400 rounded-xl transition-colors"
                placeholder={t('enter_password')}
              />
            </div>
          )}

          {/* OTP Mode */}
          {isOtpMode && (
            <div className="space-y-4">
              {!isOtpSent ? (
                <Button
                  onClick={requestOtp}
                  disabled={isLoading || !validatePhoneNumber(phoneNumber)}
                  className="w-full h-12 gradient-purple text-white hover:opacity-90 transition-opacity rounded-xl"
                >
                  {isLoading ? "Sending..." : t('request_otp')}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Key className="h-4 w-4 text-purple-600" />
                      OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-purple-400 rounded-xl transition-colors text-center text-lg tracking-widest"
                      placeholder={t('enter_otp')}
                      maxLength={6}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Login Button */}
          <Button
            onClick={isOtpMode ? (isOtpSent ? verifyOtp : requestOtp) : loginWithPassword}
            disabled={isLoading}
            className="w-full h-12 gradient-purple text-white hover:opacity-90 transition-opacity rounded-xl font-semibold"
          >
            {isLoading ? "Loading..." : 
             isOtpMode ? (isOtpSent ? t('verify_otp') : t('request_otp')) : t('login')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
