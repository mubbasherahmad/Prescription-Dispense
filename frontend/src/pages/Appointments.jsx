// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import axiosInstance from '../axiosConfig';
// import ToastContainer from '../components/ToastContainer';

// const Appointments = () => {
//   const { user } = useAuth();
//   const [appointments, setAppointments] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [toasts, setToasts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Sample doctors data (same approach as prescriptions)
//   const sampleDoctors = [
//     { _id: '1', name: 'Dr. Sarah Johnson', specialization: 'Cardiology' },
//     { _id: '2', name: 'Dr. Michael Chen', specialization: 'Pediatrics' },
//     { _id: '3', name: 'Dr. Emily Davis', specialization: 'Dermatology' },
//     { _id: '4', name: 'Dr. Robert Wilson', specialization: 'Neurology' },
//     { _id: '5', name: 'Dr. Lisa Martinez', specialization: 'Orthopedics' },
//     { _id: '6', name: 'Dr. James Brown', specialization: 'General Medicine' }
//   ];

//   // Toast management
//   const addToast = (message, type = 'info', duration = 4000) => {
//     const id = Date.now() + Math.random();
//     const newToast = { id, message, type, duration };
//     setToasts(prev => [...prev, newToast]);
//   };

//   const removeToast = (id) => {
//     setToasts(prev => prev.filter(toast => toast.id !== id));
//   };

//   // Form state
//   const [formData, setFormData] = useState({
//     doctorId: '',
//     appointmentDate: '',
//     appointmentTime: '',
//     duration: 30,
//     reason: '',
//     notes: ''
//   });

//   // Fetch appointments from database
//   useEffect(() => {
//     const fetchAppointments = async () => {
//       try {
//         setLoading(true);
//         const response = await axiosInstance.get('/api/appointments/my-appointments', {
//           headers: { Authorization: `Bearer ${user.token}` }
//         });
//         setAppointments(response.data);
//       } catch (error) {
//         console.error('Error fetching appointments:', error);
//         addToast('Failed to load appointments', 'error');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user) {
//       fetchAppointments();
//     }
//   }, [user]);

//   // Handle form changes
//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   // Create appointment
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      
//       // Find selected doctor from sample data
//       const selectedDoctor = sampleDoctors.find(doc => doc._id === formData.doctorId);
      
//       if (!selectedDoctor) {
//         addToast('Please select a doctor', 'error');
//         return;
//       }
      
//       const appointmentData = {
//         doctorId: selectedDoctor._id,
//         doctorName: selectedDoctor.name,
//         doctorSpecialization: selectedDoctor.specialization,
//         appointmentDate: appointmentDateTime.toISOString(),
//         duration: parseInt(formData.duration),
//         reason: formData.reason,
//         notes: formData.notes
//       };

//       const response = await axiosInstance.post('/api/appointments', appointmentData, {
//         headers: { Authorization: `Bearer ${user.token}` }
//       });

//       setAppointments([response.data, ...appointments]);
//       addToast('Appointment booked successfully!', 'success');
//       setShowModal(false);
//       setFormData({
//         doctorId: '',
//         appointmentDate: '',
//         appointmentTime: '',
//         duration: 30,
//         reason: '',
//         notes: ''
//       });
//     } catch (error) {
//       console.error('Appointment booking error:', error);
//       addToast('Failed to book appointment', 'error', error.response?.data?.message);
//     }
//   };

//   // Cancel appointment
//   const handleCancel = async (appointmentId) => {
//     if (window.confirm('Are you sure you want to cancel this appointment?')) {
//       try {
//         await axiosInstance.put(`/api/appointments/${appointmentId}/cancel`, {}, {
//           headers: { Authorization: `Bearer ${user.token}` }
//         });

//         setAppointments(appointments.map(apt => 
//           apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
//         ));
//         addToast('Appointment cancelled successfully!', 'success');
//       } catch (error) {
//         addToast('Failed to cancel appointment', 'error', error.response?.data?.message);
//       }
//     }
//   };

//   // Update appointment
//   const handleUpdate = async (appointmentId, updatedData) => {
//     try {
//       const response = await axiosInstance.put(`/api/appointments/${appointmentId}`, updatedData, {
//         headers: { Authorization: `Bearer ${user.token}` }
//       });

//       setAppointments(appointments.map(apt => 
//         apt._id === appointmentId ? response.data : apt
//       ));
//       addToast('Appointment updated successfully!', 'success');
//     } catch (error) {
//       addToast('Failed to update appointment', 'error', error.response?.data?.message);
//     }
//   };

//   // Status colors
//   const getStatusColor = (status) => {
//     const colors = {
//       'scheduled': 'bg-blue-100 text-blue-800',
//       'confirmed': 'bg-green-100 text-green-800',
//       'cancelled': 'bg-red-100 text-red-800',
//       'completed': 'bg-gray-100 text-gray-800',
//       'no-show': 'bg-orange-100 text-orange-800'
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   // Filter appointments
//   const upcomingAppointments = appointments.filter(apt => 
//     new Date(apt.appointmentDate) > new Date() && apt.status !== 'cancelled' && apt.status !== 'completed'
//   );

//   const pastAppointments = appointments.filter(apt => 
//     new Date(apt.appointmentDate) <= new Date() || apt.status === 'cancelled' || apt.status === 'completed'
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading appointments...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
//               <p className="text-gray-600 text-sm mt-1">Manage your medical appointments</p>
//             </div>
//             <button 
//               onClick={() => setShowModal(true)}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
//             >
//               Book Appointment
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-4">
//         {/* Upcoming Appointments */}
//         <div className="mb-8">
//           <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>
//           {upcomingAppointments.length === 0 ? (
//             <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
//               <p className="text-gray-500">No upcoming appointments</p>
//             </div>
//           ) : (
//             <div className="grid gap-4">
//               {upcomingAppointments.map((appointment) => (
//                 <AppointmentCard 
//                   key={appointment._id}
//                   appointment={appointment}
//                   onCancel={handleCancel}
//                   onUpdate={handleUpdate}
//                   isPast={false}
//                 />
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Past Appointments */}
//         <div>
//           <h2 className="text-xl font-bold text-gray-900 mb-4">Past Appointments</h2>
//           {pastAppointments.length === 0 ? (
//             <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
//               <p className="text-gray-500">No past appointments</p>
//             </div>
//           ) : (
//             <div className="grid gap-4">
//               {pastAppointments.map((appointment) => (
//                 <AppointmentCard 
//                   key={appointment._id}
//                   appointment={appointment}
//                   onCancel={handleCancel}
//                   onUpdate={handleUpdate}
//                   isPast={true}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Book Appointment Modal */}
//       {showModal && (
//         <BookAppointmentModal
//           formData={formData}
//           doctors={sampleDoctors}
//           onChange={handleChange}
//           onSubmit={handleSubmit}
//           onClose={() => setShowModal(false)}
//         />
//       )}

//       {/* Toast Container */}
//       <ToastContainer toasts={toasts} removeToast={removeToast} />
//     </div>
//   );
// };

// // Appointment Card Component
// const AppointmentCard = ({ appointment, onCancel, onUpdate, isPast }) => {
//   const [showEdit, setShowEdit] = useState(false);
//   const [editData, setEditData] = useState({
//     appointmentDate: new Date(appointment.appointmentDate).toISOString().split('T')[0],
//     appointmentTime: new Date(appointment.appointmentDate).toTimeString().split(':').slice(0, 2).join(':'),
//     duration: appointment.duration,
//     reason: appointment.reason,
//     notes: appointment.notes
//   });

//   const handleEditChange = (e) => {
//     setEditData({
//       ...editData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleEditSubmit = () => {
//     const appointmentDateTime = new Date(`${editData.appointmentDate}T${editData.appointmentTime}`);
//     onUpdate(appointment._id, {
//       appointmentDate: appointmentDateTime.toISOString(),
//       duration: parseInt(editData.duration),
//       reason: editData.reason,
//       notes: editData.notes
//     });
//     setShowEdit(false);
//   };

//   const canCancel = !isPast && appointment.status === 'scheduled';
//   const canEdit = !isPast && appointment.status === 'scheduled';

//   return (
//     <div className="bg-white rounded-lg border border-gray-300 p-4">
//       <div className="flex justify-between items-start mb-3">
//         <div>
//           <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
//           <p className="text-gray-600">{appointment.doctorSpecialization}</p>
//           <p className="text-gray-500 text-sm mt-1">{appointment.reason}</p>
//         </div>
//         <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
//           {appointment.status}
//         </span>
//       </div>

//       <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
//         <div>
//           <strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}
//         </div>
//         <div>
//           <strong>Time:</strong> {new Date(appointment.appointmentDate).toLocaleTimeString()}
//         </div>
//         <div>
//           <strong>Duration:</strong> {appointment.duration} minutes
//         </div>
//         <div>
//           <strong>Status:</strong> <span className="capitalize">{appointment.status}</span>
//         </div>
//       </div>

//       {appointment.notes && (
//         <p className="text-sm text-gray-600 mb-3">
//           <strong>Notes:</strong> {appointment.notes}
//         </p>
//       )}

//       {!isPast && (
//         <div className="flex gap-2">
//           {canEdit && (
//             <button
//               onClick={() => setShowEdit(!showEdit)}
//               className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
//             >
//               {showEdit ? 'Cancel Edit' : 'Edit'}
//             </button>
//           )}
//           {canCancel && (
//             <button
//               onClick={() => onCancel(appointment._id)}
//               className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       )}

//       {showEdit && (
//         <div className="mt-4 p-3 bg-gray-50 rounded-lg">
//           <div className="grid grid-cols-2 gap-3 mb-3">
//             <div>
//               <label className="block text-sm font-medium mb-1">Date</label>
//               <input
//                 type="date"
//                 name="appointmentDate"
//                 value={editData.appointmentDate}
//                 onChange={handleEditChange}
//                 className="w-full px-2 py-1 border rounded text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Time</label>
//               <input
//                 type="time"
//                 name="appointmentTime"
//                 value={editData.appointmentTime}
//                 onChange={handleEditChange}
//                 className="w-full px-2 py-1 border rounded text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Duration (min)</label>
//               <input
//                 type="number"
//                 name="duration"
//                 value={editData.duration}
//                 onChange={handleEditChange}
//                 className="w-full px-2 py-1 border rounded text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Reason</label>
//               <input
//                 type="text"
//                 name="reason"
//                 value={editData.reason}
//                 onChange={handleEditChange}
//                 className="w-full px-2 py-1 border rounded text-sm"
//               />
//             </div>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={handleEditSubmit}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
//             >
//               Save Changes
//             </button>
//             <button
//               onClick={() => setShowEdit(false)}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Book Appointment Modal Component
// const BookAppointmentModal = ({ formData, doctors, onChange, onSubmit, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
//           <button 
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             ✕
//           </button>
//         </div>
        
//         <form onSubmit={onSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Select Doctor *
//             </label>
//             <select
//               name="doctorId"
//               value={formData.doctorId}
//               onChange={onChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             >
//               <option value="">Choose a doctor</option>
//               {doctors.map(doctor => (
//                 <option key={doctor._id} value={doctor._id}>
//                   {doctor.name} - {doctor.specialization}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Date *
//               </label>
//               <input
//                 type="date"
//                 name="appointmentDate"
//                 value={formData.appointmentDate}
//                 onChange={onChange}
//                 min={new Date().toISOString().split('T')[0]}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Time *
//               </label>
//               <input
//                 type="time"
//                 name="appointmentTime"
//                 value={formData.appointmentTime}
//                 onChange={onChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Duration (minutes) *
//             </label>
//             <select
//               name="duration"
//               value={formData.duration}
//               onChange={onChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             >
//               <option value="15">15 minutes</option>
//               <option value="30">30 minutes</option>
//               <option value="45">45 minutes</option>
//               <option value="60">60 minutes</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Reason for Visit *
//             </label>
//             <input
//               type="text"
//               name="reason"
//               value={formData.reason}
//               onChange={onChange}
//               placeholder="Brief description of your visit"
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Additional Notes
//             </label>
//             <textarea
//               name="notes"
//               value={formData.notes}
//               onChange={onChange}
//               rows="3"
//               placeholder="Any additional information..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
          
//           <div className="flex gap-3 pt-4">
//             <button
//               type="submit"
//               className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium"
//             >
//               Book Appointment
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors font-medium"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Appointments;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ToastContainer from '../components/ToastContainer';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample doctors data (same approach as prescriptions)
  const sampleDoctors = [
    { _id: '1', name: 'Dr. Sarah Johnson', specialization: 'Cardiology' },
    { _id: '2', name: 'Dr. Michael Chen', specialization: 'Pediatrics' },
    { _id: '3', name: 'Dr. Emily Davis', specialization: 'Dermatology' },
    { _id: '4', name: 'Dr. Robert Wilson', specialization: 'Neurology' },
    { _id: '5', name: 'Dr. Lisa Martinez', specialization: 'Orthopedics' },
    { _id: '6', name: 'Dr. James Brown', specialization: 'General Medicine' }
  ];

  // Status colors function - MOVED HERE and exported
  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-gray-100 text-gray-800',
      'no-show': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Toast management
  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Form state
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    reason: '',
    notes: ''
  });

  // Fetch appointments from database
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/appointments/my-appointments', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        addToast('Failed to load appointments', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Create appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      
      // Find selected doctor from sample data
      const selectedDoctor = sampleDoctors.find(doc => doc._id === formData.doctorId);
      
      if (!selectedDoctor) {
        addToast('Please select a doctor', 'error');
        return;
      }
      
      const appointmentData = {
        doctorId: selectedDoctor._id,
        doctorName: selectedDoctor.name,
        doctorSpecialization: selectedDoctor.specialization,
        appointmentDate: appointmentDateTime.toISOString(),
        duration: parseInt(formData.duration),
        reason: formData.reason,
        notes: formData.notes
      };

      const response = await axiosInstance.post('/api/appointments', appointmentData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setAppointments([response.data, ...appointments]);
      addToast('Appointment booked successfully!', 'success');
      setShowModal(false);
      setFormData({
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        duration: 30,
        reason: '',
        notes: ''
      });
    } catch (error) {
      console.error('Appointment booking error:', error);
      addToast('Failed to book appointment', 'error', error.response?.data?.message);
    }
  };

  // Cancel appointment
  const handleCancel = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axiosInstance.put(`/api/appointments/${appointmentId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        setAppointments(appointments.map(apt => 
          apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
        ));
        addToast('Appointment cancelled successfully!', 'success');
      } catch (error) {
        addToast('Failed to cancel appointment', 'error', error.response?.data?.message);
      }
    }
  };

  // Update appointment
  const handleUpdate = async (appointmentId, updatedData) => {
    try {
      const response = await axiosInstance.put(`/api/appointments/${appointmentId}`, updatedData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setAppointments(appointments.map(apt => 
        apt._id === appointmentId ? response.data : apt
      ));
      addToast('Appointment updated successfully!', 'success');
    } catch (error) {
      addToast('Failed to update appointment', 'error', error.response?.data?.message);
    }
  };

  // Filter appointments
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate) > new Date() && apt.status !== 'cancelled' && apt.status !== 'completed'
  );

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.appointmentDate) <= new Date() || apt.status === 'cancelled' || apt.status === 'completed'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your medical appointments</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Upcoming Appointments */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
              <p className="text-gray-500">No upcoming appointments</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment._id}
                  appointment={appointment}
                  onCancel={handleCancel}
                  onUpdate={handleUpdate}
                  isPast={false}
                  getStatusColor={getStatusColor} // PASS FUNCTION AS PROP
                />
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Past Appointments</h2>
          {pastAppointments.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
              <p className="text-gray-500">No past appointments</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pastAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment._id}
                  appointment={appointment}
                  onCancel={handleCancel}
                  onUpdate={handleUpdate}
                  isPast={true}
                  getStatusColor={getStatusColor} // PASS FUNCTION AS PROP
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <BookAppointmentModal
          formData={formData}
          doctors={sampleDoctors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

// Appointment Card Component - UPDATED to accept getStatusColor as prop
const AppointmentCard = ({ appointment, onCancel, onUpdate, isPast, getStatusColor }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    appointmentDate: new Date(appointment.appointmentDate).toISOString().split('T')[0],
    appointmentTime: new Date(appointment.appointmentDate).toTimeString().split(':').slice(0, 2).join(':'),
    duration: appointment.duration,
    reason: appointment.reason,
    notes: appointment.notes
  });

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = () => {
    const appointmentDateTime = new Date(`${editData.appointmentDate}T${editData.appointmentTime}`);
    onUpdate(appointment._id, {
      appointmentDate: appointmentDateTime.toISOString(),
      duration: parseInt(editData.duration),
      reason: editData.reason,
      notes: editData.notes
    });
    setShowEdit(false);
  };

  const canCancel = !isPast && appointment.status === 'scheduled';
  const canEdit = !isPast && appointment.status === 'scheduled';

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{appointment.doctorName}</h3>
          <p className="text-gray-600">{appointment.doctorSpecialization}</p>
          <p className="text-gray-500 text-sm mt-1">{appointment.reason}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
        <div>
          <strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}
        </div>
        <div>
          <strong>Time:</strong> {new Date(appointment.appointmentDate).toLocaleTimeString()}
        </div>
        <div>
          <strong>Duration:</strong> {appointment.duration} minutes
        </div>
        <div>
          <strong>Status:</strong> <span className="capitalize">{appointment.status}</span>
        </div>
      </div>

      {appointment.notes && (
        <p className="text-sm text-gray-600 mb-3">
          <strong>Notes:</strong> {appointment.notes}
        </p>
      )}

      {!isPast && (
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={() => setShowEdit(!showEdit)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
            >
              {showEdit ? 'Cancel Edit' : 'Edit'}
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(appointment._id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {showEdit && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="appointmentDate"
                value={editData.appointmentDate}
                onChange={handleEditChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <input
                type="time"
                name="appointmentTime"
                value={editData.appointmentTime}
                onChange={handleEditChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (min)</label>
              <input
                type="number"
                name="duration"
                value={editData.duration}
                onChange={handleEditChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <input
                type="text"
                name="reason"
                value={editData.reason}
                onChange={handleEditChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleEditSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              Save Changes
            </button>
            <button
              onClick={() => setShowEdit(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Book Appointment Modal Component
const BookAppointmentModal = ({ formData, doctors, onChange, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Doctor *
            </label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={onChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) *
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Visit *
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={onChange}
              placeholder="Brief description of your visit"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={onChange}
              rows="3"
              placeholder="Any additional information..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors font-medium"
            >
              Book Appointment
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

export default Appointments;