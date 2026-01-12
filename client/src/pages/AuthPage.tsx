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
    // Optional fields
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">CampusPlace</h1>
          <p className="text-muted-foreground">Your future starts here</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      required 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoginPending}>
                    {isLoginPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Join our platform today</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input 
                        id="reg-username"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={registerData.role} 
                        onValueChange={(val: any) => setRegisterData({...registerData, role: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="employer">Employer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input 
                      id="reg-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      required
                    />
                  </div>

                  {registerData.role === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input 
                          id="department"
                          value={registerData.department}
                          onChange={(e) => setRegisterData({...registerData, department: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cgpa">CGPA</Label>
                          <Input 
                            id="cgpa"
                            value={registerData.cgpa}
                            onChange={(e) => setRegisterData({...registerData, cgpa: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gradYear">Grad Year</Label>
                          <Input 
                            id="gradYear"
                            type="number"
                            value={registerData.graduationYear}
                            onChange={(e) => setRegisterData({...registerData, graduationYear: e.target.value})}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {registerData.role === 'employer' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input 
                          id="company"
                          value={registerData.companyName}
                          onChange={(e) => setRegisterData({...registerData, companyName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input 
                          id="industry"
                          value={registerData.industry}
                          onChange={(e) => setRegisterData({...registerData, industry: e.target.value})}
                        />
                      </div>
                    </>
                  )}

                </CardContent>
                <CardFooter className="pt-4">
                  <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600" disabled={isRegisterPending}>
                    {isRegisterPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
