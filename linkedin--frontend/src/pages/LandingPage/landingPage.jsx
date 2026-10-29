import React from 'react';
import { Link } from 'react-router-dom';
import GoogleLoginComp from '../../components/GoogleLogin/googleLoginComp';
import Card from '../../components/Card/card';
import {
  ArrowRight,
  Briefcase,
  Users,
  Sparkles,
  ShieldCheck,
  Globe2
} from 'lucide-react';

const LandingPage = (props) => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-8 xl:px-24 py-12 transition-colors duration-300">
      <div className="w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-400">
            <Sparkles size={14} />
            <span>The Next Generation Professional Network</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]"
            style={{ color: 'var(--text-primary)' }}
          >
            Welcome to your <br />
            <span className="text-[#0a66c2]">professional community</span>.
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-lg leading-relaxed">
            Connect with top designers, developers, and industry leaders worldwide. Showcase your projects, discover opportunities, and elevate your career.
          </p>

          {/* Quick Actions Card */}
          <Card padding={false} className="p-6 max-w-md shadow-xl border">
            <div className="space-y-3">
              <GoogleLoginComp changeLoginValue={props.changeLoginValue} />

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-[1px]" style={{ backgroundColor: 'var(--border-color)' }} />
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">or</span>
                <div className="flex-1 h-[1px]" style={{ backgroundColor: 'var(--border-color)' }} />
              </div>

              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0a66c2] hover:bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
              >
                <span>Sign in with Email</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/signUp"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[var(--border-color)] hover:bg-white/5 font-semibold text-xs transition-all"
                style={{ color: 'var(--text-primary)' }}
              >
                <span>New to LinkPro? Join Now</span>
              </Link>
            </div>

            <p className="text-[10px] text-gray-500 text-center mt-4 leading-tight">
              By clicking continue, you agree to LinkPro's User Agreement, Privacy Policy, and Cookie Policy.
            </p>
          </Card>
        </div>

        {/* Right Hero Graphic */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-sky-500/20 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

            <Card padding={false} className="relative shadow-2xl p-6 border space-y-5 backdrop-blur-xl">
              <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="w-10 h-10 rounded-xl bg-[#0a66c2] flex items-center justify-center text-white font-bold">
                  in
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    LinkPro Network
                  </div>
                  <div className="text-xs text-sky-400 font-medium">Enterprise & Creator Hub</div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <Briefcase size={18} className="text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Find Opportunities
                    </div>
                    <div className="text-[11px] text-gray-400">Discover job openings tailored to your skillset.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <Users size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Build Connections
                    </div>
                    <div className="text-[11px] text-gray-400">Collaborate and chat in real time with industry peers.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <Globe2 size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Share Ideas & Concepts
                    </div>
                    <div className="text-[11px] text-gray-400">Post explorations, designs, articles, and media feeds.</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;