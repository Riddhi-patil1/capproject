import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { Scale, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegistering) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate('/');
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <Scale size={48} className="login-logo" />
                    <h1>JusticeOS</h1>
                    <p>Enter your credentials to access the judicial system</p>
                </div>

                <form onSubmit={handleAuth} className="login-form">
                    {error && <div className="error-alert">{error}</div>}
                    
                    <div className="input-group">
                        <Mail className="input-icon" size={18} />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={18} />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn">
                        {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                        {isRegistering ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div className="login-divider">
                    <span>OR</span>
                </div>

                <button onClick={handleGoogleSignIn} className="google-btn">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
                    Sign in with Google
                </button>

                <div className="login-footer">
                    <button onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                    </button>
                </div>
            </div>

            <style>{`
                .login-page {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    color: #1e293b;
                }
                .login-card {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 16px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                }
                .login-logo {
                    color: #6366f1;
                    margin-bottom: 1rem;
                }
                .login-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                }
                .login-header p {
                    color: #64748b;
                    font-size: 0.875rem;
                    margin-bottom: 2rem;
                }
                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 12px;
                    color: #94a3b8;
                }
                .input-group input {
                    width: 100%;
                    padding: 12px 12px 12px 40px;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    transition: border-color 0.2s;
                }
                .input-group input:focus {
                    outline: none;
                    border-color: #6366f1;
                    ring: 2px solid #6366f1;
                }
                .login-btn {
                    padding: 12px;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .login-btn:hover {
                    background: #4f46e5;
                }
                .error-alert {
                    padding: 10px;
                    background: #fee2e2;
                    color: #b91c1c;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    margin-bottom: 0.5rem;
                    text-align: left;
                }
                .login-divider {
                    margin: 1.5rem 0;
                    position: relative;
                    text-align: center;
                }
                .login-divider::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    width: 100%;
                    height: 1px;
                    background: #e2e8f0;
                    z-index: 0;
                }
                .login-divider span {
                    background: white;
                    padding: 0 10px;
                    color: #94a3b8;
                    font-size: 0.75rem;
                    position: relative;
                    z-index: 1;
                }
                .google-btn {
                    width: 100%;
                    padding: 10px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .google-btn:hover {
                    background: #f8fafc;
                }
                .login-footer {
                    margin-top: 1.5rem;
                }
                .login-footer button {
                    background: none;
                    border: none;
                    color: #6366f1;
                    font-size: 0.85rem;
                    cursor: pointer;
                    font-weight: 500;
                }
                .login-footer button:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default Login;
