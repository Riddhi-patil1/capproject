import React, { useState } from 'react';
import axios from 'axios';
import { Save, Upload } from 'lucide-react';

const AddCase = () => {
    const [formData, setFormData] = useState({
        case_id: '',
        filing_date: new Date().toISOString().split('T')[0],
        case_type: 'Civil',
        life_risk: false,
        senior_child: false,
        deadline: false,
        hearings_done: 0
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/add-case', formData);
            setMessage(`Case successfully added! Assigned Urgency Base: ${res.data.urgency}`);
            setFormData({
                case_id: '',
                filing_date: new Date().toISOString().split('T')[0],
                case_type: 'Civil',
                life_risk: false,
                senior_child: false,
                deadline: false,
                hearings_done: 0
            });
        } catch (err) {
            setMessage('Error adding case. Double check unique Case ID.');
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
                                Life / Safety Risk (+5 Urgency)
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
                <h3 className="card-title">Urgency Calculation Engine</h3>
                <p>Urgency is evaluated transparently by the engine using the formula:</p>
                <div style={{ background: 'var(--color-primary-dark)', color: '#fff', padding: '1rem', borderRadius: '4px', marginTop: '1rem', fontFamily: 'monospace' }}>
                    Urgency = BaseUrgency(Type) + (LifeRisk × 5) + (SeniorChild × 3) + (Deadline × 4)
                </div>
            </div>
        </div>
    );
};

export default AddCase;
