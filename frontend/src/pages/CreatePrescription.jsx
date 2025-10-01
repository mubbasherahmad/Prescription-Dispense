import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function CreatePrescriptionModal({ onClose, onCreated }) {
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [medicationStatus, setMedicationStatus] = useState({});
  const backdropRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const portalTarget = document.body;

  const addMedication = () => {
    setMedications(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const updateMedication = (index, field, value) => {
    setMedications(prev => prev.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    ));
  };

  const removeMedication = (index) => {
    if (medications.length > 1) {
      setMedications(prev => prev.filter((_, i) => i !== index));
      // Remove status for deleted medication
      setMedicationStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[index];
        return newStatus;
      });
    }
  };

  // Check medication availability when name or dosage changes
  useEffect(() => {
    const checkMedicationAvailability = async () => {
      const newStatus = { ...medicationStatus };
      
      for (let i = 0; i < medications.length; i++) {
        const med = medications[i];
        if (med.name.trim() && med.dosage.trim()) {
          try {
            const response = await fetch(`${API_BASE_URL}/drugs/check-availability`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                name: med.name,
                dosage: med.dosage
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              newStatus[i] = {
                available: data.available,
                message: data.message,
                stock: data.stock,
                required: data.required
              };
            } else {
              newStatus[i] = {
                available: false,
                message: 'Error checking availability',
                stock: 0,
                required: 0
              };
            }
          } catch (error) {
            newStatus[i] = {
              available: false,
              message: 'Error checking availability',
              stock: 0,
              required: 0
            };
          }
        } else {
          newStatus[i] = null;
        }
      }
      
      setMedicationStatus(newStatus);
    };

    // Add a small delay to avoid too many API calls
    const timeoutId = setTimeout(() => {
      checkMedicationAvailability();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [medications]);

  const getMedicationStatusIcon = (index) => {
    const status = medicationStatus[index];
    if (!status) return null;
    
    if (status.available) {
      return (
        <span className="text-green-600 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Available ({status.stock} in stock)
        </span>
      );
    } else {
      return (
        <span className="text-red-600 text-sm flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {status.message}
        </span>
      );
    }
  };

  const getOverallAvailabilityStatus = () => {
    const allChecked = medications.every((med, index) => 
      medicationStatus[index] !== undefined && medicationStatus[index] !== null
    );
    
    if (!allChecked) return null;

    const allAvailable = medications.every((med, index) => 
      medicationStatus[index]?.available === true
    );

    const someAvailable = medications.some((med, index) => 
      medicationStatus[index]?.available === true
    );

    if (allAvailable) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-green-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">All medications are available in inventory</span>
          </div>
        </div>
      );
    } else if (someAvailable) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Some medications may not be available</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            You can still create the prescription, but it cannot be dispensed until all medications are available.
          </p>
        </div>
      );
    } else {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">No medications available in inventory</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            This prescription cannot be dispensed. Please check with the pharmacy.
          </p>
        </div>
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr('');

    try {
      const token = localStorage.getItem('token');
      
      // Filter out empty medications
      const validMedications = medications.filter(med => 
        med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
      );

      if (validMedications.length === 0) {
        throw new Error('At least one medication with all fields is required');
      }

      const payload = {
        patientName: patientName.trim(),
        patientAge: parseInt(patientAge),
        medications: validMedications,
        notes: notes.trim(),
      };

      const response = await fetch(`${API_BASE_URL}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create prescription');
      }

      const createdPrescription = await response.json();
      onCreated?.(createdPrescription);
    } catch (err) {
      setErr(err.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const modal = (
    <div
      ref={backdropRef}
      onMouseDown={(e) => {
        if (e.target === backdropRef.current) onClose?.();
      }}
      className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        style={{ minHeight: '500px' }}
      >
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Create Prescription</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold bg-transparent border-0 cursor-pointer leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Error Message - Fixed */}
        {err && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4 rounded flex-shrink-0">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{err}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Age *
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient age"
                />
              </div>
            </div>

            {/* Medications Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Medications *
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    System will automatically check drug inventory availability
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addMedication}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  + Add Medication
                </button>
              </div>

              {/* Overall Availability Status */}
              {getOverallAvailabilityStatus()}
              
              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-700">Medication #{index + 1}</h4>
                        {getMedicationStatusIcon(index)}
                      </div>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Medication Name * (e.g., Paracetamol, Amoxicillin)"
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <input
                            type="text"
                            placeholder="Dosage * (e.g., 10 tablets)"
                            value={medication.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">Include quantity (e.g., 10 tablets, 5mg, 100ml)</p>
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Frequency * (e.g., 3 times daily)"
                            value={medication.frequency}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Duration * (e.g., 7 days)"
                            value={medication.duration}
                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                placeholder="Additional notes (optional)"
              />
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Prescription'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, portalTarget);
}