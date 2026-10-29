import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/card';
import ProfileCard from '../../components/ProfileCard/profileCard';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Mail,
  Send,
  RefreshCw,
  Eye,
  Award,
  ShieldCheck,
  Briefcase,
  Copy,
  ChevronDown,
  X
} from 'lucide-react';

const Resume = () => {
  const [userData, setUserData] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Active AI Mode: null | 'ats' | 'coverLetter'
  const [activeAiMode, setActiveAiMode] = useState(null);

  // ATS Score state
  const [loadingAts, setLoadingAts] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsTargetRole, setAtsTargetRole] = useState('');

  // Cover Letter state
  const [targetRole, setTargetRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/auth/self', {
        withCredentials: true,
      });
      if (res.data?.user) {
        setUserData(res.data.user);
        setResumeUrl(res.data.user.resume || '');
        if (res.data.user.headline) {
          setTargetRole(res.data.user.headline.split('|')[0].trim());
          setAtsTargetRole(res.data.user.headline.split('|')[0].trim());
        }
        localStorage.setItem('userInfo', JSON.stringify(res.data.user));
      }
    } catch (err) {
      const local = localStorage.getItem('userInfo');
      if (local) {
        try {
          const u = JSON.parse(local);
          setUserData(u);
          setResumeUrl(u.resume || '');
          if (u.headline) {
            setTargetRole(u.headline.split('|')[0].trim());
            setAtsTargetRole(u.headline.split('|')[0].trim());
          }
        } catch (e) {}
      }
    }
  };

  const handleUploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'linkedInClone');

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dmnhbiouy/image/upload',
        data
      );
      const uploadedUrl = response.data?.url;

      if (uploadedUrl) {
        setResumeUrl(uploadedUrl);
        await axios.put(
          'http://localhost:4000/api/auth/update',
          { user: { resume: uploadedUrl } },
          { withCredentials: true }
        );
        toast.success('CV uploaded and saved to your profile!');
        fetchUserData();
      }
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      setResumeUrl(localUrl);
      toast.success('CV attached successfully!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveResume = async () => {
    try {
      await axios.put(
        'http://localhost:4000/api/auth/update',
        { user: { resume: '' } },
        { withCredentials: true }
      );
    } catch (e) {}
    setResumeUrl('');
    toast.info('Resume removed from profile.');
  };

  // ========================================================
  // 1. CHECK ATS SCORE OF THE USER'S CV & PROFILE
  // ========================================================
  const handleCheckAtsScore = async () => {
    setActiveAiMode('ats');
    setLoadingAts(true);
    const activeProfile = userData || JSON.parse(localStorage.getItem('userInfo') || '{}');
    try {
      const res = await axios.post(
        'http://localhost:4000/api/ai/analyze-resume',
        {
          targetRole: atsTargetRole || activeProfile?.headline || 'Software Engineer',
          userProfile: activeProfile,
          resumeUrl: resumeUrl || activeProfile?.resume || '',
          resumeText: '',
        },
        { withCredentials: true, timeout: 15000 }
      );

      if (res.data?.success && res.data?.analysis) {
        setAtsResult(res.data.analysis);
        toast.success('ATS evaluation completed!');
      } else {
        toast.error(res.data?.message || 'Failed to compute ATS score.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to compute ATS score. Please try again.');
    } finally {
      setLoadingAts(false);
    }
  };

  // ========================================================
  // 2. WRITE COVER LETTER FROM USER'S CV & PROFILE
  // ========================================================
  const handleGenerateCoverLetter = async () => {
    if (!companyName.trim()) {
      return toast.warn('Please enter the target company or organization name.');
    }
    setLoadingLetter(true);
    const activeProfile = userData || JSON.parse(localStorage.getItem('userInfo') || '{}');
    try {
      const res = await axios.post(
        'http://localhost:4000/api/ai/generate-cover-letter',
        {
          targetRole: targetRole || activeProfile?.headline || 'Software Engineer',
          companyName: companyName.trim(),
          userProfile: activeProfile,
          resumeText: '', // Server pulls straight from userProfile & resume URL
        },
        { withCredentials: true, timeout: 15000 }
      );

      if (res.data?.success && res.data?.data) {
        setEmailSubject(res.data.data.subject || `Job Application: ${targetRole || 'Developer'} - ${activeProfile?.f_name || 'Candidate'}`);
        setGeneratedLetter(res.data.data.coverLetter || '');
        toast.success('Cover letter generated from your profile & CV!');
      } else {
        toast.error(res.data?.message || 'Failed to generate cover letter.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate cover letter. Please try again.');
    } finally {
      setLoadingLetter(false);
    }
  };

  // ========================================================
  // 3. SEND COVER LETTER VIA EMAIL TO RECRUITER
  // ========================================================
  const handleSendEmail = async () => {
    if (!recruiterEmail.trim() || !recruiterEmail.includes('@')) {
      return toast.warn('Please enter a valid recruiter or employer email address.');
    }
    if (!generatedLetter.trim()) {
      return toast.warn('Cover letter content cannot be empty.');
    }

    setSendingEmail(true);
    try {
      const res = await axios.post(
        'http://localhost:4000/api/ai/send-cover-letter',
        {
          recipientEmail: recruiterEmail.trim(),
          subject: emailSubject || `Application for ${targetRole} - ${userData?.f_name || 'Candidate'}`,
          coverLetter: generatedLetter,
          candidateName: userData?.f_name || 'LinkPro Candidate',
          candidateEmail: userData?.email || '',
          resumeUrl: resumeUrl || userData?.resume || '',
        },
        { withCredentials: true, timeout: 15000 }
      );

      if (res.data?.success) {
        toast.success(res.data.message || `Cover letter emailed to ${recruiterEmail}!`);
        setRecruiterEmail('');
      } else {
        toast.error(res.data?.message || 'Could not send email.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to send email. Please verify SMTP credentials or recipient email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const copyCoverLetter = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    toast.success('Cover letter copied to clipboard!');
  };

  return (
    <main className="min-h-screen px-3 sm:px-6 xl:px-20 py-6 flex justify-center transition-colors duration-300">
      <div className="w-full max-w-[1240px] flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ================= LEFT PROFILE SIDEBAR ================= */}
        <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-4">
          <ProfileCard data={userData} />

          {/* Quick Profile Summary Card */}
          <Card padding={false} className="p-4 shadow-sm border" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <ShieldCheck size={15} className="text-[#0a66c2]" />
              <span>Active Profile Details</span>
            </h3>
            <p className="text-[11px] text-gray-400 mb-3">
              AI features use your real profile & CV details directly from database.
            </p>
            <div className="flex flex-col gap-2 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 block">Name:</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{userData?.f_name || 'LinkPro User'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Headline:</span>
                <span className="font-semibold line-clamp-1" style={{ color: 'var(--text-primary)' }}>{userData?.headline || 'LinkPro Member'}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Skills ({userData?.skills?.length || 0}):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(userData?.skills || []).slice(0, 5).map((s, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-[#0a66c2] font-medium">
                      {s}
                    </span>
                  ))}
                  {(userData?.skills?.length || 0) > 5 && (
                    <span className="text-[10px] text-gray-400">+{userData.skills.length - 5} more</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </aside>

        {/* ================= RIGHT MAIN SECTION: CV VIEWER & AI ACTIONS ================= */}
        <section className="flex-1 w-full flex flex-col gap-5">
          
          {/* Top Header Card */}
          <Card padding={false} className="p-5 shadow-sm border" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-base sm:text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <FileText className="text-[#0a66c2]" size={20} />
                  <span>Resume & CV Management</span>
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  View your active resume, check its ATS score, or generate and email a cover letter to recruiters.
                </p>
              </div>

              {/* Upload / Replace Actions */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="cvFileInput"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0a66c2] hover:bg-blue-600 text-white text-xs font-semibold cursor-pointer shadow transition-all"
                >
                  <Upload size={13} />
                  <span>{isUploading ? 'Uploading...' : resumeUrl ? 'Replace CV' : 'Upload CV'}</span>
                </label>
                <input
                  id="cvFileInput"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleUploadResume}
                  className="hidden"
                />

                {resumeUrl && (
                  <button
                    onClick={handleRemoveResume}
                    className="p-1.5 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Remove Resume"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* TWO SIMPLE AI ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              
              {/* Option 1: Check ATS Score */}
              <button
                onClick={handleCheckAtsScore}
                disabled={loadingAts}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  activeAiMode === 'ats'
                    ? 'bg-[#0a66c2] text-white border-[#0a66c2]'
                    : 'bg-blue-500/10 border-blue-500/30 text-[#0a66c2] hover:bg-blue-500/20'
                }`}
              >
                {loadingAts ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Analyzing ATS Score...</span>
                  </>
                ) : (
                  <>
                    <Award size={15} />
                    <span>Check ATS Score of My Resume</span>
                  </>
                )}
              </button>

              {/* Option 2: Write Cover Letter & Mail */}
              <button
                onClick={() => {
                  setActiveAiMode(activeAiMode === 'coverLetter' ? null : 'coverLetter');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  activeAiMode === 'coverLetter'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                }`}
              >
                <Mail size={15} />
                <span>Write Cover Letter & Email Recruiter</span>
              </button>
            </div>
          </Card>

          {/* ================= AI FEATURE PANEL 1: ATS SCORE RESULT ================= */}
          {activeAiMode === 'ats' && atsResult && (
            <Card padding={false} className="p-5 shadow-sm border bg-[#0a66c2]/5 border-blue-500/20">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3.5">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black shadow-sm ${
                    atsResult.overallScore >= 80 ? 'bg-emerald-600 text-white' :
                    atsResult.overallScore >= 65 ? 'bg-[#0a66c2] text-white' :
                    atsResult.overallScore >= 45 ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'
                  }`}>
                    <span className="text-2xl leading-none">{atsResult.overallScore}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-90 mt-0.5">/ 100</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        Real ATS Score:
                      </h3>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        atsResult.overallScore >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                        atsResult.overallScore >= 65 ? 'bg-blue-500/10 text-[#0a66c2] border-blue-500/30' :
                        atsResult.overallScore >= 45 ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'
                      }`}>
                        {atsResult.grade || 'Evaluated'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {atsResult.summary}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveAiMode(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 4 Dimension Scoring Breakdown Bars */}
              {atsResult.dimensionScores && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 p-3 rounded-xl border bg-[var(--bg-card)]" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-gray-400 mb-1">
                      <span>CV File Status</span>
                      <span className="font-bold text-[#0a66c2]">{atsResult.dimensionScores.cvDocument || 0}/25</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full bg-[#0a66c2] rounded-full" style={{ width: `${((atsResult.dimensionScores.cvDocument || 0)/25)*100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-gray-400 mb-1">
                      <span>Skills Coverage</span>
                      <span className="font-bold text-purple-500">{atsResult.dimensionScores.skillsAndKeywords || 0}/25</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${((atsResult.dimensionScores.skillsAndKeywords || 0)/25)*100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-gray-400 mb-1">
                      <span>Experience & Metrics</span>
                      <span className="font-bold text-emerald-500">{atsResult.dimensionScores.experienceAndMetrics || 0}/25</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${((atsResult.dimensionScores.experienceAndMetrics || 0)/25)*100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-gray-400 mb-1">
                      <span>Headline & Summary</span>
                      <span className="font-bold text-amber-500">{atsResult.dimensionScores.headlineAndSummary || 0}/25</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${((atsResult.dimensionScores.headlineAndSummary || 0)/25)*100}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* What to Improve vs Strengths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* How to Improve Section */}
                <div className="p-3.5 rounded-xl border bg-amber-500/5 border-amber-500/20 flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-amber-500/20">
                    <AlertTriangle size={15} className="text-amber-500" />
                    <h4 className="text-xs font-bold text-amber-500">
                      Step-by-Step Fixes to Boost Your Score
                    </h4>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {atsResult.improvements && atsResult.improvements.length > 0 ? (
                      atsResult.improvements.map((item, i) => (
                        <div key={i} className="p-2.5 rounded-lg border bg-[var(--bg-card)] text-xs flex flex-col gap-1" style={{ borderColor: 'var(--border-color)' }}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-amber-500">{item.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              {item.impact}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400">
                            {item.issue}
                          </p>
                          <div className="text-[11px] font-medium text-[#0a66c2] flex items-start gap-1 mt-0.5">
                            <span className="font-bold">→ Fix:</span>
                            <span>{item.fix}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">Your profile and CV are highly optimized for ATS filters!</p>
                    )}
                  </div>
                </div>

                {/* Verified Strengths */}
                <div className="p-3.5 rounded-xl border bg-emerald-500/5 border-emerald-500/20 flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-emerald-500/20">
                    <CheckCircle2 size={15} className="text-emerald-500" />
                    <h4 className="text-xs font-bold text-emerald-500">
                      What Your CV & Profile Did Well
                    </h4>
                  </div>

                  <ul className="flex flex-col gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                    {atsResult.strengths?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[var(--bg-card)] border" style={{ borderColor: 'var(--border-color)' }}>
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Recommended Keywords Pill Box */}
                  {atsResult.recommendedKeywordsToAdd && atsResult.recommendedKeywordsToAdd.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-emerald-500/20">
                      <span className="text-[11px] font-bold text-gray-400 block mb-1.5">
                        High-Priority ATS Keywords for {atsTargetRole || 'this role'}:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {atsResult.recommendedKeywordsToAdd.map((kw, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-[#0a66c2] font-semibold border border-blue-500/20">
                            +{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </Card>
          )}

          {/* ================= AI FEATURE PANEL 2: COVER LETTER & DIRECT MAILER ================= */}
          {activeAiMode === 'coverLetter' && (
            <Card padding={false} className="p-5 shadow-sm border" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex justify-between items-center pb-3 mb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      AI Cover Letter & Direct Recruiter Mailer
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Creates a personalized cover letter from your profile & CV, then emails it directly to the employer.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveAiMode(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Generation Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold block mb-1 text-gray-400">Target Role / Designation</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Full Stack Developer, Data Analyst"
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1 text-gray-400">Target Company Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google, Infosys, Microsoft, Startup"
                    className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={loadingLetter}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow transition cursor-pointer disabled:opacity-50"
                >
                  {loadingLetter ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Writing Cover Letter from Your Profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>Generate Cover Letter</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generated Cover Letter Editor & Email Sender */}
              {generatedLetter && (
                <div className="flex flex-col gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  
                  {/* Email Subject line */}
                  <div>
                    <label className="text-xs font-semibold block mb-1 text-gray-400">Email Subject Line</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  {/* Letter Body Editor */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-gray-400">Cover Letter Body (Review & Edit freely)</label>
                      <button
                        onClick={copyCoverLetter}
                        className="text-xs text-[#0a66c2] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Copy size={12} />
                        <span>Copy Text</span>
                      </button>
                    </div>
                    <textarea
                      rows={8}
                      value={generatedLetter}
                      onChange={(e) => setGeneratedLetter(e.target.value)}
                      className="w-full p-3 rounded-xl border text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#0a66c2] font-sans"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>

                  {/* Recruiter Email & Send Button */}
                  <div className="p-3 rounded-xl border bg-purple-500/5 border-purple-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-1">
                    <div className="flex-1 flex items-center gap-2">
                      <Mail size={16} className="text-purple-400 flex-shrink-0" />
                      <input
                        type="email"
                        value={recruiterEmail}
                        onChange={(e) => setRecruiterEmail(e.target.value)}
                        placeholder="Enter Recruiter / Employer Email (e.g. hr@company.com)..."
                        className="w-full px-3 py-2 rounded-lg border text-xs focus:outline-none"
                        style={{
                          backgroundColor: 'var(--bg-input)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)',
                        }}
                      />
                    </div>

                    <button
                      onClick={handleSendEmail}
                      disabled={sendingEmail || !recruiterEmail.trim()}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      {sendingEmail ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Mailing Application...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Send Email to Recruiter</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}
            </Card>
          )}

          {/* ================= DEFAULT VIEW: CV / RESUME VIEWER ================= */}
          <Card padding={false} className="p-6 shadow-sm border" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#0a66c2]" />
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Your Uploaded CV Document
                </h2>
              </div>

              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#0a66c2] font-semibold hover:underline"
                >
                  <Eye size={13} />
                  <span>Open Full Size</span>
                </a>
              )}
            </div>

            {resumeUrl ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    <span>Your resume is active and attached to your LinkPro profile.</span>
                  </div>
                </div>

                {/* CV Document Box */}
                <div className="w-full rounded-2xl overflow-hidden border bg-black/5 dark:bg-black/20 flex justify-center p-3" style={{ borderColor: 'var(--border-color)' }}>
                  <img
                    src={resumeUrl}
                    alt="Resume Document"
                    className="max-h-[780px] w-auto object-contain rounded-lg shadow-sm"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-2xl p-6" style={{ borderColor: 'var(--border-color)' }}>
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-[#0a66c2] mb-3">
                  <Briefcase size={26} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  No resume document uploaded yet
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  Upload your CV in PDF or image format to display it here and allow recruiters to review your qualifications.
                </p>
                <label
                  htmlFor="cvFileInput"
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a66c2] text-white text-xs font-semibold hover:bg-blue-600 cursor-pointer shadow transition-all"
                >
                  <Upload size={14} />
                  <span>Upload Resume Now</span>
                </label>
              </div>
            )}
          </Card>

        </section>

      </div>
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </main>
  );
};

export default Resume;
