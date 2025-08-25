import React, { useEffect, useState } from 'react';
import http from '../api/http';
import CreatePrescriptionModal from '../components/prescriptions/CreatePrescriptionModal';

export default function PrescriptionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    http.get('/prescriptions')
      .then(res => {
        if (!mounted) return;
        setItems(Array.isArray(res.data) ? res.data : []);
        setErr('');
      })
      .catch(e => {
        if (!mounted) return;
        setItems([]);
        setErr('Failed to load prescriptions.');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  const handleCreated = (created) => {
    setItems(prev => [created, ...prev]);
    setShowModal(false);
  };

  return (
    <div className="prescriptions-page">
      {/* Header */}
      <div className="page-header">
        <h1>Prescriptions</h1>
        <div className="header-actions">
          <button
            id="create-prescription-btn"
            data-testid="create-prescription-btn"
            className="btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Create Prescription
          </button>
        </div>
      </div>

      {/* Status / Error */}
      {loading && <div className="loading">Loading prescriptions…</div>}
      {!loading && err && <div className="error-message">{err}</div>}

      {/* Empty state / Grid */}
      {!loading && !err && (
        items.length === 0 ? (
          <div className="no-prescriptions">
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No prescriptions yet</h3>
              <p>Click the button above to create your first prescription.</p>
              <button
                className="btn-primary"
                onClick={() => setShowModal(true)}
              >
                + Create Prescription
              </button>
            </div>
          </div>
        ) : (
          <div className="prescriptions-container">
            <div className="prescriptions-grid">
              {items.map(p => (
                <div
                  key={p._id || p.id}
                  className="prescription-card"
                  role="button"
                  tabIndex={0}
                >
                  <div className="prescription-header">
                    <h3>{p.patientName || 'Unnamed patient'}</h3>
                    <span className={`status ${p.status || 'pending'}`}>
                      {p.status || 'pending'}
                    </span>
                  </div>
                  <div className="prescription-details">
                    <p>
                      <strong>Created:</strong>&nbsp;
                      {p.createdAt || p.date
                        ? new Date(p.createdAt || p.date).toLocaleString()
                        : '—'}
                    </p>
                    <p>
                      <strong>Medications:</strong>&nbsp;
                      {Array.isArray(p.medications) ? p.medications.length : 0}
                    </p>
                    {p.notes && <p><strong>Notes:</strong> {p.notes}</p>}
                  </div>
                  <div className="prescription-footer">
                    <span className="view-link">View</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Modal */}
      {showModal && (
        <CreatePrescriptionModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
