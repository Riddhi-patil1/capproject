import React, { useEffect, useState } from 'react';
import api from '../api';
import { Trash2, TrendingUp, Info, Clock, AlertCircle } from 'lucide-react';

const CaseList = () => {
    const [cases, setCases] = useState([]);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const res = await api.get('/cases');
            setCases(res.data);
        } catch (err) {
            console.error("Error fetching cases:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this case?')) return;
        try {
            await api.post('/delete-case', { id });
            fetchCases();
        } catch (err) {
            console.error("Error deleting case:", err);
        }
    };

    return (
        <div>
            <h2 className="card-title">Case Registry & Analysis</h2>

            <div className="card">
                <table className="case-table">
                    <thead>
                        <tr>
                            <th>Case Reference</th>
                            <th>Filing Date</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Priority Score</th>
                            <th>Breakedown Metrics</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cases.map((c) => (
                            <tr key={c.id}>
                                <td>
                                    <div style={{ fontWeight: '600' }}>{c.case_id}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.id}</div>
                                </td>
                                <td>{c.filing_date}</td>
                                <td><span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>{c.case_type}</span></td>
                                <td>
                                    <span className={`badge ${c.status === 'Scheduled' ? 'badge-success' : 'badge-pending'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <TrendingUp size={16} color="#6366f1" />
                                        <strong style={{ fontSize: '1.1rem' }}>{c.priority}</strong>
                                    </div>
                                    {c.aging_points > 0 && (
                                        <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: '500', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <Clock size={10} /> +{c.aging_points} Aging points added
                                        </div>
                                    )}
                                </td>
                                <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                        <div>Urgency: {c.urgency_score}</div>
                                        <div>Wait: {c.waiting_time_score}</div>
                                        <div>Special: {c.special_condition_score}</div>
                                        <div>Aging: {c.aging_points}</div>
                                    </div>
                                    {c.aging_points >= 4 && (
                                        <div style={{ marginTop: '4px', fontSize: '0.65rem', padding: '2px 6px', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', textAlign: 'center' }}>
                                            Priority increased due to long waiting time
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => handleDelete(c.id)} className="btn btn-danger" style={{ padding: '6px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {cases.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        <Info size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No cases found in the registry.</p>
                    </div>
                )}
            </div>

            <div className="card">
                <h3 className="card-title">Formula Breakdown Legend</h3>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#fbbf24', borderRadius: '2px' }}></div>
                        Urgency Score (0.5x)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#60a5fa', borderRadius: '2px' }}></div>
                        Waiting Time Score (0.3x)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#f87171', borderRadius: '2px' }}></div>
                        Special Condition Score (0.2x)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#dc2626', borderRadius: '2px' }}></div>
                        Aging Compensation (+2/7 days)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseList;
