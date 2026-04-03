import React, { useState, useEffect } from 'react';
import api from '../api';
import { Calendar, AlertTriangle, Layers, Maximize } from 'lucide-react';

const Schedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [judges, setJudges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [algoStats, setAlgoStats] = useState(null);

    const generateSchedule = () => {
        setLoading(true);
        setMessage('Executing Schedule OS Balancer...');
        api.post('/generate-schedule')
            .then(res => {
                setSchedule(res.data.schedule);
                setJudges(res.data.judges);
                setAlgoStats(res.data.algoStats);
                setMessage('Load Balanced Schedule Successfully Generated');
            })
            .catch(err => {
                console.error(err);
                setMessage('Error OS Balancer');
            })
            .finally(() => setLoading(false));
    };

    const simulateInterrupt = (judge_id) => {
        setLoading(true);
        api.post('/simulate-interrupt', { judge_id })
            .then(res => {
                setMessage(res.data.message);
                // Immediately regenerate the schedule after interrupt to show redistribution
                generateSchedule();
            })
            .catch(err => {
                console.error(err);
                setMessage('Interrupt simulation failed');
                setLoading(false);
            });
    };

    // Group schedule by judge
    const scheduleByJudge = {};
    if (judges && judges.length > 0) {
        judges.forEach(j => {
            scheduleByJudge[j.name] = schedule.filter(s => s.judge_id === j.id);
        });
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="card-title" style={{ margin: 0 }}>Case Allocator Engine</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={generateSchedule} className="btn btn-accent" disabled={loading}>
                        <Layers size={16} /> Compute Load Balancing
                    </button>
                    <button onClick={() => window.print()} className="btn"><Maximize size={16} /> Export PDF</button>
                </div>
            </div>

            {algoStats && (
                <div className="card" style={{ background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)', color: '#fff', border: '1px solid var(--color-gold)' }}>
                    <h3 className="card-title" style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Maximize size={20} /> Analysis of Algorithm (AoA) Report
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '1rem' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0aec0' }}>Algorithm Strategy</p>
                            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>{algoStats.type || "Greedy Strategy"}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0aec0' }}>Time Complexity</p>
                            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', color: '#4fd1c5' }}>{algoStats.complexity}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0aec0' }}>Execution Time</p>
                            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>{algoStats.time} ms</p>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0aec0' }}>Total Operations</p>
                            <p style={{ margin: '5px 0 0 0', fontWeight: 'bold' }}>{algoStats.totalOps} Ops</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.85rem', color: '#cbd5e0' }}>
                        <strong>Explanation:</strong> This algorithm uses a <strong>Greedy Choice</strong> by assigning each case to the judge with the current minimum workload. The total complexity is <strong>O(N log N)</strong> due to the sorting of cases by priority, which ensures the most critical cases are processed first.
                    </div>
                </div>
            )}

            {message && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#e2e8f0', color: '#2d3748', borderRadius: '4px', fontWeight: 'bold' }}>
                    {message}
                </div>
            )}

            <div className="card">
                <h3 className="card-title"><AlertTriangle size={18} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#e53e3e' }} /> Simulate OS Interrupt</h3>
                <p>Clicking below simulates a hardware interrupt (Judge Absence) and triggers the Context Switch to reschedule queues dynamically among remaining judges.</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', flexWrap: 'wrap' }}>
                    {judges.map(j => (
                        <button key={j.id} onClick={() => simulateInterrupt(j.id)} className="btn btn-danger" style={{ background: '#e53e3e' }}>
                            Interrupt: {j.name}
                        </button>
                    ))}
                    {judges.length === 0 && <span style={{ color: '#718096' }}>No judges actively loaded. Please generate schedule first.</span>}
                </div>
            </div>

            <div className="card" id="schedule-print">
                <h3 className="card-title">Daily Optimized Schedule by Judge</h3>

                {Object.keys(scheduleByJudge).length > 0 ? (
                    Object.keys(scheduleByJudge).map(judgeName => (
                        <div key={judgeName} style={{ marginBottom: '2rem' }}>
                            <h4 style={{ background: 'var(--color-primary-dark)', color: '#fff', padding: '0.75rem', borderRadius: '4px 4px 0 0', margin: 0, borderBottom: '2px solid var(--color-gold)' }}>
                                {judgeName} Queue ({scheduleByJudge[judgeName].length} cases load)
                            </h4>
                            <table style={{ border: '1px solid #e2e8f0', borderTop: 'none' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '80px', background: 'var(--color-primary-hover)', color: '#fff' }}>Slot</th>
                                        <th style={{ background: 'var(--color-primary-hover)', color: '#fff' }}>Case ID</th>
                                        <th style={{ background: 'var(--color-primary-hover)', color: '#fff' }}>Type</th>
                                        <th style={{ background: 'var(--color-primary-hover)', color: '#fff' }}>Priority (CPU Weight)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scheduleByJudge[judgeName].length > 0 ? scheduleByJudge[judgeName].map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: 'bold' }}>Slot {c.slot}</td>
                                            <td>{c.case_id}</td>
                                            <td>{c.case_type}</td>
                                            <td style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>{c.priority !== null ? Number(c.priority).toFixed(2) : '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', color: '#718096' }}>No cases assigned</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#4a5568', background: '#f8fafc', borderRadius: '4px', border: '1px dashed #cbd5e0' }}>
                        Click 'Compute Load Balancing' to run algorithm.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;
