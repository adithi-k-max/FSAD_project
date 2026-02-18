import { useState } from "react";
import { useLogin, useRegister } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { mutate: login, isPending: isLoginPending } = useLogin();
  const { mutate: register, isPending: isRegisterPending } = useRegister();

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    role: "student" as "student" | "employer",
    department: "",
    cgpa: "",
    graduationYear: "",
    companyName: "",
    industry: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginData, { onSuccess: () => setLocation("/dashboard") });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      username: registerData.username,
      password: registerData.password,
      email: registerData.email,
      name: registerData.name,
      role: registerData.role,
    };

    if (registerData.role === 'student') {
      payload.studentDetails = {
        department: registerData.department,
        cgpa: registerData.cgpa,
        graduationYear: parseInt(registerData.graduationYear) || undefined,
      };
    } else if (registerData.role === 'employer') {
      payload.employerDetails = {
        companyName: registerData.companyName,
        industry: registerData.industry,
      };
    }

    register(payload, { onSuccess: () => setLocation("/dashboard") });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">CampusPlace</h1>
          <p className="text-base text-slate-600">Enterprise placement system</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-sm">Sign In</TabsTrigger>
            <TabsTrigger value="register" className="text-sm">Join</TabsTrigger>
          </TabsList>
          
          {/* Login Tab */}
          <TabsContent value="login">
            <Card className="card-base">
              <CardHeader className="pb-4 border-b border-slate-200">
                <CardTitle className="text-xl">Sign In</CardTitle>
                <CardDescription>Access your account</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      placeholder="Your username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      required 
                      className="input-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required 
                      className="input-base"
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-slate-200 bg-slate-50">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                    disabled={isLoginPending}
                  >
                    {isLoginPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Register Tab */}
          <TabsContent value="register">
            <Card className="card-base">
              <CardHeader className="pb-4 border-b border-slate-200">
                <CardTitle className="text-xl">Create Account</CardTitle>
                <CardDescription>Get started in minutes</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="pt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="role">I am a</Label>
                    <Select 
                      value={registerData.role} 
                      onValueChange={(val: any) => setRegisterData({...registerData, role: val})}
                    >
                      <SelectTrigger className="input-base">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="employer">Employer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Common Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      placeholder="Full name"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      required
                      className="input-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      required
                      className="input-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username2">Username</Label>
                    <Input 
                      id="username2"
                      placeholder="Username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                      required
                      className="input-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password2">Password</Label>
                    <Input 
                      id="password2"
                      type="password"
                      placeholder="Strong password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      required
                      className="input-base"
                    />
                  </div>

                  {/* Student-Specific Fields */}
                  {registerData.role === 'student' && (
                    <>
                      <div className="pt-2 pb-2 border-t border-slate-200">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Your Profile</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input 
                          id="department"
                          placeholder="e.g., Computer Science"
                          value={registerData.department}
                          onChange={(e) => setRegisterData({...registerData, department: e.target.value})}
                          className="input-base"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cgpa">CGPA</Label>
                          <Input 
                            id="cgpa"
                            placeholder="e.g., 3.8"
                            value={registerData.cgpa}
                            onChange={(e) => setRegisterData({...registerData, cgpa: e.target.value})}
                            className="input-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gradYear">Graduation Year</Label>
                          <Input 
                            id="gradYear"
                            type="number"
                            placeholder="2024"
                            value={registerData.graduationYear}
                            onChange={(e) => setRegisterData({...registerData, graduationYear: e.target.value})}
                            className="input-base"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Employer-Specific Fields */}
                  {registerData.role === 'employer' && (
                    <>
                      <div className="pt-2 pb-2 border-t border-slate-200">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Company Info</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input 
                          id="company"
                          placeholder="Your company name"
                          value={registerData.companyName}
                          onChange={(e) => setRegisterData({...registerData, companyName: e.target.value})}
                          className="input-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input 
                          id="industry"
                          placeholder="e.g., Software, Finance, HR"
                          value={registerData.industry}
                          onChange={(e) => setRegisterData({...registerData, industry: e.target.value})}
                          className="input-base"
                        />
                      </div>
                    </>
                  )}

                </CardContent>
                <CardFooter className="pt-4 border-t border-slate-200 bg-slate-50">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                    disabled={isRegisterPending}
                  >
                    {isRegisterPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Note */}
        <p className="text-xs text-slate-500 text-center mt-6">
          By continuing, you agree to our privacy policy
        </p>
      </div>
    </div>
  );
}
