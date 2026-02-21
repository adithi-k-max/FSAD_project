import { useState } from "react";
import { useJobs, useCreateJob } from "@/hooks/use-jobs";
import { useApplications, useApplyForJob } from "@/hooks/use-applications";
import { useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, DollarSign, Plus, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function JobsPage() {
  const { data: user } = useUser();
  const { data: jobs, isLoading } = useJobs();
  const { data: myApplications } = useApplications();
  const { mutate: apply, isPending: isApplying } = useApplyForJob();
  const { mutate: createJob, isPending: isCreating } = useCreateJob();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
  });

  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) || 
    job.location.toLowerCase().includes(search.toLowerCase())
  );

  const hasApplied = (jobId: number) => {
    return myApplications?.some(app => app.jobId === jobId);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    createJob(newJob, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewJob({ title: "", description: "", requirements: "", location: "", salary: "" });
      }
    });
  };

  const handleApply = (jobId: number) => {
    if (hasApplied(jobId)) {
      toast({
        title: "Application Sent",
        description: "You've already submitted an application for this role",
        variant: "default",
      });
      return;
    }
    apply(jobId);
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-page-title text-slate-900 mb-2">Available Roles</h1>
          <p className="text-base text-slate-600">
            {user.role === 'student' 
              ? `Explore and apply to ${jobs?.length || 0} roles` 
              : 'Recruit top talent'}
          </p>
        </div>
        
        {user.role === 'employer' && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" /> Create Opening
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create a Job Opening</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateJob} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input 
                    id="title"
                    required 
                    value={newJob.title}
                    onChange={e => setNewJob({...newJob, title: e.target.value})}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location"
                      required 
                      value={newJob.location}
                      onChange={e => setNewJob({...newJob, location: e.target.value})}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary Range</Label>
                    <Input 
                      id="salary"
                      required 
                      value={newJob.salary}
                      onChange={e => setNewJob({...newJob, salary: e.target.value})}
                      placeholder="e.g., $80K-$120K"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    required 
                    value={newJob.description}
                    onChange={e => setNewJob({...newJob, description: e.target.value})}
                    placeholder="Describe the opportunity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea 
                    id="requirements"
                    required 
                    value={newJob.requirements}
                    onChange={e => setNewJob({...newJob, requirements: e.target.value})}
                    placeholder="Required skills and experience"
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600" disabled={isCreating}>
                  {isCreating ? "Posting..." : "Post Job"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search Bar */}
      {user.role === 'student' && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search roles by title or location" 
            className="pl-10 bg-white border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !filteredJobs || filteredJobs.length === 0 ? (
        <div className="text-center py-16 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-slate-600 font-medium mb-2">No matching roles found</p>
          <p className="text-sm text-slate-500">
            {search ? 'Refine your search or explore broader criteria' : 'Check back soon for new openings'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="card-base card-hover overflow-hidden">
              <CardContent className="p-6">
                {/* Job Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-card-title text-slate-900 mb-1">{job.title}</h3>
                      <p className="text-sm text-slate-600">{job.employer?.name || "Company Information"}</p>
                    </div>
                    {hasApplied(job.id) && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 flex-shrink-0">
                        Applied
                      </Badge>
                    )}
                  </div>

                  {/* Job Meta */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Active
                    </div>
                  </div>
                </div>

                {/* Description Preview */}
                <div className="mb-6 pb-6 border-t border-slate-200 pt-6">
                  <p className="text-slate-700 line-clamp-2 mb-3">{job.description}</p>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p className="font-medium">Requirements:</p>
                    <p className="line-clamp-2">{job.requirements}</p>
                  </div>
                </div>

                {/* Action Button */}
                {user.role === 'student' ? (
                  <Button 
                    onClick={() => handleApply(job.id)}
                    disabled={isApplying || hasApplied(job.id)}
                    className={`w-full ${
                      hasApplied(job.id) 
                        ? 'bg-slate-200 text-slate-600 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {hasApplied(job.id) ? 'Application Sent' : 'Apply'}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full">
                    Review Candidates
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
