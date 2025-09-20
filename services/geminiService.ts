import { GoogleGenAI, Type } from "@google/genai";
import type { ResumeData, CareerRoadmap, InterviewFeedback, InterviewSummary, InterviewSession } from '../types';

// In a Vite project, environment variables must be prefixed with `VITE_` to be exposed to the client.
// They are accessed via `import.meta.env`.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  // This will stop the application from loading and provide a clear error.
  throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please create a .env.local file and add it.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-1.5-flash';

const resumeSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        summary: { type: Type.STRING, description: "A professional summary of 2-4 sentences." },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    jobTitle: { type: Type.STRING },
                    company: { type: Type.STRING },
                    duration: { type: Type.STRING, description: "e.g., 'Jan 2020 - Present'" },
                    responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['jobTitle', 'company', 'duration', 'responsibilities']
            }
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    year: { type: Type.STRING, description: "e.g., 'Graduated May 2018'" }
                },
                required: ['degree', 'institution', 'year']
            }
        }
    },
    required: ['name', 'email', 'phone', 'summary', 'skills', 'experience', 'education']
};


export const parseResume = async (resumeText: string): Promise<ResumeData> => {
    const prompt = `Analyze the following resume text. Your primary task is to extract all technical, soft, and other relevant skills mentioned. Populate the rest of the schema as accurately as possible. The 'skills' array should be a comprehensive list. Resume:\n\n${resumeText}`;
    
    const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: resumeSchema,
        },
    });
    const responseText = result.text;
    try {
        return JSON.parse(responseText) as ResumeData;
    } catch (e) {
        console.error("Failed to parse JSON from Gemini for parseResume:", responseText);
        throw new Error("The AI service returned an invalid response format.");
    }
};

const roadmapSchema = {
    type: Type.OBJECT,
    properties: {
        targetRole: { type: Type.STRING },
        skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
        shortTermPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['title', 'description', 'duration', 'resources']
            }
        },
        longTermPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['title', 'description', 'duration', 'resources']
            }
        }
    },
    required: ['targetRole', 'skillGaps', 'shortTermPlan', 'longTermPlan']
};

export const generateRoadmap = async (skills: string[], targetRole: string): Promise<CareerRoadmap> => {
    const prompt = `Act as an expert career coach. A candidate with the following skills: [${skills.join(', ')}] wants to become a "${targetRole}". 
Your task is to perform a detailed skill gap analysis. First, determine the essential skills required for the target role. Then, compare them to the candidate's current skills to identify what's missing. List these missing skills in the 'skillGaps' field. 
Based on these gaps, create a detailed short-term (1-3 months) and long-term (6-12 months) plan to acquire them. The plans should include specific topics, project ideas, and online resources.`;

    const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: roadmapSchema
        },
    });
    const responseText = result.text;
    try {
        return JSON.parse(responseText) as CareerRoadmap;
    } catch (e) {
        console.error("Failed to parse JSON from Gemini for generateRoadmap:", responseText);
        throw new Error("The AI service returned an invalid response format.");
    }
};


export const generateInterviewQuestions = async (resume: ResumeData, targetRole: string, linkedinUrl?: string): Promise<string[]> => {
    // Construct a concise summary of the candidate's experience for the prompt.
    const experienceSummary = resume.experience.map(exp => 
        `- ${exp.jobTitle} at ${exp.company} (${exp.duration})`
    ).join('\n');

    let prompt = `You are an expert interviewer hiring for a "${targetRole}" position. You must generate 5 challenging interview questions tailored to the candidate's background.

Candidate's Background:
- Role they are applying for: "${targetRole}"
- Key Skills: ${resume.skills.length > 0 ? `[${resume.skills.join(', ')}]` : 'Not specified.'}
- Professional Summary: "${resume.summary || 'Not provided.'}"
- Recent Experience:
${experienceSummary || 'No professional experience listed.'}
`;
    
    if (linkedinUrl) {
        prompt += `- LinkedIn Profile: ${linkedinUrl}\n`;
    }

    prompt += `\nInstructions:
1.  Generate exactly 5 questions.
`;

    if (resume.experience.length > 0 || resume.skills.length > 0) {
        prompt += `2.  Tailor at least 2-3 questions directly to the candidate's experience and skills (e.g., "Tell me about a project at ${resume.experience[0]?.company}" or "How did your experience with ${resume.skills[0]} help you?").\n`;
    } else {
        prompt += `2.  Since specific experience or skills are not listed, focus on hypothetical scenarios and general knowledge relevant to the "${targetRole}" role.\n`;
    }

    prompt += `3.  The questions should be a mix of behavioral and role-specific challenges.
4.  Ensure questions encourage STAR (Situation, Task, Action, Result) method responses.
5.  Return ONLY a JSON array of strings. Do not include any other text or explanation.`;

    const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
    });

    const responseText = result.text;
    try {
        return JSON.parse(responseText) as string[];
    } catch (e) {
        console.error("Failed to parse JSON from Gemini for generateInterviewQuestions:", responseText);
        throw new Error("The AI service returned an invalid response format.");
    }
};

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: "A numerical score from 0-100 for the answer, based on a strict evaluation." },
        responseQuality: { type: Type.NUMBER, description: "A score from 0-100 representing the quality of this specific answer for the transcript." },
        evaluation: {
            type: Type.OBJECT,
            properties: {
                clarity: { type: Type.STRING, description: "Brief, one-sentence feedback on clarity." },
                relevance: { type: Type.STRING, description: "Brief, one-sentence feedback on relevance." },
                structure: { type: Type.STRING, description: "Brief, one-sentence feedback on structure (e.g., STAR method)." },
                confidence: { type: Type.STRING, description: "Brief, one-sentence feedback on confidence inferred from the text." },
            },
            required: ['clarity', 'relevance', 'structure', 'confidence']
        },
        grammarCorrection: {
            type: Type.OBJECT,
            properties: {
                hasErrors: { type: Type.BOOLEAN, description: "True if grammatical errors or significant filler words were found." },
                explanation: { type: Type.STRING, description: "A brief explanation of any grammar mistake. Empty string if no errors." },
            },
            required: ['hasErrors', 'explanation']
        },
        professionalRewrite: { type: Type.STRING, description: "A rewritten, strong, and professional version of the candidate’s response." },
        tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array containing 1-2 actionable tips for improvement." },
        alexisResponse: { type: Type.STRING, description: "A friendly, conversational response from Alexis that summarizes the feedback. This is the text that will be spoken to the user." },
        wordCount: { type: Type.NUMBER, description: "The total number of words in the candidate's answer." },
        fillerWords: { type: Type.NUMBER, description: "The count of filler words like 'um', 'uh', 'like', 'you know', 'so'." },
        hasExample: { type: Type.BOOLEAN, description: "True if the candidate used a concrete example (e.g., mentioned a specific project, situation, or metric)." }
    },
    required: ['score', 'responseQuality', 'evaluation', 'grammarCorrection', 'professionalRewrite', 'tips', 'alexisResponse', 'wordCount', 'fillerWords', 'hasExample']
};


export const getInterviewFeedback = async (question: string, answer: string): Promise<InterviewFeedback> => {
    const prompt = `
# Persona: InterPrepAI Simulation Agent (Alexis)
You are Alexis, the AI agent for InterPrepAI, a smart, adaptive interview simulation platform. Your persona is a friendly, insightful, and encouraging AI career coach. You are conducting a mock interview with a candidate. Your goal is to provide precise, personalized feedback to help them improve.

# Task: Evaluate Interview Answer
You have just asked the candidate a question, and they have provided an answer. Your task is to analyze their answer and provide structured feedback in the specified JSON format.

# Evaluation Criteria
When evaluating, consider the following aspects of the candidate's response:
- **Clarity:** Is the response easy to understand and well-articulated?
- **Relevance:** Does the answer directly address the question?
- **Confidence:** Is the tone self-assured and composed? (Inferred from text)
- **Structure:** Is the response logically organized (e.g., using the STAR method: Situation, Task, Action, Result)?
- **Tone and Language:** Is the tone professional, friendly, and workplace-appropriate?
- **Example Usage:** Are concrete examples, stories, or data used to support the answer?
- **Problem Solving Ability:** Is there evidence of logical thinking and scenario-based reasoning?
- **Grammar & Vocabulary:** Assess for errors, filler words ('um', 'uh', 'like', 'so', 'you know'), and professional language.

# Feedback Rules
1.  **Analyze the answer** based on the comprehensive criteria above.
2.  **Score the answer:** Provide a strict \`score\` from 0-100 for overall performance and a separate \`responseQuality\` score for the transcript view, reflecting how well the answer met the criteria.
3.  **Provide detailed evaluation:** Fill in the \`evaluation\` object with concise, one-sentence feedback for each category.
4.  **Grammar Correction:** Identify errors and count filler words. Provide a professional rewrite of the answer that is strong and concise.
5.  **Craft Alexis's Response:** As Alexis, write a short, conversational, and encouraging spoken response (\`alexisResponse\`) that summarizes the key feedback points. This is what you will "say" to the candidate.

# Input
- Question: "${question}"
- Candidate's Answer: "${answer}"

# Output
Provide your analysis ONLY in the specified JSON format.
`;
    
    const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: feedbackSchema,
        },
    });

    const responseText = result.text;
    try {
        return JSON.parse(responseText) as InterviewFeedback;
    } catch (e) {
        console.error("Failed to parse JSON from Gemini for getInterviewFeedback:", responseText);
        throw new Error("The AI service returned an invalid response format.");
    }
};

const summarySchema = {
    type: Type.OBJECT,
    properties: {
        overallSummary: { type: Type.STRING, description: "A friendly, 2-3 sentence summary of the overall performance." },
        actionableTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-5 actionable tips for improvement." },
        encouragement: { type: Type.STRING, description: "A final, encouraging sentence." },
        simulatedFacialExpressionAnalysis: { type: Type.STRING, description: "A simulated, one-sentence analysis of facial expressions (e.g., 'You likely appeared focused and maintained good eye contact.') based on the confidence and quality of the text responses." },
        simulatedBodyLanguageAnalysis: { type: Type.STRING, description: "A simulated, one-sentence analysis of body language (e.g., 'Your posture probably came across as open and engaged.') based on the confidence and quality of the text responses." },
        simulatedAudioAnalysis: { type: Type.STRING, description: "A simulated, one-sentence analysis of vocal tone and pace based on the text responses (e.g., 'Your tone probably came across as steady and professional.')." }
    },
    required: ['overallSummary', 'actionableTips', 'encouragement', 'simulatedFacialExpressionAnalysis', 'simulatedBodyLanguageAnalysis', 'simulatedAudioAnalysis']
};

export const generateInterviewSummary = async (sessionFeedback: InterviewFeedback[]): Promise<InterviewSummary> => {
     const prompt = `
# Persona: InterPrepAI Simulation Agent (Alexis)
You are Alexis, the AI agent for InterPrepAI, a smart, adaptive interview simulation platform. Your persona is a friendly, insightful, and encouraging AI career coach.

# Task: Summarize Interview Performance
The mock interview is complete. Your task is to provide a final summary based on the entire session's performance, using the provided feedback data.

# Summary Rules
1.  **Overall Summary:** Write a friendly, 2-3 sentence summary of the overall performance, mentioning both strengths and key areas for practice.
2.  **Actionable Tips:** Provide a list of 3-5 concrete, actionable tips for improvement based on recurring patterns in the feedback.
3.  **Simulate Non-Verbal Analysis:** This is a key feature. Based on the confidence and quality of the text responses throughout the session, provide brief, *hypothetical* and encouraging analyses for:
    - **simulatedFacialExpressionAnalysis:** What could be inferred about their facial expressions? (e.g., "Based on your confident answers, you likely maintained a friendly and engaged expression.")
    - **simulatedBodyLanguageAnalysis:** What could be inferred about their body language? (e.g., "Your detailed responses suggest you were likely sitting upright and maintained an open posture.")
    - **simulatedAudioAnalysis:** What could be inferred about their vocal tone and pace? (e.g., "Your tone probably came across as steady and professional.")
4.  **Encouragement:** End with a final, positive, and encouraging sentence to motivate the candidate.

# Input
- An array of all feedback given during the session: ${JSON.stringify(sessionFeedback.map(f => ({score: f.score, tips: f.tips, evaluation: f.evaluation, responseQuality: f.responseQuality})))}

# Output
Provide your summary ONLY in the specified JSON format.
`;

    const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: summarySchema,
        },
    });

    const responseText = result.text;
    try {
        return JSON.parse(responseText) as InterviewSummary;
    } catch (e) {
        console.error("Failed to parse JSON from Gemini for generateInterviewSummary:", responseText);
        throw new Error("The AI service returned an invalid response format.");
    }
}

export const getFollowUpAnswer = async (session: InterviewSession, userQuestion: string): Promise<string> => {
    // A concise summary of transcript for the prompt
    const transcriptSummary = session.transcript.map(t => ({
        question: t.question,
        answer: t.answer.substring(0, 100) + '...', // Truncate answer to keep prompt lighter
        score: t.feedback.score,
        feedbackSummary: t.feedback.evaluation.structure
    }));

    const prompt = `
# Persona: InterPrepAI Simulation Agent (Alexis)
You are Alexis from InterPrepAI, a friendly, insightful, and encouraging AI career coach. You are having a follow-up conversation with a candidate right after they completed a mock interview. Your tone is conversational and helpful.

# Context: Interview Data
Here is the data from the interview session you just conducted:
- Job Role: ${session.config.role}
- Overall Score: ${session.averageScore}%
- Your Final Summary: ${session.summary.overallSummary}
- Your Main Tips: ${session.summary.actionableTips.join('; ')}
- Transcript Snippets & Feedback: ${JSON.stringify(transcriptSummary)}

# Task: Answer the Candidate's Question
The candidate has a follow-up question. Provide a helpful, concise, and encouraging answer based *primarily* on the interview context provided. If the question is general (e.g., "how can I get better at interviews?"), use the context to make your answer specific to their performance. Do not make up new feedback. Your goal is to clarify and elaborate on the existing report. Do not return JSON. Return only the text of your answer. Keep your response to 2-4 sentences.

# Candidate's Question:
"${userQuestion}"

# Your Answer (as Alexis):
`;

    const result = await ai.models.generateContent({
        model,
        contents: prompt,
    });

    return result.text;
}

export const generateAssessmentQuestions = async (
  jobRole: string,
  interviewType: 'Behavioral' | 'Technical' | 'Role-Specific',
  difficulty: 'Easy' | 'Medium' | 'Hard',
  numberOfQuestions: number = 5
): Promise<string[]> => {
  const prompt = `
    You are an expert HR professional and hiring manager responsible for creating interview assessments.
    Your task is to generate ${numberOfQuestions} high-quality interview questions for a candidate applying for the role of "${jobRole}".

    The assessment details are as follows:
    - Interview Type: ${interviewType}
    - Difficulty Level: ${difficulty}

    Instructions:
    1. Generate exactly ${numberOfQuestions} questions.
    2. The questions must be appropriate for the specified interview type and difficulty.
    3. For 'Technical' or 'Role-Specific' types, ensure the questions are relevant to the skills and responsibilities of a "${jobRole}".
    4. For 'Behavioral' types, the questions should probe for competencies relevant to a "${jobRole}".
    5. The questions should be clear, concise, and open-ended.
    6. Return ONLY a JSON array of strings. Do not include any other text, markdown, or explanation.
  `;

  const result = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  const responseText = result.text;
  try {
      return JSON.parse(responseText) as string[];
  } catch (e) {
      console.error("Failed to parse JSON from Gemini for generateAssessmentQuestions:", responseText);
      throw new Error("The AI service returned an invalid response format.");
  }
};
