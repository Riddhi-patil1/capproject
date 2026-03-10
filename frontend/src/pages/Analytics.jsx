import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer, Legend } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip, Legend as LineLegend } from 'recharts';

const Analytics = () => {
    const [stats, setStats] = useState({ caseTypes: [], workloads: [] });

    useEffect(() => {
        axios.get('http://localhost:5000/dashboard-stats')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, []);

    const COLORS = ['#6366f1', '#fbbf24', '#ef4444', '#10b981'];

    // Mock data to demonstrate random vs optimized.
    const comparisonData = [
        { name: 'Judge 1', optimized: 20, random: 15 },
        { name: 'Judge 2', optimized: 20, random: 28 },
        { name: 'Judge 3', optimized: 20, random: 12 },
        { name: 'Judge 4', optimized: 20, random: 30 },
        { name: 'Judge 5', optimized: 20, random: 15 },
    ];

    return (
        <div>
            <h2 className="card-title">Analysis & Utilization</h2>

            <div className="dashboard-grid">
                <div className="card" style={{ flex: 1 }}>
                    <h3 className="card-title" style={{ fontSize: '1.2rem' }}>Case Type Distribution</h3>
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

                <div className="card" style={{ flex: 1 }}>
                    <h3 className="card-title" style={{ fontSize: '1.2rem' }}>Workload Distribution: Optimized vs Random</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <LineChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <LineTooltip />
                                <LineLegend />
                                <Line type="monotone" dataKey="optimized" stroke="#10b981" strokeWidth={3} name="Load Balanced (JusticeOS)" />
                                <Line type="monotone" dataKey="random" stroke="#ef4444" strokeWidth={3} strokeDasharray="5 5" name="Random Assigment" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#4a5568', marginTop: '1rem', fontStyle: 'italic' }}>
                        * Graph visually denotes how without proper OS scheduling (Random Assignment), resource bottleneck anomalies occur. JusticeOS ensures smooth standard workload curve.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
