
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Phone, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { toast } from "sonner";

interface LoginFormProps {
  onLoginSuccess: (token: string, user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('https://backend2.swecha.org/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          login_method: 'otp'
        }),
      });

      if (response.ok) {
        setShowOtpInput(true);
        toast.success("OTP sent successfully!");
      } else {
        toast.error("Failed to send OTP");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://backend2.swecha.org/users/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          otp: otp
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Login successful!");
        onLoginSuccess(data.access_token, data.user);
      } else {
        toast.error(data.detail || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handlePasswordLogin = async () => {
    if (!phoneNumber || !password) {
      toast.error("Please enter both phone number and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://backend2.swecha.org/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          password: password,
          login_method: 'password'
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Login successful!");
        onLoginSuccess(data.access_token, data.user);
      } else {
        toast.error(data.detail || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-purple">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-purple flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <div className="w-8 h-8 gradient-purple rounded-xl"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">LOGIN</h1>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button
              variant={loginMethod === 'otp' ? 'default' : 'outline'}
              className={`flex-1 ${loginMethod === 'otp' ? 'gradient-purple text-white' : ''}`}
              onClick={() => {
                setLoginMethod('otp');
                setShowOtpInput(false);
                setOtp('');
              }}
            >
              Login with OTP
            </Button>
            <Button
              variant={loginMethod === 'password' ? 'default' : 'outline'}
              className={`flex-1 ${loginMethod === 'password' ? 'gradient-purple text-white' : ''}`}
              onClick={() => setLoginMethod('password')}
            >
              Login with Password
            </Button>
          </div>

          {loginMethod === 'otp' && !showOtpInput && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700">
                  ℹ️ Enter your registered phone number to receive OTP
                </p>
              </div>
              
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 h-12 border-purple-200 focus:border-purple-500"
                />
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full h-12 gradient-purple text-white hover:opacity-90 transition-opacity"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </div>
          )}

          {loginMethod === 'otp' && showOtpInput && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ OTP sent to {phoneNumber}
                </p>
              </div>
              
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                <Input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="pl-10 h-12 border-purple-200 focus:border-purple-500 text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full h-12 gradient-purple text-white hover:opacity-90 transition-opacity"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp('');
                }}
                className="w-full text-purple-600"
              >
                Back to phone number
              </Button>
            </div>
          )}

          {loginMethod === 'password' && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 h-12 border-purple-200 focus:border-purple-500"
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-12 border-purple-200 focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-5 w-5 text-purple-500"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <Button
                onClick={handlePasswordLogin}
                disabled={loading}
                className="w-full h-12 gradient-purple text-white hover:opacity-90 transition-opacity"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
