import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Briefcase, Users, Activity, Clock } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_cases: 0,
        avg_priority: 0,
        total_judges: 0,
        workloads: []
    });

    useEffect(() => {
        axios.get('http://localhost:5000/dashboard-stats')
            .then(res => setStats(res.data))
            .catch(err => console.error("Error fetching stats:", err));
    }, []);

    return (
        <div>
            <h2 className="card-title">System Overview</h2>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-title"><Briefcase size={16} /> Total Cases</div>
                    <div className="stat-value">{stats.total_cases}</div>
                </div>
                <div className="stat-card accent">
                    <div className="stat-title"><Users size={16} /> Active Judges</div>
                    <div className="stat-value">{stats.total_judges}</div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-title"><Activity size={16} /> Avg Priority Score</div>
                    <div className="stat-value">{stats.avg_priority}</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-title"><Clock size={16} /> Algorithmic Complexity</div>
                    <div className="stat-value">O(N log N)</div>
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">Judge Workload Distribution</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={stats.workloads}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="workload" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card">
                <h3 className="card-title">Analysis of Algorithms (AoA) Overview</h3>
                <p>The JusticeOS Scheduling Engine is built on established algorithmic principles to ensure maximum throughput and fair distribution of legal cases.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '1rem' }}>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Greedy Strategy</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Every case is assigned to the judge with the current minimum workload, ensuring local optimization for global balance.</p>
                    </div>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Time Complexity</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Sorting cases by priority takes $O(N \log N)$ time, providing a highly scalable solution for large courts.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
