import { useState } from "react";
import axios from "axios";

import '../style/aichatbot.css'
function App() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [generatingAnswer, setGeneratingAnswer] = useState(false);

    async function generateAnswer(e) {
        setGeneratingAnswer(true);
        e.preventDefault();
        setAnswer("Loading your answer... It might take up to 10 seconds.");
        try {
            const response = await axios({
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBXrYBO2lEP2ZSV-apw7B4dk09HVSD7OwI`,
                method: "post",
                data: {
                    contents: [{ parts: [{ text: question }] }],
                },
            });

            setAnswer(
                response.data.candidates[0].content.parts[0].text
            );
            console.log(response)
        } catch (error) {
            console.log(error);
            setAnswer("Sorry - Something went wrong. Please try again!");
        }
        setGeneratingAnswer(false);
    }

    return (
        <div className="app-container">
            <form onSubmit={generateAnswer} className="question-form">
                <h1 className="title">Chat AI</h1>
                <textarea
                    required
                    className="question-input"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask anything..."
                />
                <button
                    type="submit"
                    className={`submit-button`}
                    disabled={generatingAnswer}
                >
                    {generatingAnswer ? "Generating..." : "Generate Answer"}
                </button>
            </form>
            <div className="answer-container">
                <pre className="answer-output">{answer}</pre>
            </div>
        </div>
    );
}

export default App;
