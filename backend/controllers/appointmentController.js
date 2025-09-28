const Appointment = require('../models/Appointment');
const { createNotification } = require('./notificationController');

const createAppointment = async (req, res) => {
  try {
    const { doctorId, doctorName, doctorSpecialization, appointmentDate, duration, reason, notes } = req.body;
    
    if (!doctorId || !doctorName || !appointmentDate || !reason) {
      return res.status(400).json({ 
        message: 'Doctor selection, appointment date, and reason are required' 
      });
    }

    // Check if appointment date is in the future
    if (new Date(appointmentDate) <= new Date()) {
      return res.status(400).json({ message: 'Appointment date must be in the future' });
    }

    const appointment = new Appointment({
      patient: req.user._id,
      doctorId, // Sample doctor ID (string)
      doctorName, // Doctor name from sample data
      doctorSpecialization, // Specialization from sample data
      appointmentDate,
      duration: duration || 30,
      reason,
      notes
    });

    const savedAppointment = await appointment.save();
    
    // Create notification for patient
    await createNotification(
      req.user._id,
      'Appointment Booked',
      `Your appointment with ${doctorName} has been scheduled for ${new Date(appointmentDate).toLocaleString()}`,
      'appointment',
      savedAppointment._id
    );

    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .sort({ appointmentDate: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    const { appointmentDate, duration, reason, notes, status } = req.body;
    
    if (appointmentDate) {
      if (new Date(appointmentDate) <= new Date()) {
        return res.status(400).json({ message: 'Appointment date must be in the future' });
      }
      appointment.appointmentDate = appointmentDate;
    }
    
    if (duration) appointment.duration = duration;
    if (reason) appointment.reason = reason;
    if (notes !== undefined) appointment.notes = notes;
    if (status) appointment.status = status;

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Appointment is already cancelled' });
    }

    appointment.status = 'cancelled';
    const updatedAppointment = await appointment.save();
    
    // Create notification for patient
    await createNotification(
      req.user._id,
      'Appointment Cancelled',
      `Your appointment with ${appointment.doctorName} has been cancelled`,
      'appointment',
      appointment._id
    );

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove doctor-specific functions since we're using sample doctors
const getDoctorAppointments = async (req, res) => {
  res.json([]);
};

const confirmAppointment = async (req, res) => {
  res.status(400).json({ message: 'Feature not available with sample doctors' });
};

const completeAppointment = async (req, res) => {
  res.status(400).json({ message: 'Feature not available with sample doctors' });
};

module.exports = {
  createAppointment,
  getPatientAppointments,
  updateAppointment,
  cancelAppointment,
  getDoctorAppointments,
  confirmAppointment,
  completeAppointment
};