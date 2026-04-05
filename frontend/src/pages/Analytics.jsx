import React, { useEffect, useState } from 'react';
import api from '../api';
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, Legend as LineLegend } from 'recharts';
import { History, Activity, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

const Analytics = () => {
    const [stats, setStats] = useState({ caseTypes: [], workloads: [] });
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/dashboard-stats');
                setStats(res.data);
                
                const histRes = await api.get('/history');
                setHistory(histRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAnalytics();
    }, []);

    const COLORS = ['#6366f1', '#fbbf24', '#ef4444', '#10b981', '#a855f7'];

    return (
        <div>
            <h2 className="card-title">Advanced Performance Analytics</h2>

            <div className="dashboard-grid">
                <div className="card">
                    <h3 className="card-title"><Activity size={18} /> Case Type Distribution</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.caseTypes}
                                    dataKey="count"
                                    nameKey="case_type"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label
                                >
                                    {stats.caseTypes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <PieTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 className="card-title"><History size={18} /> Scheduling Execution History</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="case-table">
                            <thead>
                                <tr style={{ fontSize: '0.75rem' }}>
                                    <th>Executed On</th>
                                    <th>Total Cases</th>
                                    <th>Imbalance Value</th>
                                    <th>Ops count</th>
                                    <th>Execution Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h, i) => (
                                    <tr key={i} style={{ fontSize: '0.8rem' }}>
                                        <td>{new Date(h.timestamp).toLocaleString()}</td>
                                        <td>{h.total_cases}</td>
                                        <td>
                                            <span style={{ color: h.imbalance_value <= 1 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                                                {h.imbalance_value}
                                            </span>
                                        </td>
                                        <td>{h.total_ops}</td>
                                        <td>{h.execution_time} ms</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3 className="card-title"><ShieldCheck size={18} /> Asymptotic Performance Trends</h3>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <LineChart data={history.slice(0, 10).reverse()}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="timestamp" hide />
                            <YAxis yAxisId="left" orientation="left" stroke="#6366f1" />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                            <LineTooltip />
                            <LineLegend />
                            <Line yAxisId="left" type="monotone" dataKey="total_ops" stroke="#6366f1" strokeWidth={3} name="Computational Loads ($O(N \log N)$)" dot={{r: 4}} />
                            <Line yAxisId="right" type="monotone" dataKey="imbalance_value" stroke="#10b981" strokeWidth={2} name="Load Balancing Stability ($L_{max} - L_{min}$)" dot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <TrendingDown color="#10b981" size={24} style={{ marginTop: '4px' }} />
                        <div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>Stability Optimization</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Imbalance scores below 2 indicate optimal judicial resource allocation across specializations.</div>
                        </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <Clock color="#6366f1" size={24} style={{ marginTop: '4px' }} />
                        <div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>Low-Latency Execution</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Average execution remains under 10ms for datasets of up to 10k entities.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
