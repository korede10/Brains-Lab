"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solveQuestion = void 0;
const solveQuestion = async (req, res) => {
    try {
        const { question, subject } = req.body;
        if (!question) {
            return res.status(400).json({ message: 'Question text is required' });
        }
        const apiKey = process.env.GEMINI_API_KEY;
        // Standard fallback response dataset if Gemini API Key is missing or query fails
        const localDatabaseFallback = () => {
            const qLower = question.toLowerCase();
            if (qLower.includes('velocity') || qLower.includes('acceleration') || qLower.includes('speed')) {
                return {
                    explanation: "This is a Mechanics problem related to Equations of Motion.",
                    steps: [
                        "Identify the given parameters: Initial velocity (u), Final velocity (v), Time (t), or Distance (s).",
                        "Apply the appropriate equation of motion: \n1. v = u + at \n2. s = ut + 0.5 * a * t^2 \n3. v^2 = u^2 + 2as",
                        "Substitute the values into the equation.",
                        "Solve algebraically to get the final answer with appropriate units (e.g., m/s or m/s²)."
                    ],
                    source: "Local Science Engine (WAEC/UTME Syllabus)"
                };
            }
            if (qLower.includes('gravity') || qLower.includes('force') || qLower.includes('mass')) {
                return {
                    explanation: "This relates to Newton's Laws of Motion and Gravitation.",
                    steps: [
                        "Recall Newton's Second Law: Force (F) = mass (m) × acceleration (a) [or acceleration due to gravity (g)].",
                        "Given: mass (m) or force (F). Note that weight W = mg, where g is approximately 10 m/s² for WAEC/UTME exams.",
                        "Plug the parameters in: F = m * g.",
                        "Formulate the final calculation to get force in Newtons (N) or mass in kilograms (kg)."
                    ],
                    source: "Local Science Engine (WAEC/UTME Syllabus)"
                };
            }
            if (qLower.includes('ph') || qLower.includes('acid') || qLower.includes('base') || qLower.includes('alkali')) {
                return {
                    explanation: "This is an Acid-Base Chemistry topic regarding pH and concentrations.",
                    steps: [
                        "pH is defined as the negative logarithm (base 10) of the hydrogen ion concentration: pH = -log10[H+].",
                        "For bases: pOH = -log10[OH-] and pH + pOH = 14.",
                        "Determine the [H+] or [OH-] molarity from the given problem.",
                        "Calculate using log rules. For example, if [H+] = 10^-3 M, then pH = 3 (acidic)."
                    ],
                    source: "Local Science Engine (WAEC/UTME Syllabus)"
                };
            }
            if (qLower.includes('photosynthesis') || qLower.includes('chlorophyll') || qLower.includes('light')) {
                return {
                    explanation: "This is a Plant Physiology question regarding photosynthesis.",
                    steps: [
                        "Photosynthesis equation: 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2.",
                        "Occurs in the chloroplast containing chlorophyll.",
                        "Light-dependent stage split water molecules into hydrogen ions and oxygen gas.",
                        "Light-independent stage (Calvin Cycle) fixes carbon dioxide into glucose molecules."
                    ],
                    source: "Local Science Engine (WAEC/UTME Syllabus)"
                };
            }
            // Default generic structured solution
            return {
                explanation: `Here is a step-by-step academic analysis for your question in ${subject || 'Science'}:`,
                steps: [
                    `Analyze the core parameters mentioned: "${question.length > 60 ? question.substring(0, 60) + '...' : question}"`,
                    "Break down the underlying scientific concepts and equations relevant to this topic.",
                    "Identify and map any formula constants (e.g. Planck's constant, universal gas constant, acceleration due to gravity).",
                    "Combine the terms to arrive at the correct conceptual explanation or mathematical value."
                ],
                source: "Local Science Engine (WAEC/UTME Syllabus)"
            };
        };
        if (!apiKey) {
            // Return local fallback immediately
            return res.json({
                solution: localDatabaseFallback(),
                success: true,
                mode: "Offline/Local Fallback Mode"
            });
        }
        // Attempt calling Gemini API using standard fetch (no external dependencies needed)
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `You are an expert WAEC and UTME science teacher. Solve this science question and output the response in clean JSON format matching this TypeScript interface:
                    interface Solution {
                      explanation: string; // Brief conceptual background
                      steps: string[];     // Array of step-by-step directions to solve the question
                      source: string;      // Set to "Gemini AI Assistant"
                    }
                    Provide steps clearly. Question: "${question}" in subject: "${subject || 'General Sciences'}". Return ONLY valid raw JSON, no markdown code block backticks.`
                                }
                            ]
                        }
                    ]
                })
            });
            const data = (await response.json());
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                // Strip markdown backticks if any
                const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(cleanedText);
                return res.json({
                    solution: parsed,
                    success: true,
                    mode: "Gemini AI"
                });
            }
            throw new Error("Invalid response from Gemini API");
        }
        catch (apiError) {
            // Fallback on API failure
            return res.json({
                solution: localDatabaseFallback(),
                success: true,
                mode: "API Offline Fallback"
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error processing question', error: error.message });
    }
};
exports.solveQuestion = solveQuestion;
