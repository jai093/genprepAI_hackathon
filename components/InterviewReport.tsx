

import React, { useState } from 'react';
// FIX: Use named import for react-router-dom v6.
import { useNavigate } from 'react-router-dom';
import { getFollowUpAnswer } from '../services/geminiService';
import Spinner from './Spinner';
import { Star, FileText, XCircle, Smile, User, Mic, Bot, CheckCircle } from 'lucide-react';
import type { InterviewSession } from '../types';

interface InterviewReportProps {
    session: InterviewSession;
    showChat?: boolean;
    onRestart?: () => void;
    backPath?: string; // Path to go back to, e.g., dashboard
    backButtonText?: string;
}

const InterviewReport: React.FC<InterviewReportProps> = ({ 
    session, 
    showChat = false, 
    onRestart,
    backPath,
    backButtonText = 'Back to Dashboard'
}) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
    const [questionInput, setQuestionInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ type: 'user' | 'ai'; text: string }[]>([]);
    const [isAsking, setIsAsking] = useState(false);

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!questionInput.trim() || isAsking) return;
    
        const currentQuestion = questionInput.trim();
        setQuestionInput('');
        setIsAsking(true);
        setChatHistory(prev => [...prev, { type: 'user', text: currentQuestion }]);
        
        try {
            const answer = await getFollowUpAnswer(session, currentQuestion);
            setChatHistory(prev => [...prev, { type: 'ai', text: answer }]);
        } catch (error) {
            console.error("Error getting follow-up answer:", error);
            setChatHistory(prev => [...prev, { type: 'ai', text: "Sorry, I encountered an issue trying to answer that. Please try again." }]);
        } finally {
            setIsAsking(false);
        }
    }
    
    const handleBack = () => {
        if(backPath) {
            navigate(backPath);
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-8 space-y-6 border border-slate-200 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Interview Report</h1>
                    <p className="text-slate-500 mt-1">{session.config.role} - {session.type.split(' - ')[0]}</p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                     <p className="font-semibold text-slate-500">Overall Score</p>
                     <p className={`font-bold text-4xl sm:text-5xl ${session.averageScore >= 80 ? 'text-green-500' : session.averageScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>{session.averageScore}%</p>
                </div>
            </div>

            <div className="flex border-b">
                <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 font-semibold text-sm sm:text-base ${activeTab === 'summary' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}>Summary</button>
                <button onClick={() => setActiveTab('transcript')} className={`px-4 py-2 font-semibold text-sm sm:text-base ${activeTab === 'transcript' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}>Full Transcript</button>
            </div>
            
            {activeTab === 'summary' && (
                <div className="animate-fade-in-fast space-y-6">
                    <p className="text-slate-600">{session.summary.overallSummary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <h3 className="font-semibold text-slate-700 flex items-center mb-2"><Star size={18} className="mr-2 text-yellow-500" />Top Action Items</h3>
                            <ul className="text-sm space-y-2 list-disc list-inside text-slate-600 bg-slate-50 p-4 rounded-lg">
                                {session.summary.actionableTips.map((tip, i) => <li key={i}>{tip}</li>)}
                            </ul>
                       </div>
                       <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-slate-700 flex items-center mb-2"><Smile size={18} className="mr-2 text-blue-500" />Facial Expression (Simulated)</h3>
                                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">{session.summary.simulatedFacialExpressionAnalysis}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700 flex items-center mb-2"><User size={18} className="mr-2 text-teal-500" />Body Language (Simulated)</h3>
                                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">{session.summary.simulatedBodyLanguageAnalysis}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700 flex items-center mb-2"><Mic size={18} className="mr-2 text-purple-500" />Tone & Pace (Simulated)</h3>
                                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">{session.summary.simulatedAudioAnalysis}</p>
                            </div>
                       </div>
                    </div>
                     <p className="font-semibold text-indigo-700 pt-4 border-t">{session.summary.encouragement}</p>
                </div>
            )}
            
            {activeTab === 'transcript' && (
                 <div className="animate-fade-in-fast space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {session.transcript.map((entry, index) => (
                        <div key={index} className="p-4 rounded-lg bg-slate-50">
                            <p className="font-semibold text-indigo-700">Q: {entry.question}</p>
                            <p className="text-slate-800 my-2 italic">A: "{entry.answer}"</p>
                            <div className="flex flex-wrap items-center justify-between mt-2 p-3 bg-white rounded-md border text-sm gap-2">
                                <div className="flex items-center flex-wrap gap-4">
                                     <div><strong>Quality:</strong> <span className="font-bold">{entry.feedback.responseQuality}%</span></div>
                                     <div><strong>Words:</strong> {entry.feedback.wordCount}</div>
                                     <div><strong>Fillers:</strong> {entry.feedback.fillerWords}</div>
                                     <div><strong>Example:</strong> {entry.feedback.hasExample ? <CheckCircle size={16} className="inline text-green-500"/> : <XCircle size={16} className="inline text-red-500"/>}</div>
                                </div>
                                <details className="text-indigo-600 cursor-pointer relative">
                                    <summary className="font-semibold">Show Analysis</summary>
                                    <div className="absolute right-0 z-10 mt-2 w-80 p-4 bg-white rounded-lg shadow-lg border text-slate-600 text-xs text-left">
                                        <p><strong>Clarity:</strong> {entry.feedback.evaluation.clarity}</p>
                                        <p><strong>Relevance:</strong> {entry.feedback.evaluation.relevance}</p>
                                        <p><strong>Structure:</strong> {entry.feedback.evaluation.structure}</p>
                                    </div>
                                </details>
                            </div>
                        </div>
                    ))}
                 </div>
            )}

            {showChat && (
                <div className="mt-6 pt-6 border-t">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Ask a Follow-up Question</h3>
                    <div className="bg-slate-50 p-4 rounded-lg h-64 overflow-y-auto flex flex-col space-y-4">
                        {chatHistory.length === 0 && (
                            <div className="m-auto text-center text-slate-500">
                                <p>Have questions about your feedback?</p>
                                <p className="text-sm">Ask Alexis for clarification, e.g., "How can I improve my STAR method usage?"</p>
                            </div>
                        )}
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-md p-3 rounded-lg ${chat.type === 'user' ? 'bg-indigo-500 text-white' : 'bg-white text-slate-700 border'}`}>
                                    <p className="text-sm">{chat.text}</p>
                                </div>
                            </div>
                        ))}
                        {isAsking && (
                            <div className="flex justify-start">
                                <div className="max-w-md p-3 rounded-lg bg-white text-slate-700 border">
                                    <Spinner />
                                </div>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleAskQuestion} className="mt-4 flex gap-2">
                        <input
                            type="text"
                            value={questionInput}
                            onChange={(e) => setQuestionInput(e.target.value)}
                            placeholder="Ask Alexis a question..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={isAsking}
                        />
                        <button
                            type="submit"
                            disabled={isAsking || !questionInput.trim()}
                            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition flex items-center"
                        >
                            Ask
                        </button>
                    </form>
                </div>
            )}
            
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-4 border-t">
                {onRestart && <button onClick={onRestart} className="w-full sm:w-auto px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition">Practice Again</button>}
                {backPath && <button onClick={handleBack} className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">{backButtonText}</button>}
            </div>
        </div>
    );
}

export default InterviewReport;