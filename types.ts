export type UserRole = 'candidate' | 'recruiter';

export interface User {
  name: string;
  email: string;
  password?: string; // Stored only in localStorage for simulation
  role: UserRole;
}

export interface UserProfile {
    fullName: string;
    email: string;
    linkedinUrl: string;
    skills: string[];
    languages: string[];
    profilePhotoUrl: string; // For simulation, will hold a placeholder or data URL
    resumeText?: string;
}

export interface RecruiterProfile {
    fullName: string;
    email: string;
    company: string;
}

export interface RecruiterSettings {
    emailNotifications: boolean;
    assessmentReminders: boolean;
    weeklyReports: boolean;
    autoReject: boolean;
    passingScore: number;
    timeLimit: number;
}

export interface Experience {
  jobTitle: string;
  company: string;
  duration: string;
  responsibilities: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

export interface RoadmapStep {
  title: string;
  description: string;
  duration: string;
  resources: string[];
}

export interface CareerRoadmap {
  targetRole: string;
  skillGaps: string[];
  shortTermPlan: RoadmapStep[];
  longTermPlan: RoadmapStep[];
}

export interface InterviewQuestion {
    id: number;
    question: string;
}

export interface InterviewFeedback {
    score: number;
    evaluation: {
        clarity: string;
        relevance: string;
        structure: string;
        confidence: string;
    };
    grammarCorrection: {
        hasErrors: boolean;
        explanation: string;
    };
    professionalRewrite: string;
    tips: string[];
    alexisResponse: string;
    // New fields for detailed transcript analysis
    wordCount: number;
    fillerWords: number;
    hasExample: boolean;
    responseQuality: number; // A percentage score from 0-100 for this specific answer
}


export interface InterviewSummary {
    overallSummary: string;
    actionableTips: string[];
    encouragement: string;
    simulatedFacialExpressionAnalysis: string;
    simulatedBodyLanguageAnalysis: string;
    simulatedAudioAnalysis: string;
}

export interface InterviewConfig {
    type: 'Behavioral' | 'Technical' | 'Role-Specific';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    persona: 'Neutral' | 'Friendly' | 'Strict';
    role: string;
}

export interface TranscriptEntry {
    question: string;
    answer: string;
    feedback: InterviewFeedback;
}

export interface InterviewSession {
    date: string;
    type: string;
    duration: number; // in minutes
    averageScore: number;
    config: InterviewConfig;
    transcript: TranscriptEntry[];
    summary: InterviewSummary;
}


export interface MockCandidate {
    id: string;
    name: string;
    role: string;
    readiness: number;
    confidence: number;
    report: ResumeData;
}

export interface Assessment {
    id: string;
    jobRole: string;
    createdBy: string; // recruiter email
    createdAt: string; // ISO date string
    config: Omit<InterviewConfig, 'role'>;
    questions: string[];
}

export interface AssessmentResult {
    id: string;
    assessmentId: string;
    candidateName: string;
    candidateEmail: string;
    completedAt: string; // ISO date string
    session: InterviewSession;
}
