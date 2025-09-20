
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { User, ResumeData, CareerRoadmap, InterviewSession, UserProfile, RecruiterProfile, RecruiterSettings, Assessment, AssessmentResult } from '../types';
import { MOCK_USERS, MOCK_ASSESSMENTS, MOCK_ASSESSMENT_RESULTS, MOCK_CANDIDATE_DATA } from '../utils/mockData';

interface AppContextType {
  user: User | null;
  resumeData: ResumeData | null;
  careerRoadmap: CareerRoadmap | null;
  interviewHistory: InterviewSession[];
  userProfile: UserProfile | null;
  recruiterProfile: RecruiterProfile | null;
  recruiterSettings: RecruiterSettings | null;
  assessments: Assessment[];
  assessmentResults: AssessmentResult[];
  isLoading: boolean;
  error: string | null;
  signup: (userData: Omit<User, 'role'>, role: 'candidate' | 'recruiter') => Promise<void>;
  login: (credentials: Pick<User, 'email' | 'password'>) => Promise<void>;
  logout: () => void;
  deleteCurrentUserAccount: () => void;
  setResumeData: (data: ResumeData | null) => void;
  setCareerRoadmap: (roadmap: CareerRoadmap | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addInterviewSession: (session: InterviewSession) => void;
  updateUserProfile: (profile: UserProfile) => void;
  updateRecruiterProfile: (profile: RecruiterProfile) => void;
  updateRecruiterSettings: (settings: RecruiterSettings) => void;
  createAssessment: (assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'createdBy'>) => void;
  addAssessmentResult: (resultData: Omit<AssessmentResult, 'id' | 'completedAt'>) => void;
  deleteAssessment: (assessmentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultRecruiterSettings: RecruiterSettings = {
    emailNotifications: true,
    assessmentReminders: true,
    weeklyReports: false,
    autoReject: false,
    passingScore: 70,
    timeLimit: 60,
};

// In-memory store to simulate a database for the session
let usersDB = [...MOCK_USERS];
let assessmentsDB = [...MOCK_ASSESSMENTS];
let assessmentResultsDB = [...MOCK_ASSESSMENT_RESULTS];
let candidateDataDB = new Map(MOCK_CANDIDATE_DATA);


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [careerRoadmap, setCareerRoadmap] = useState<CareerRoadmap | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<InterviewSession[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);
  const [recruiterSettings, setRecruiterSettings] = useState<RecruiterSettings | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [isLoading, setLoading] = useState(false); // No initial loading, app starts logged out
  const [error, setError] = useState<string | null>(null);

  const clearState = () => {
    setUser(null);
    setResumeData(null);
    setCareerRoadmap(null);
    setInterviewHistory([]);
    setUserProfile(null);
    setRecruiterProfile(null);
    setRecruiterSettings(null);
    setAssessments([]);
    setAssessmentResults([]);
    setError(null);
  };

  const signup = async (userData: Omit<User, 'role' | 'password'> & {password: string}, role: 'candidate' | 'recruiter') => {
    // Simulates calling a backend API to sign up a user
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if (usersDB.find(u => u.email === userData.email)) {
                reject(new Error("User with this email already exists."));
                return;
            }
            const newUser: User = { ...userData, role };
            usersDB.push(newUser);
            // Automatically log in the new user
            login({ email: newUser.email, password: newUser.password }).then(resolve).catch(reject);
        }, 500);
    });
  };

  const login = async (credentials: Pick<User, 'email' | 'password'>) => {
     // Simulates calling a backend API to log in
    setLoading(true);
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            const foundUser = usersDB.find(u => u.email === credentials.email && u.password === credentials.password);
            
            if (foundUser) {
                const { password, ...userToSet } = foundUser;
                setUser(userToSet);

                // FIX: Load assessments and results for ALL logged-in users.
                // This ensures candidates can access assessment links.
                setAssessments(assessmentsDB);
                setAssessmentResults(assessmentResultsDB);

                // Simulate fetching user-specific data from the backend after login
                if (foundUser.role === 'candidate') {
                    const data = candidateDataDB.get(foundUser.email) || {
                        resumeData: null, careerRoadmap: null, interviewHistory: [], 
                        userProfile: { 
                            fullName: foundUser.name, email: foundUser.email, linkedinUrl: '', skills: [], languages: [], 
                            profilePhotoUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${foundUser.name}`, resumeText: ''
                        }
                    };
                    setResumeData(data.resumeData);
                    setCareerRoadmap(data.careerRoadmap);
                    setInterviewHistory(data.interviewHistory);
                    setUserProfile(data.userProfile);
                } else if (foundUser.role === 'recruiter') {
                    setRecruiterProfile({ fullName: foundUser.name, email: foundUser.email, company: 'AI Corp' });
                    setRecruiterSettings(defaultRecruiterSettings);
                }
                setError(null);
                resolve();
            } else {
                reject(new Error("Invalid email or password."));
            }
            setLoading(false);
        }, 1000);
    });
  };

  const logout = () => {
    clearState();
  };

  const deleteCurrentUserAccount = () => {
    if (!user) return;
    // Simulates API call to delete user
    usersDB = usersDB.filter(u => u.email !== user.email);
    if (user.role === 'recruiter') {
        assessmentsDB = assessmentsDB.filter(a => a.createdBy !== user.email);
    }
    candidateDataDB.delete(user.email);
    logout();
  };
  
  const addInterviewSession = (session: InterviewSession) => {
    setInterviewHistory(prev => [session, ...prev]);
  };

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };
  
  const updateRecruiterProfile = (profile: RecruiterProfile) => {
    setRecruiterProfile(profile);
  };
  
  const updateRecruiterSettings = (settings: RecruiterSettings) => {
    setRecruiterSettings(settings);
  };

  const createAssessment = (assessmentData: Omit<Assessment, 'id' | 'createdAt' | 'createdBy'>) => {
      if (!user || user.role !== 'recruiter') throw new Error("Only recruiters can create assessments.");
      const newAssessment: Assessment = {
          ...assessmentData,
          id: `asmt_${Date.now()}`,
          createdAt: new Date().toISOString(),
          createdBy: user.email,
      };
      assessmentsDB.push(newAssessment);
      setAssessments(prev => [...prev, newAssessment]);
  };
  
  const addAssessmentResult = (resultData: Omit<AssessmentResult, 'id' | 'completedAt'>) => {
      const newResult: AssessmentResult = {
          ...resultData,
          id: `res_${Date.now()}`,
          completedAt: new Date().toISOString(),
      };
      assessmentResultsDB.push(newResult);
      setAssessmentResults(prev => [...prev, newResult]);
  };

  const deleteAssessment = (assessmentId: string) => {
      // Update the mock "DB" for persistence across logins
      assessmentsDB = assessmentsDB.filter(a => a.id !== assessmentId);
      assessmentResultsDB = assessmentResultsDB.filter(r => r.assessmentId !== assessmentId);
      
      // Update state using functional updates for reliability, ensuring the UI always reflects the change.
      setAssessments(prev => prev.filter(a => a.id !== assessmentId));
      setAssessmentResults(prev => prev.filter(r => r.assessmentId !== assessmentId));
  };

  const value = {
    user,
    resumeData,
    careerRoadmap,
    interviewHistory,
    userProfile,
    recruiterProfile,
    recruiterSettings,
    assessments,
    assessmentResults,
    isLoading,
    error,
    signup,
    login,
    logout,
    deleteCurrentUserAccount,
    setResumeData,
    setCareerRoadmap,
    setLoading,
    setError,
    addInterviewSession,
    updateUserProfile,
    updateRecruiterProfile,
    updateRecruiterSettings,
    createAssessment,
    addAssessmentResult,
    deleteAssessment
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
