import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Briefcase, Users, Activity, Clock } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_cases: 0,
        avg_priority: 0,
        total_judges: 0,
        workloads: [],
        criticalPathDuration: 40
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
                    <div className="stat-title"><Clock size={16} /> Critical Path Days</div>
                    <div className="stat-value">{stats.criticalPathDuration}</div>
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
                <h3 className="card-title">Activity on Arrow (AOA) Model</h3>
                <p>The system calculates Critical Path duration using established phase estimates:</p>
                <div style={{ display: 'flex', gap: '15px', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-civil">Filing (2d)</span> →
                    <span className="badge badge-civil">Notice (5d)</span> →
                    <span className="badge badge-civil">Evidence (10d)</span> →
                    <span className="badge badge-danger">Hearing (15d)</span> →
                    <span className="badge badge-civil">Argument (5d)</span> →
                    <span className="badge badge-success">Judgment (3d)</span>
                </div>
                <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
                    Total Critical Path Duration: 40 Days
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
