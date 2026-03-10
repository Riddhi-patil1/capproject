import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, Calculator } from 'lucide-react';

const CaseList = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCases = () => {
        setLoading(true);
        axios.get('http://localhost:5000/cases')
            .then(res => setCases(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const processPriorities = () => {
        setLoading(true);
        axios.post('http://localhost:5000/calculate-priority')
            .then(res => fetchCases())
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCases();
    }, []);

    const getBadgeClass = (type) => {
        const types = { 'Criminal': 'badge-criminal', 'Family': 'badge-family', 'Civil': 'badge-civil', 'Property': 'badge-property' };
        return types[type] || 'badge-civil';
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="card-title" style={{ margin: 0 }}>Case Registry Engine</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={fetchCases} className="btn" disabled={loading}>
                        <RefreshCw size={16} /> Refresh Let
                    </button>
                    <button onClick={processPriorities} className="btn btn-accent" disabled={loading}>
                        <Calculator size={16} /> Run Priority OS Engine
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Case ID</th>
                                <th>Filing Date</th>
                                <th>Type</th>
                                <th>Urgency Score</th>
                                <th>Hearings</th>
                                <th>Final Priority</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cases.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: '600' }}>{c.case_id}</td>
                                    <td>{c.filing_date}</td>
                                    <td><span className={`badge ${getBadgeClass(c.case_type)}`}>{c.case_type}</span></td>
                                    <td>{c.urgency}</td>
                                    <td>{c.hearings_done}</td>
                                    <td style={{ color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>
                                        {c.priority !== null ? Number(c.priority).toFixed(2) : 'Awaiting Compute'}
                                    </td>
                                    <td>
                                        {c.judge_id ? (
                                            <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>Scheduled - {c.judge_name}</span>
                                        ) : (
                                            <span style={{ color: 'var(--color-danger)' }}>Pending</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {cases.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#4a5568' }}>
                            No cases in the system yet. Please run case entry.
                        </div>
                    )}
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">Priority Process Starvation Handling</h3>
                <p>The system actively prevents starvation of low-urgency processes (Cases) through an Aging Mechanism:</p>
                <div style={{ background: 'var(--color-bg-base)', padding: '15px', borderRadius: '4px', marginTop: '1rem', borderLeft: '4px solid var(--color-gold)' }}>
                    <strong>Dynamic Priority = </strong> (CaseAgeInDays × 3) + (Urgency × 2) + CriticalPathDuration - HearingsDone
                </div>
            </div>
        </div>
    );
};

export default CaseList;
