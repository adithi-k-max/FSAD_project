import { useUser } from "@/hooks/use-auth";
import { useStats } from "@/hooks/use-stats";
import { useApplications } from "@/hooks/use-applications";
import { useJobs } from "@/hooks/use-jobs";
import { StatCard } from "@/components/ui/stat-card";
import { 
  Users, 
  Briefcase, 
  FileText, 
  CheckCircle,
  Clock,
  Building
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: user } = useUser();
  const { data: stats } = useStats();
  const { data: applications } = useApplications();
  const { data: jobs } = useJobs();

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-4xl font-display font-bold mb-2">
          Welcome, {user.name}! 👋
        </h1>
        <p className="text-indigo-100 text-lg">
          {user.role === 'student' ? 'Explore opportunities and advance your career' :
           user.role === 'employer' ? 'Find and manage talented candidates' :
           'Monitor placements and system statistics'}
        </p>
      </div>

      {/* Stats Grid - Show different stats based on role */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(user.role === 'admin' || user.role === 'officer') && stats && (
          <>
            <StatCard 
              title="Total Students" 
              value={stats.totalStudents} 
              icon={Users}
              colorClass="text-blue-600 bg-blue-100"
            />
            <StatCard 
              title="Active Employers" 
              value={stats.totalEmployers} 
              icon={Building}
              colorClass="text-purple-600 bg-purple-100"
            />
            <StatCard 
              title="Jobs Posted" 
              value={stats.totalJobs} 
              icon={Briefcase}
              colorClass="text-pink-600 bg-pink-100"
            />
            <StatCard 
              title="Placements" 
              value={stats.placements} 
              icon={CheckCircle}
              colorClass="text-green-600 bg-green-100"
            />
          </>
        )}

        {user.role === 'student' && applications && (
          <>
             <StatCard 
              title="Jobs Available" 
              value={jobs?.length || 0} 
              icon={Briefcase}
              colorClass="text-indigo-600 bg-indigo-100"
            />
            <StatCard 
              title="Applied" 
              value={applications.length} 
              icon={FileText}
              colorClass="text-blue-600 bg-blue-100"
            />
            <StatCard 
              title="Shortlisted" 
              value={applications.filter(a => a.status === 'shortlisted').length} 
              icon={Clock}
              colorClass="text-amber-600 bg-amber-100"
            />
            <StatCard 
              title="Offers" 
              value={applications.filter(a => a.status === 'selected').length} 
              icon={CheckCircle}
              colorClass="text-green-600 bg-green-100"
            />
          </>
        )}

        {user.role === 'employer' && jobs && (
          <>
            <StatCard 
              title="Active Jobs" 
              value={jobs.filter(j => j.employerId === user.id).length} 
              icon={Briefcase}
              colorClass="text-indigo-600 bg-indigo-100"
            />
             <StatCard 
              title="Total Applications" 
              value={applications?.length || 0} 
              icon={Users}
              colorClass="text-pink-600 bg-pink-100"
            />
          </>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Applications List */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-display">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {!applications || applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No applications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div>
                      <h4 className="font-semibold text-slate-800">{app.job.title}</h4>
                      <p className="text-sm text-slate-500">
                        {user.role === 'student' 
                          ? `at ${app.job.employerId}` // Ideally join employer name here
                          : `Applied by ${app.student.name}`
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground hidden sm:inline-block">
                        {app.appliedAt && format(new Date(app.appliedAt), 'MMM d')}
                      </span>
                      <Badge variant="secondary" className={`
                        capitalize 
                        ${app.status === 'selected' ? 'bg-green-100 text-green-700' : ''}
                        ${app.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                        ${app.status === 'shortlisted' ? 'bg-amber-100 text-amber-700' : ''}
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

        {/* Recent Jobs or Stats Chart area */}
        <Card className="border-none shadow-sm">
           <CardHeader>
            <CardTitle className="font-display">
              {user.role === 'student' ? 'Recommended Jobs' : 'Recent Job Postings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
             {!jobs || jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No jobs available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-indigo-900">{job.title}</h4>
                        <p className="text-sm text-slate-500">{job.location} • {job.salary}</p>
                      </div>
                      <Badge variant="outline" className="border-indigo-100 text-indigo-600">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
