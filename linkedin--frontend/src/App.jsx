import { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Loader from './components/Loader/loader';
import Navbar2 from './components/Navbar2/navbar2';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Lazy loaded pages & components
const Navbar1 = lazy(() => import('./components/NavbarV1/navbar1'));
const Footer = lazy(() => import('./components/Footer/footer'));

const LandingPage = lazy(() => import('./pages/LandingPage/landingPage'));
const SignUp = lazy(() => import('./pages/SignUp/signUp'));
const Login = lazy(() => import('./pages/Login/login'));

const Feeds = lazy(() => import('./pages/Feeds/feeds'));
const MyNetwork = lazy(() => import('./pages/MyNetwork/myNetwork'));
const Resume = lazy(() => import('./pages/Resume/resume'));
const Messages = lazy(() => import('./pages/Messages/messages'));
const Profile = lazy(() => import('./pages/Profile/profile'));
const AllActivities = lazy(() => import('./pages/AllActivities/allActivities'));
const AllSavedPosts = lazy(() => import('./pages/AllSavedPosts/allSavedPosts'));
const SingleActivity = lazy(() => import('./pages/SingleActivity/singleActivity'));
const Notification = lazy(() => import('./pages/Notification/notification'));
const Dashboard = lazy(() => import('./pages/Admin/dashboard'));

const ForgotPassword = lazy(() => import('./pages/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword/ResetPassword'));

function App() {
  const [isLogin, setIsLogin] = useState(() => {
    const saved = localStorage.getItem('isLogin');
    return saved === 'true' || saved === true;
  });

  const [userInfo, setUserInfo] = useState(null);
  const isAdmin = userInfo?.role === 'admin';

  const changeLoginValue = (val) => {
    const boolVal = val === true || val === 'true';
    setIsLogin(boolVal);
    localStorage.setItem('isLogin', boolVal ? 'true' : 'false');
  };

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (user) {
      try {
        setUserInfo(JSON.parse(user));
      } catch (e) {
        setUserInfo(null);
      }
    }
  }, [isLogin]);

  return (
    <div
      className="min-h-screen flex flex-col box-border transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-primary)',
      }}
    >
      <Suspense fallback={<Loader />}>
        {/* Navigation Bar */}
        {!isAdmin && (isLogin ? <Navbar2 /> : <Navbar1 />)}

        {/* Main Content Router */}
        <div className="flex-grow">
          <Routes>
            {/* Entry / Public Routes */}
            <Route
              path="/"
              element={
                isLogin ? (
                  <Navigate to="/feeds" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/landing"
              element={
                isLogin ? <Navigate to="/feeds" replace /> : <LandingPage changeLoginValue={changeLoginValue} />
              }
            />

            <Route
              path="/signUp"
              element={
                isLogin ? <Navigate to="/feeds" replace /> : <SignUp changeLoginValue={changeLoginValue} />
              }
            />

            <Route
              path="/login"
              element={
                isLogin ? (
                  userInfo?.role === 'admin' ? (
                    <Navigate to="/admin/dashboard" replace />
                  ) : (
                    <Navigate to="/feeds" replace />
                  )
                ) : (
                  <Login changeLoginValue={changeLoginValue} />
                )
              }
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/feeds"
              element={
                <ProtectedRoute isLogin={isLogin}>
                  <Feeds />
                </ProtectedRoute>
              }
            />

            <Route
              path="/myNetwork"
              element={
                <ProtectedRoute isLogin={isLogin}>
                  <MyNetwork />
                </ProtectedRoute>
              }
            />

            <Route
              path="/resume"
              element={
                <ProtectedRoute isLogin={isLogin}>
                  <Resume />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute isLogin={isLogin}>
                  <Messages />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notification"
              element={
                <ProtectedRoute isLogin={isLogin}>
                  <Notification />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute isLogin={isLogin}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:id/activities"
              element={
                <ProtectedRoute isLogin={isLogin}>
                  <AllActivities />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:id/activities/:postId"
              element={
                <ProtectedRoute isLogin={isLogin}>
                  <SingleActivity />
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved-posts"
              element={
                <ProtectedRoute isLogin={isLogin}>
                  <AllSavedPosts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute isLogin={isLogin && isAdmin}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to={isLogin ? "/feeds" : "/login"} replace />} />
          </Routes>
        </div>
      </Suspense>
    </div>
  );
}

export default App;