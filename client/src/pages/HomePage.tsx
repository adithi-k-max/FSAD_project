import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, Lock, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-slate-900">CampusPlace</div>
          <div className="space-x-3">
            <Link href="/auth">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Refined, Professional */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl">
          <h1 className="text-page-title text-slate-900 mb-6">
            Match talent with purpose
          </h1>
          <p className="text-lg text-slate-700 mb-8 leading-relaxed">
            CampusPlace powers structured placements. Students reach employers. Employers find talent. 
            Built for universities that mean business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/auth?role=student">
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
                I'm a Student
              </Button>
            </Link>
            <Link href="/auth?role=employer">
              <Button variant="outline" className="w-full sm:w-auto border-slate-300">
                I'm an Employer
              </Button>
            </Link>
          </div>

          {/* Key Metrics - Subtle, Intentional */}
          <div className="grid grid-cols-3 gap-8 border-t border-slate-200 pt-8">
            <div>
              <div className="text-2xl font-bold text-slate-900 mb-1">1200+</div>
              <div className="text-sm text-slate-600">Active Students</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 mb-1">85%</div>
              <div className="text-sm text-slate-600">Placement Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 mb-1">50+</div>
              <div className="text-sm text-slate-600">Recruiting Partners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why CampusPlace - Three Distinct Features */}
      <section className="bg-slate-50 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-section-title text-slate-900 mb-12">
            Built for placement that works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-card-title text-slate-900 mb-3">
                Full Visibility
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Every step tracked in real-time. No surprises. No bottlenecks. Pure transparency.
              </p>
            </div>

            {/* Feature 2 */}
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-card-title text-slate-900 mb-3">
                Enterprise Security
              </h3>
              <p className="text-slate-700 leading-relaxed">
                GDPR-compliant. ISO-grade infrastructure. Your institutional data is protected.
              </p>
            </div>

            {/* Feature 3 */}
            <div>
              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="text-card-title text-slate-900 mb-3">
                Your Systems First
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Integrates with your existing infrastructure. Controls and compliance baked in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-section-title text-slate-900 mb-6">
            Ready to scale placements?
          </h2>
          <p className="text-lg text-slate-700 mb-8 max-w-lg mx-auto">
            Leading universities and employers rely on CampusPlace to execute placements at scale.
          </p>
          <Link href="/auth">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
