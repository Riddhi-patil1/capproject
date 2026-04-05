import React, { useEffect, useState } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Briefcase, Users, Activity, Clock, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/dashboard-stats');
                if (res.data && res.data.workloads) {
                    setStats(res.data);
                }
                
                const notifRes = await api.get('/notifications');
                if (notifRes.data) {
                    setNotifications(notifRes.data);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };
        fetchData();
    }, []);

    if (!stats) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading System Analytics...</div>;

    return (
        <div>
            <h2 className="card-title">System Overview</h2>

            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-title"><Briefcase size={16} /> Total Cases</div>
                    <div className="stat-value">{stats.total_cases}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        {stats.pending} Pending | {stats.completed} Completed
                    </div>
                </div>
                <div className="stat-card accent">
                    <div className="stat-title"><Users size={16} /> Active Judges</div>
                    <div className="stat-value">{stats.total_judges}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        Utilization: {stats.utilization}
                    </div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-title"><Activity size={16} /> Max Priority Score</div>
                    <div className="stat-value">{stats.high_priority}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        Avg Score: {stats.avg_priority}
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-title"><Clock size={16} /> Avg Waiting Time</div>
                    <div className="stat-value">{stats.avg_waiting} Days</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                        Since registration
                    </div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 className="card-title">Judge Workload Distribution</h3>
                    <div style={{ width: '100%', height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '8px' }}>
                        {(!stats.workloads || stats.workloads.length === 0 || stats.workloads.every(j => j.workload === 0)) ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                <Activity size={40} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                <p>No active workload data. Run the <strong>Scheduler</strong> to see distribution.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer>
                                <BarChart data={stats.workloads}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                    <Bar dataKey="workload" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-title">Live Notifications</h3>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No recent system alerts.</p>
                    ) : (
                        notifications.map((n, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', borderBottom: '1px solid #f1f5f9', alignItems: 'flex-start' }}>
                                {n.type === 'Assignment' ? <TrendingUp size={18} color="#6366f1" /> : <AlertCircle size={18} color="#ef4444" />}
                                <div>
                                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>{n.message}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(n.timestamp).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        ))
                    )}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 className="card-title">Analysis of Algorithms (AoA) Overview</h3>
                <p>The JusticeOS Scheduling Engine uses intelligent greedy optimization combined with specialized judicial matching to ensure maximum judicial efficiency.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '1.5rem' }}>
                    <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Greedy Heuristic</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Every case is assigned to the least-loaded judge within their specific legal specialization.</p>
                    </div>
                    <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Starvation Prevention</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Priority increases automatically over time (+2 every 7 days) so legacy cases are never left behind.</p>
                    </div>
                    <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #fbbf24' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Asymptotic Bounds</h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Matching and allocation runs in $O(N \log N)$ using advanced Priority Queue architectures.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
