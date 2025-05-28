import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const [mouseX, setMouseX] = useState(window.innerWidth / 2);
    const [mouseY, setMouseY] = useState(window.innerHeight / 2);
    const [time, setTime] = useState(0);

    const requestRef = useRef();

    // Generate Room ID
    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success(`Created a new room: ${id}`);

        // Manually update the input field to reflect the change immediately
        setTimeout(() => {
            document.getElementById('roomInput').value = id;
        }, 0);
    };

    // Join Room
    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & Username are required');
            return;
        }
        navigate(`/editor/${roomId}`, { state: { username } });
    };

    // Enter Key Event
    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };

    // Animated Background Effect
    useEffect(() => {
        let targetX = mouseX, targetY = mouseY;
        let currentX = targetX, currentY = targetY;
        let velocityX = 0, velocityY = 0;

        const handleMouseMove = (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        };

        const animateGlow = () => {
            velocityX += (targetX - currentX) * 0.08;
            velocityY += (targetY - currentY) * 0.08;

            currentX += velocityX * 0.08;
            currentY += velocityY * 0.08;

            velocityX *= 0.75;
            velocityY *= 0.75;

            setMouseX(currentX);
            setMouseY(currentY);
            setTime((prev) => prev + 0.015);

            requestRef.current = requestAnimationFrame(animateGlow);
        };

        window.addEventListener('mousemove', handleMouseMove);
        requestRef.current = requestAnimationFrame(animateGlow);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div
            className="homePageWrapper"
            style={{
                background: `
                radial-gradient(
                    800px at ${mouseX + Math.sin(time) * 40}px ${mouseY + Math.cos(time) * 40}px,
                    rgba(50, 100, 200, 0.18),
                    rgba(10, 15, 35, 0.95)
                ),
                radial-gradient(
                    700px at ${mouseX + Math.cos(time * 2) * 60}px ${mouseY + Math.sin(time * 2) * 60}px,
                    rgba(40, 90, 190, 0.15),
                    rgba(10, 15, 35, 0.92)
                ),
                radial-gradient(
                    600px at ${mouseX + Math.sin(time * 1.2) * 100}px ${mouseY + Math.cos(time * 1.2) * 100}px,
                    rgba(30, 70, 160, 0.12),
                    rgba(10, 15, 35, 0.9)
                ),
                linear-gradient(135deg, #0a0f23, #0d162f)
                `,
                transition: 'background 0.05s ease-out',
            }}
        >
            <div className="formWrapper">
                <img
                    className="homePageLogo"
                    src="/void-merge.png"
                    alt="void-merge-logo"
                />
                <h4 className="mainLabel">Enter The Collaboration Matrix</h4>
                <div className="inputGroup">
                    <input
                        id="roomInput"
                        type="text"
                        className="inputBox"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join
                    </button>
                    <span className="createInfo">
                        If you don't have an invite then create &nbsp;
                        <a
                            onClick={createNewRoom}
                            href="#"
                            className="createNewBtn"
                        >
                            new room
                        </a>
                    </span>
                </div>
            </div>
            <footer>
                <h4>
                    Built with ☮️ by &nbsp;
                    <a href="" target="_blank" rel="noopener noreferrer">
                        Bastab, Lakhya, Premila
                    </a>
                </h4>
            </footer>
        </div>
    );
};

export default Home;
