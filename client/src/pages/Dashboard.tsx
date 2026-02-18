import { useUser } from "@/hooks/use-auth";
import { useStats } from "@/hooks/use-stats";
import { useApplications } from "@/hooks/use-applications";
import { useJobs } from "@/hooks/use-jobs";
import { 
  Users, 
  Briefcase, 
  CheckCircle,
  Zap,
  TrendingUp,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Stat card component - cleaner design
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  variant = 'neutral',
  subtext 
}: { 
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'neutral';
  subtext?: string;
}) {
  const variantStyles = {
    primary: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    neutral: 'bg-slate-50 border-slate-200',
  };

  return (
    <div className={`border rounded-lg p-6 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {subtext && <p className="text-xs text-slate-600 mt-2">{subtext}</p>}
        </div>
        <div className="opacity-60">{Icon}</div>
      </div>
    </div>
  );
}

// Student Dashboard
function StudentDashboard() {
  const { data: user } = useUser();
  const { data: applications } = useApplications();
  const { data: jobs } = useJobs();

  const activeApplications = applications?.filter(a => a.status === 'applied').length || 0;
  const shortlisted = applications?.filter(a => a.status === 'shortlisted').length || 0;
  const offers = applications?.filter(a => a.status === 'selected').length || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-page-title text-slate-900 mb-1">Your Pipeline</h1>
        <p className="text-base text-slate-600">Track applications. Land offers.</p>
      </div>

      {/* Primary Stats - Focused on what matters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Applications Active" 
          value={activeApplications}
          icon={<Briefcase className="w-6 h-6" />}
          variant="primary"
          subtext="In progress"
        />
        <StatCard 
          label="Shortlisted" 
          value={shortlisted}
          icon={<Zap className="w-6 h-6" />}
          variant="warning"
          subtext="Next: Interviews"
        />
        <StatCard 
          label="Offers Received" 
          value={offers}
          icon={<CheckCircle className="w-6 h-6" />}
          variant="success"
          subtext="Your wins"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Active Applications */}
        <Card className="card-base">
          <CardHeader className="pb-4 border-b border-slate-200">
            <CardTitle className="text-card-title">Your Applications</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!applications || applications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Ready to apply?</p>
                <p className="text-sm text-slate-500 mt-1">Browse opportunities and start your applications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{app.job.title}</h4>
                        <p className="text-sm text-slate-600">{app.job.location}</p>
                      </div>
                      <Badge 
                        className={`
                          text-xs
                          ${app.status === 'selected' ? 'bg-green-100 text-green-700' : ''}
                          ${app.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                          ${app.status === 'shortlisted' ? 'bg-amber-100 text-amber-700' : ''}
                          ${app.status === 'applied' ? 'bg-blue-100 text-blue-700' : ''}
                        `}
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{app.appliedAt && format(new Date(app.appliedAt), 'MMM d, yyyy')}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps / Resources */}
        <Card className="card-base">
          <CardHeader className="pb-4 border-b border-slate-200">
            <CardTitle className="text-card-title">Your Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-700">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Complete your profile</p>
                    <p className="text-xs text-slate-600 mt-1">Skills and resume increase visibility</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-700">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Explore {jobs?.length || 0} active roles</p>
                    <p className="text-xs text-slate-600 mt-1">New positions added daily</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-700">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">Respond to interview requests</p>
                    <p className="text-xs text-slate-600 mt-1">Time-sensitive opportunities</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Employer Dashboard
function EmployerDashboard() {
  const { data: user } = useUser();
  const { data: applications } = useApplications();
  const { data: jobs } = useJobs();

  const activeJobs = jobs?.filter(j => j.employerId === user?.id).length || 0;
  const totalApplications = applications?.length || 0;
  const newApplications = applications?.slice(0, 2).length || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-page-title text-slate-900 mb-1">Your Candidates</h1>
        <p className="text-base text-slate-600">Manage openings. Review applications.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Active Job Postings" 
          value={activeJobs}
          icon={<Briefcase className="w-6 h-6" />}
          variant="primary"
          subtext="Recruiting now"
        />
        <StatCard 
          label="Total Applications" 
          value={totalApplications}
          icon={<Users className="w-6 h-6" />}
          variant="neutral"
          subtext="Across all positions"
        />
        <StatCard 
          label="New This Week" 
          value={newApplications}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="success"
          subtext="Ready to review"
        />
      </div>

      {/* Pending Actions */}
      <Card className="card-base">
        <CardHeader className="pb-4 border-b border-slate-200">
          <CardTitle className="text-card-title">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {!applications || applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Post your first job</p>
              <p className="text-sm text-slate-500 mt-1">Create an opening to start receiving applications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 8).map((app) => (
                <div key={app.id} className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{app.student.name}</h4>
                      <p className="text-sm text-slate-600">{app.job.title}</p>
                    </div>
                    <Badge variant="outline" className={`
                      ${app.status === 'applied' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                      ${app.status === 'shortlisted' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                    `}>
                      {app.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const { data: stats } = useStats();
  const { data: applications } = useApplications();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-page-title text-slate-900 mb-1">Platform Status</h1>
        <p className="text-base text-slate-600">System metrics and placements</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Students" 
          value={stats?.totalStudents || 0}
          icon={<Users className="w-6 h-6" />}
          variant="primary"
        />
        <StatCard 
          label="Active Employers" 
          value={stats?.totalEmployers || 0}
          icon={<Briefcase className="w-6 h-6" />}
          variant="neutral"
        />
        <StatCard 
          label="Open Positions" 
          value={stats?.totalJobs || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="warning"
        />
        <StatCard 
          label="Placements" 
          value={stats?.placements || 0}
          icon={<CheckCircle className="w-6 h-6" />}
          variant="success"
        />
      </div>

      {/* Activity Feed */}
      <Card className="card-base">
        <CardHeader className="pb-4 border-b border-slate-200">
          <CardTitle className="text-card-title">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {!applications || applications.length === 0 ? (
            <p className="text-center py-12 text-slate-500">No activity</p>
          ) : (
            <div className="space-y-2">
              {applications.slice(0, 10).map((app) => (
                <div key={app.id} className="py-3 px-4 hover:bg-slate-50 rounded-lg transition-colors flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{app.student.name}</p>
                    <p className="text-xs text-slate-600">{app.job.title}</p>
                  </div>
                  <p className="text-xs text-slate-500 flex-shrink-0 ml-2">
                    {app.appliedAt && format(new Date(app.appliedAt), 'MMM d')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main Dashboard Router
export default function Dashboard() {
  const { data: user } = useUser();

  if (!user) return null;

  if (user.role === 'student') {
    return <StudentDashboard />;
  } else if (user.role === 'employer') {
    return <EmployerDashboard />;
  } else if (user.role === 'admin' || user.role === 'officer') {
    return <AdminDashboard />;
  }

  return null;
}
