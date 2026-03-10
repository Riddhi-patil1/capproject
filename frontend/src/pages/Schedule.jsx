import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, AlertTriangle, Layers, Maximize } from 'lucide-react';

const Schedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [judges, setJudges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const generateSchedule = () => {
        setLoading(true);
        setMessage('Executing Schedule OS Balancer...');
        axios.post('http://localhost:5000/generate-schedule')
            .then(res => {
                setSchedule(res.data.schedule);
                setJudges(res.data.judges);
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
        axios.post('http://localhost:5000/simulate-interrupt', { judge_id })
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
