import React, { useState } from 'react';
import api from '../api';
import { Save, Upload, Activity } from 'lucide-react';

const AddCase = () => {
    const [formData, setFormData] = useState({
        case_id: '',
        filing_date: new Date().toISOString().split('T')[0],
        case_type: 'Civil',
        life_risk: false,
        senior_child: false,
        deadline: false,
        medical_emergency: false,
        special_condition_score: 0,
        hearings_done: 0
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/add-case', formData);
            setMessage(`Case successfully added! Final Priority: ${res.data.priority}`);
            setFormData({
                case_id: '',
                filing_date: new Date().toISOString().split('T')[0],
                case_type: 'Civil',
                life_risk: false,
                senior_child: false,
                deadline: false,
                medical_emergency: false,
                special_condition_score: 0,
                hearings_done: 0
            });
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Double check unique Case ID or Server connection.';
            setMessage('Error: ' + errorMsg);
        }
    };

    return (
        <div>
            <h2 className="card-title">Register New Case</h2>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="dashboard-grid">
                        <div>
                            <label>Case ID / Reference No.</label>
                            <input
                                type="text"
                                name="case_id"
                                value={formData.case_id}
                                onChange={handleChange}
                                placeholder="e.g. CIV-2023-001"
                                required
                            />
                        </div>
                        <div>
                            <label>Filing Date</label>
                            <input
                                type="date"
                                name="filing_date"
                                value={formData.filing_date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div>
                            <label>Case Type</label>
                            <select name="case_type" value={formData.case_type} onChange={handleChange}>
                                <option value="Criminal">Criminal</option>
                                <option value="Civil">Civil</option>
                                <option value="Family">Family</option>
                                <option value="Property">Property</option>
                            </select>
                        </div>
                        <div>
                            <label>Hearings Done (Historical)</label>
                            <input
                                type="number"
                                name="hearings_done"
                                value={formData.hearings_done}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        <div>
                            <label>Special Condition Score (0-10)</label>
                            <input
                                type="number"
                                name="special_condition_score"
                                value={formData.special_condition_score}
                                onChange={handleChange}
                                min="0"
                                max="10"
                                step="0.1"
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', background: 'var(--color-bg-base)', padding: '1.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>Aggravating Factors (Priority Modifiers)</h4>

                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    name="life_risk"
                                    checked={formData.life_risk}
                                    onChange={handleChange}
                                    style={{ width: 'auto', marginBottom: 0 }}
                                />
                                Life / Safety Risk (+15 Urgency)
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    name="senior_child"
                                    checked={formData.senior_child}
                                    onChange={handleChange}
                                    style={{ width: 'auto', marginBottom: 0 }}
                                />
                                Senior Citizen / Child (+3 Urgency)
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    name="deadline"
                                    checked={formData.deadline}
                                    onChange={handleChange}
                                    style={{ width: 'auto', marginBottom: 0 }}
                                />
                                Statutory Deadline Exists (+4 Urgency)
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    name="medical_emergency"
                                    checked={formData.medical_emergency}
                                    onChange={handleChange}
                                    style={{ width: 'auto', marginBottom: 0 }}
                                />
                                Medical Emergency (+8 Urgency)
                            </label>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-accent"><Save size={18} /> Save Case Entry</button>
                        <button type="button" className="btn" style={{ background: 'var(--color-primary-hover)' }}><Upload size={18} /> CSV Bulk Upload</button>
                    </div>

                    {message && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-success)', color: '#fff', borderRadius: '4px', fontWeight: '500' }}>
                            {message}
                        </div>
                    )}
                </form>
            </div>

            <div className="card">
                <h3 className="card-title">Intelligent Priority Formula</h3>
                <p>Urgency is evaluated transparently by the engine using the weighted analysis:</p>
                <div style={{ background: 'var(--color-primary-dark)', color: '#fff', padding: '1.5rem', borderRadius: '4px', marginTop: '1rem', fontFamily: 'monospace', lineHeight: '1.6' }}>
                    Final Priority = (0.5 × <span style={{ color: '#fbbf24' }}>Urgency Score</span>) + (0.3 × <span style={{ color: '#60a5fa' }}>Waiting Time Score</span>) + (0.2 × <span style={{ color: '#f87171' }}>Special Condition Score</span>)<br/><br/>
                    • Case Aging: +2 Priority for every 7 days pending
                </div>
            </div>
        </div>
    );
};

export default AddCase;
