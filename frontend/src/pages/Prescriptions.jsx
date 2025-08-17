import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);

  // Dummy data for development
  const dummyPrescriptions = [
    {
      _id: 'dummy1',
      patientName: 'John Smith',
      patientAge: 45,
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' }
      ],
      status: 'pending',
      expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: 'Take with food. Monitor blood pressure.'
    },
    {
      _id: 'dummy2',
      patientName: 'Sarah Johnson',
      patientAge: 32,
      medications: [
        { name: 'Amoxicillin', dosage: '875mg', frequency: 'Twice daily', duration: '10 days' }
      ],
      status: 'validated',
      expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      validatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      notes: 'Complete full course even if feeling better.'
    },
    {
      _id: 'dummy3',
      patientName: 'Robert Davis',
      patientAge: 67,
      medications: [
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '90 days' },
        { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '90 days' }
      ],
      status: 'dispensed',
      expiryDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      validatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      dispensedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: 'Take in the evening. Regular cholesterol monitoring required.'
    },
    {
      _id: 'dummy4',
      patientName: 'Maria Garcia',
      patientAge: 28,
      medications: [
        { name: 'Ibuprofen', dosage: '600mg', frequency: 'Three times daily', duration: '7 days' }
      ],
      status: 'cancelled',
      expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      cancelledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notes: 'Patient reported allergy to NSAIDs.'
    },
    {
      _id: 'dummy5',
      patientName: 'Michael Brown',
      patientAge: 55,
      medications: [
        { name: 'Omeprazole', dosage: '20mg', frequency: 'Once daily', duration: '14 days' }
      ],
      status: 'pending',
      expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      notes: 'Take 30 minutes before breakfast.'
    },
    {
      _id: 'dummy6',
      patientName: 'Lisa Wilson',
      patientAge: 41,
      medications: [
        { name: 'Levothyroxine', dosage: '75mcg', frequency: 'Once daily', duration: '90 days' }
      ],
      status: 'validated',
      expiryDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      validatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      notes: 'Take on empty stomach, 1 hour before food.'
    }
  ];
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    doctorName: '',
    doctorId: '',
    prescriptionId: '',
    medications: [{
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: ''
    }],
    notes: ''
  });

  // Combine API data with dummy data for development
  const allPrescriptions = [...prescriptions, ...dummyPrescriptions];

  const filteredPrescriptions = allPrescriptions.filter(prescription => {
    const matchesSearch = prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medications.some(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Summary statistics
  const summary = {
    total: allPrescriptions.length,
    pending: allPrescriptions.filter(p => p.status === 'pending').length,
    validated: allPrescriptions.filter(p => p.status === 'validated').length,
    dispensed: allPrescriptions.filter(p => p.status === 'dispensed').length,
    cancelled: allPrescriptions.filter(p => p.status === 'cancelled').length,
    expired: allPrescriptions.filter(p => p.status === 'expired').length,
  };

  const handleValidate = async (prescriptionId) => {
    try {
      await axiosInstance.put(`/api/prescriptions/${prescriptionId}/validate`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setPrescriptions(prescriptions.map(p => 
        p._id === prescriptionId 
          ? { ...p, status: 'validated', validatedAt: new Date() }
          : p
      ));
      alert('Prescription validated!');
    } catch (error) {
      alert('Error validating prescription');
    }
  };

  const handleDispense = async (prescriptionId) => {
    try {
      await axiosInstance.put(`/api/prescriptions/${prescriptionId}/dispense`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setPrescriptions(prescriptions.map(p => 
        p._id === prescriptionId 
          ? { ...p, status: 'dispensed', dispensedAt: new Date() }
          : p
      ));
      alert('Prescription dispensed!');
    } catch (error) {
      alert('Error dispensing prescription');
    }
  };

  const handleCancel = async (prescriptionId) => {
    if (window.confirm('Are you sure you want to cancel this prescription? This action cannot be undone.')) {
      try {
        await axiosInstance.put(`/api/prescriptions/${prescriptionId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        setPrescriptions(prescriptions.map(p => 
          p._id === prescriptionId 
            ? { ...p, status: 'cancelled', cancelledAt: new Date() }
            : p
        ));
        alert('Prescription cancelled!');
      } catch (error) {
        alert('Error cancelling prescription');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'validated': return 'bg-blue-100 text-blue-800';
      case 'dispensed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    setFormData({
      ...formData,
      medications: updatedMedications
    });
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, {
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: ''
      }]
    });
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        medications: updatedMedications
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const prescriptionData = {
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge),
        medications: formData.medications.map(med => ({
          name: med.medicationName,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration
        })),
        notes: `Doctor: ${formData.doctorName} (${formData.doctorId}), Prescription ID: ${formData.prescriptionId}. ${formData.notes}`.trim()
      };

      const response = await axiosInstance.post('/api/prescriptions', prescriptionData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      setPrescriptions([response.data, ...prescriptions]);
      alert('Prescription added!');
      setShowModal(false);
      setFormData({
        patientName: '',
        patientAge: '',
        doctorName: '',
        doctorId: '',
        prescriptionId: '',
        medications: [{
          medicationName: '',
          dosage: '',
          frequency: '',
          duration: ''
        }],
        notes: ''
      });
    } catch (error) {
      alert('Error adding prescription');
    }
  };

  const handleEdit = (prescription) => {
    setEditingPrescription(prescription);
    setShowEditModal(true);
  };

  const handleUpdatePrescription = async (updatedData) => {
    try {
      const response = await axiosInstance.put(`/api/prescriptions/${editingPrescription._id}`, updatedData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setPrescriptions(prescriptions.map(p => 
        p._id === editingPrescription._id ? response.data : p
      ));
      setShowEditModal(false);
      setEditingPrescription(null);
      alert('Prescription updated successfully!');
    } catch (error) {
      alert('Error updating prescription');
    }
  };

  const canEditPrescription = (status) => {
    return status === 'pending' || status === 'validated';
  };

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axiosInstance.get('/api/prescriptions', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPrescriptions(response.data);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      }
    };

    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
            <p className="text-gray-600 text-sm mt-1">Manage and track your prescription medications</p>
          </div>
          <div className="space-x-3">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Add Prescription
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by patient name or medication..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="validated">Validated</option>
            <option value="dispensed">Dispensed</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>

          {/* Prescriptions Table */}
          <div className="bg-white rounded-lg border border-gray-300 mb-6">
            <div className="flex items-center justify-between p-4 border-b border-gray-300">
              <h3 className="text-lg font-bold">
                {statusFilter === 'all' ? 'All Prescriptions' : 
                 statusFilter === 'pending' ? 'Pending Prescriptions' :
                 statusFilter === 'validated' ? 'Validated Prescriptions' :
                 statusFilter === 'dispensed' ? 'Dispensed Prescriptions' :
                 statusFilter === 'cancelled' ? 'Cancelled Prescriptions' :
                 statusFilter === 'expired' ? 'Expired Prescriptions' : 'Prescriptions'}
              </h3>
              <span className="text-sm text-gray-500">
                {filteredPrescriptions.length} prescriptions
              </span>
            </div>
            {filteredPrescriptions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {prescriptions.length === 0 
                  ? "No prescriptions found. Add your first prescription to get started."
                  : "No prescriptions match your search."
                }
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 border-b border-gray-300">Patient</th>
                      <th className="text-left p-3 border-b border-gray-300">Age</th>
                      <th className="text-left p-3 border-b border-gray-300">Medications</th>
                      <th className="text-left p-3 border-b border-gray-300">Status</th>
                      <th className="text-left p-3 border-b border-gray-300">Expiry</th>
                      <th className="text-left p-3 border-b border-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrescriptions.map((prescription) => (
                      <tr key={prescription._id} className="border-b border-gray-200">
                        <td className="p-3 font-medium">{prescription.patientName}</td>
                        <td className="p-3">{prescription.patientAge}</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            {prescription.medications.map((med, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">{med.name}</span> - {med.dosage}
                                <br />
                                <span className="text-gray-500">{med.frequency}, {med.duration}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                            {prescription.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          {new Date(prescription.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 flex-wrap">
                            {canEditPrescription(prescription.status) && (
                              <button
                                onClick={() => handleEdit(prescription)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Edit
                              </button>
                            )}
                            {prescription.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleValidate(prescription._id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Validate
                                </button>
                                <button
                                  onClick={() => handleCancel(prescription._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {prescription.status === 'validated' && (
                              <>
                                <button
                                  onClick={() => handleDispense(prescription._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Dispense
                                </button>
                                <button
                                  onClick={() => handleCancel(prescription._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {prescription.status === 'dispensed' && (
                              <span className="text-green-600 text-sm font-medium">Completed</span>
                            )}
                            {prescription.status === 'cancelled' && (
                              <span className="text-gray-600 text-sm font-medium">Cancelled</span>
                            )}
                            {prescription.status === 'expired' && (
                              <span className="text-red-600 text-sm font-medium">Expired</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Prescription</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prescription ID *
                  </label>
                  <input
                    type="text"
                    name="prescriptionId"
                    value={formData.prescriptionId}
                    onChange={handleChange}
                    placeholder="RX-2024-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor ID *
                  </label>
                  <input
                    type="text"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    placeholder="DR001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                  placeholder="Dr. Johnson"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Age *
                  </label>
                  <input
                    type="number"
                    name="patientAge"
                    value={formData.patientAge}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Medications *
                  </label>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Another
                  </button>
                </div>
                
                {formData.medications.map((medication, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Medication {index + 1}</span>
                      {formData.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Medication name"
                        value={medication.medicationName}
                        onChange={(e) => handleMedicationChange(index, 'medicationName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        
                        <select
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Frequency</option>
                          <option value="Once daily">Daily</option>
                          <option value="Twice daily">Twice</option>
                          <option value="Three times daily">3x daily</option>
                        </select>
                        
                        <input
                          type="text"
                          placeholder="Duration"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Special instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium"
                >
                  Add Prescription
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPrescription && (
        <EditPrescriptionModal
          prescription={editingPrescription}
          onClose={() => {
            setShowEditModal(false);
            setEditingPrescription(null);
          }}
          onUpdate={handleUpdatePrescription}
        />
      )}
    </div>
  );
};

// Edit Prescription Modal Component
const EditPrescriptionModal = ({ prescription, onClose, onUpdate }) => {
  const [editData, setEditData] = useState({
    expiryDate: prescription.expiryDate ? new Date(prescription.expiryDate).toISOString().split('T')[0] : '',
    medications: prescription.medications.map(med => ({ ...med })),
    notes: prescription.notes || ''
  });

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...editData.medications];
    updatedMedications[index][field] = value;
    setEditData({
      ...editData,
      medications: updatedMedications
    });
  };

  const addMedication = () => {
    setEditData({
      ...editData,
      medications: [...editData.medications, {
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
      }]
    });
  };

  const removeMedication = (index) => {
    if (editData.medications.length > 1) {
      const updatedMedications = editData.medications.filter((_, i) => i !== index);
      setEditData({
        ...editData,
        medications: updatedMedications
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(editData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Prescription</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient: {prescription.patientName} (Age: {prescription.patientAge})
            </label>
            <p className="text-sm text-gray-500">Patient details cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date *
            </label>
            <input
              type="date"
              name="expiryDate"
              value={editData.expiryDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Medications *
              </label>
              <button
                type="button"
                onClick={addMedication}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + Add Another
              </button>
            </div>
            
            {editData.medications.map((medication, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Medication {index + 1}</span>
                  {editData.medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Medication name"
                    value={medication.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    
                    <select
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Frequency</option>
                      <option value="Once daily">Daily</option>
                      <option value="Twice daily">Twice</option>
                      <option value="Three times daily">3x daily</option>
                    </select>
                    
                    <input
                      type="text"
                      placeholder="Duration"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={editData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Special instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium"
            >
              Update Prescription
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Prescriptions;