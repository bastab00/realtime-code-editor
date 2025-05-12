import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

import '../styles/editorpage.css';

import executeCode from '../executeCode';


import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript'); // Default to JavaScript

        // Handle language change
        const handleLanguageChange = (event) => {
            setSelectedLanguage(event.target.value);
        };



        const handleRunCode = async () => {
            const code = codeRef.current?.getValue();  // ⬅️ Try using getValue()
            
            if (!code || code.trim() === "") {
                toast.error('No code to execute');
                console.log("⚠️ No code found in editor");
                return;
            }
        
            console.log("🚀 Running Code:", code);  // ✅ Check if the code is being read
        
            try {
                const output = await executeCode(selectedLanguage, code);
                toast.success('Execution successful');
                console.log('✅ Output:', output);
            } catch (error) {
                toast.error('Execution failed');
                console.error("❌ Execution error:", error);
            }
        };
        
        


    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }


    const runCode = async () => {
        const API_URL = "https://judge0-ce.p.rapidapi.com/submissions";
        const API_KEY = "3a3dad9a2emsh4bda3e0060cc811p18cd00jsnfc5879ad7c73"; // Replace with your actual API key
    
        const languageMap = {
            javascript: 63,  // JavaScript (Node.js)
            python: 71,      // Python 3
            cpp: 54,         // C++
            java: 62         // Java
        };
    
        const submissionData = {
            source_code: codeRef.current,
            language_id: languageMap[selectedLanguage],
            stdin: "", 
        };
    
        try {
            const response = await fetch(`${API_URL}?base64_encoded=false&wait=true`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Key": API_KEY,
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
                },
                body: JSON.stringify(submissionData),
            });
    
            const result = await response.json();
            if (result.stdout) {
                toast.success("Code executed successfully!");
                console.log("Output:", result.stdout);
            } else {
                toast.error("Execution failed: " + result.stderr);
                console.error("Error:", result.stderr);
            }
        } catch (error) {
            toast.error("Error executing code.");
            console.error("Execution Error:", error);
        }
    };
    


    return (
        <div className="editorPageWrapper">
            <div className="sidebar">
                <div className="logo">
                    <img
                        className="logoImage"
                        src="/void-merge.png"
                        alt="logo"
                    />
                </div>
                <div className="connectedUsers">
                    <h3>Connected</h3>
                    <div className="userList">
                        {clients.map((client) => (
                            <div key={client.socketId} className="userItem">
                                <Client username={client.username} />
                            </div>
                        ))}
                    </div>
                </div>
                <button className="copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
                {/* Language Selector Dropdown */}
                <div className="languageSelector">
                    <label htmlFor="language">Language: </label>
                    <select id="language" value={selectedLanguage} onChange={handleLanguageChange}>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                    </select>
                </div>


                {/* Run Button */}
                <button className="runBtn" onClick={(handleRunCode) => console.log("Run Code Button Clicked")}>
                    Run Code
                </button>



            </div>
            <div className="editorWrapper">
                <Editor 
                    socketRef={socketRef} 
                    roomId={roomId} 
                    onCodeChange={(code) => { codeRef.current = code; }}
                    language={selectedLanguage} 
                />

            </div>
        </div>
    );
};

export default EditorPage;
