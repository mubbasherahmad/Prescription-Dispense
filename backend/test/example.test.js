const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const app = require('../server'); 
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Prescription = require('../models/Prescription');
const { createPrescription, listPrescriptions } = require('../controllers/prescriptionController');
const { expect } = chai;

chai.use(chaiHttp);
let server;
let port;


describe('CreatePrescription Function Test', () => {

  it('should create a new prescription successfully', async () => {
    // Mock request data
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: { 
        patientName: "John Doe", 
        patientAge: 35, 
        medications: [{ name: "Aspirin", dosage: "100mg", frequency: "Daily", duration: "7 days" }], 
        notes: "Take with food" 
      }
    };

    // Mock prescription that would be created
    const createdPrescription = { 
      _id: new mongoose.Types.ObjectId(), 
      ...req.body, 
      user: req.user._id,
      save: sinon.stub().resolvesThis()
    };

    // Stub Prescription constructor to return the mock prescription
    const PrescriptionStub = sinon.stub().returns(createdPrescription);
    sinon.replace(Prescription, 'constructor', PrescriptionStub);

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await createPrescription(req, res);

    // Assertions
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdPrescription)).to.be.true;

    // Restore stubbed methods
    sinon.restore();
  });

  it('should return 400 if required fields are missing', async () => {
    // Mock request data with missing fields
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: { patientName: "John Doe" } // Missing required fields
    };

    // Mock response object
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    // Call function
    await createPrescription(req, res);

    // Assertions
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Please provide all required fields' })).to.be.true;
  });

});


describe('ListPrescriptions Function Test', () => {

  it('should return prescriptions for the given user', async () => {
    // Mock user ID
    const userId = new mongoose.Types.ObjectId();

    // Mock prescription data
    const prescriptions = [
      { _id: new mongoose.Types.ObjectId(), patientName: "John Doe", user: userId },
      { _id: new mongoose.Types.ObjectId(), patientName: "Jane Smith", user: userId }
    ];

    // Stub Prescription.find to return mock prescriptions
    const findStub = sinon.stub(Prescription, 'find').resolves(prescriptions);

    // Mock request & response
    const req = { user: { _id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };

    // Call function
    await listPrescriptions(req, res);

    // Assertions
    expect(findStub.calledOnceWith({ user: userId })).to.be.true;
    expect(res.json.calledWith(prescriptions)).to.be.true;

    // Restore stubbed methods
    findStub.restore();
  });

});