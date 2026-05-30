import { useState } from 'react';

export default function AssessmentForm() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '0',
    anxiety: '0',
    panic_attacks: '0'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Noor Malik ke chaltay hue backend API pipeline ko trigger karna
      const response = await fetch('http://127.0.0.1:8000/api/predict-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          gender: parseInt(formData.gender),
          anxiety: parseInt(formData.anxiety),
          panic_attacks: parseInt(formData.panic_attacks)
        }),
      });

      if (!response.ok) {
        throw new Error('Backend server responded with an error');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Backend se connection nahi ho saka. Ensure karein ke uvicorn server chal raha hai.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="app-card">
      <h3 className="card-title">📋 Risk Assessment Profile</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Age Target</label>
          <input
            type="number"
            required
            min="1"
            max="120"
            className="text-input"
            placeholder="e.g. 56"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
          />
        </div>

        <div className="field-group">
          <label>Biological Gender</label>
          <select
            className="select-dropdown"
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
          >
            <option value="0">Female</option>
            <option value="1">Male</option>
          </select>
        </div>

        <div className="field-group">
          <label>Experiencing