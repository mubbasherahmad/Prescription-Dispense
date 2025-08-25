import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import http from '../../api/http';

export default function CreatePrescriptionModal({ onClose, onCreated }) {
  const [patientName, setPatientName] = useState('');
  const [medicationsText, setMedicationsText] = useState('Paracetamol 500mg x 10\nAmoxicillin 500mg x 14');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const backdropRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Ensure we portal to body (works even if no #modal-root)
  const portalTarget = document.body;

  const parseMedications = () => {
    // Very basic parsing: one medication per line
    return medicationsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map(line => ({ name: line }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');

    try {
      const payload = {
        patientName: patientName.trim(),
        medications: parseMedications(),
        notes: notes.trim(),
        status: 'issued',
      };

      const res = await http.post('/prescriptions', payload);
      const created = res?.data || payload;
      onCreated?.(created);
    } catch (e2) {
      setErr(e2?.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const modal = (
    <div
      ref={backdropRef}
      onMouseDown={(e) => {
        // close if clicking the backdrop (but not inner card)
        if (e.target === backdropRef.current) onClose?.();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17, 24, 39, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000, // above everything
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          padding: 24,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Create Prescription</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'transparent', border: 0, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {err && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: 8,
            borderLeft: '4px solid #ef4444',
            marginBottom: '1rem',
            fontWeight: 500
          }}>
            {err}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Patient Name</span>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                style={{
                  padding: '0.65rem 0.8rem',
                  border: '2px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 16,
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Medications (one per line)</span>
              <textarea
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                rows={5}
                style={{
                  padding: '0.65rem 0.8rem',
                  border: '2px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  resize: 'vertical',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{
                  padding: '0.65rem 0.8rem',
                  border: '2px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  resize: 'vertical',
                }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                background: '#e5e7eb',
                color: '#111827',
                border: 'none',
                padding: '0.6rem 1rem',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1rem',
                borderRadius: 8,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, portalTarget);
}
