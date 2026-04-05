import React, { useEffect, useState } from 'react';
import api from '../api';
import { Calendar, Play, UserMinus, AlertTriangle, TrendingUp, Info } from 'lucide-react';

const Schedule = () => {
    const [schedule, setSchedule] = useState([]);
    const [judges, setJudges] = useState([]);
    const [stats, setStats] = useState(null);
    const [latestInterrupt, setLatestInterrupt] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const jRes = await api.get('/judges');
            setJudges(jRes.data);
            
            const cRes = await api.get('/cases');
            setSchedule(cRes.data.filter(c => c.status === 'Scheduled'));
        } catch (err) {
            console.error("Error fetching schedule data:", err);
        }
    };

    const handleGenerate = async () => {
        try {
            const res = await api.post('/generate-schedule');
            setSchedule(res.data.schedule);
            setJudges(res.data.judges);
            setStats(res.data.algoStats);
        } catch (err) {
            console.error("Error generating schedule:", err);
        }
    };

    const handleInterrupt = async (id) => {
        if (!window.confirm('Mark this judge as unavailable and reassign pending cases?')) return;
        try {
            const res = await api.post('/simulate-interrupt', { judge_id: id });
            setLatestInterrupt(res.data);
            fetchData();
        } catch (err) {
            console.error("Error interrupting judge:", err);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="card-title" style={{ margin: 0 }}>Smart Judicial Scheduling Engine</h2>
                <button onClick={handleGenerate} className="btn btn-accent"><Play size={18} /> Execute Algorithm</button>
            </div>

            <div className="dashboard-grid">
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 className="card-title">Live Judicial Assignment Queue</h3>
                    <table className="case-table">
                        <thead>
                            <tr>
                                <th>Case ID</th>
                                <th>Case Type</th>
                                <th>Priority</th>
                                <th>Assigned Judge</th>
                                <th>Match Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.map((c, i) => (
                                <tr key={i}>
                                    <td><strong>{c.case_id}</strong></td>
                                    <td><span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>{c.case_type}</span></td>
                                    <td>{c.priority}</td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{c.judge_name || 'Unassigned'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Slot #{c.slot}</div>
                                    </td>
                                    <td style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '250px' }}>
                                        {c.reason || 'Optimal Load Balance'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {schedule.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                            <p>No active assignments. Execute the algorithm to schedule cases.</p>
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3 className="card-title">Judge Roster & Specialization</h3>
                    <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                        {judges.map((j) => (
                            <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f1f5f9', opacity: j.status === 'Inactive' ? 0.5 : 1 }}>
                                <div>
                                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {j.name}
                                        {j.status === 'Active' ? <div style={{width:8,height:8,borderRadius:'50%',background:'#10b981'}}></div> : <div style={{width:8,height:8,borderRadius:'50%',background:'#ef4444'}}></div>}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '500' }}>{j.specialization} Specialization</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Workload: {j.workload} active cases</div>
                                </div>
                                {j.status === 'Active' && (
                                    <button onClick={() => handleInterrupt(j.id)} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                                        <UserMinus size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {stats && (
                <div className="card" style={{ marginTop: '2rem', border: '1px solid #e2e8f0' }}>
                    <h3 className="card-title">Engine Performance Report</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '2rem' }}>
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '4px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Execution Time</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{stats.time} ms</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '4px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Operations</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{stats.totalOps}</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '4px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Comparisons</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{stats.comparisons}</div>
                        </div>
                        <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '4px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Assignments</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{stats.assignments}</div>
                        </div>
                    </div>

                    <h3 className="card-title">Load Imbalance Metric</h3>
                    <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Imbalance Score (Max-Min Load)</div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444' }}>{stats.imbalance}</div>
                        </div>
                        <div style={{ display: 'flex', flexGrow: 1, gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Max Load: {stats.maxLoad}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Min Load: {stats.minLoad}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Avg Load: {stats.avgLoad}</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span className={`badge ${stats.imbalanceStatus === 'Excellent Balance' ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '1rem', padding: '10px 20px', textAlign: 'center' }}>
                                    {stats.imbalanceStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {latestInterrupt && (
                <div style={{ marginTop: '2rem', background: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '1.5rem', borderRadius: '8px', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <AlertTriangle size={32} />
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Judge Unavailable. Pending cases redistributed.</div>
                        <div style={{ fontSize: '0.9rem' }}>
                            Previous workload: {latestInterrupt.reassigned} | Reassigned Successfully: {latestInterrupt.reassigned}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;
