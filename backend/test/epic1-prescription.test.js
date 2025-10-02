const request = require('supertest');
const app = require('./test-server');
const testUtils = require('./setup');

describe('EPIC 1: Prescription Management', () => {
  let user, drug;

  beforeEach(async () => {
    user = await testUtils.createTestUser();
    drug = await testUtils.createTestDrug();
  });

  // Test 1: Create Prescription
  it('should create prescription (CREATE)', async () => {
    const response = await request(app)
      .post('/api/prescriptions')
      .send({
        patientName: 'John Doe',
        patientAge: 25,
        medications: [{
          name: drug.medicineName,
          dosage: '10 tablets',
          frequency: 'Once daily',
          duration: '7 days'
        }]
      });

    expect(response.status).toBe(201);
    expect(response.body.patientName).toBe('John Doe');
    expect(response.body.medications).toHaveLength(1);
  });

  // Test 2: Read Prescriptions - FIXED
  it('should list prescriptions (READ)', async () => {
    // Create prescription directly using the API (so it uses the mock user ID)
    const createResponse = await request(app)
      .post('/api/prescriptions')
      .send({
        patientName: 'Patient 1',
        patientAge: 30,
        medications: [{
          name: 'Drug A',
          dosage: '1 tab',
          frequency: 'daily',
          duration: '7 days'
        }]
      });

    expect(createResponse.status).toBe(201);

    // Now get the prescriptions
    const response = await request(app)
      .get('/api/prescriptions');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].patientName).toBe('Patient 1');
  });

  // Test 3: Update Prescription
  it('should update prescription (UPDATE)', async () => {
    // Create prescription via API
    const createResponse = await request(app)
      .post('/api/prescriptions')
      .send({
        patientName: 'Original',
        patientAge: 25,
        medications: [{
          name: 'Drug A',
          dosage: '1 tab',
          frequency: 'daily',
          duration: '7 days'
        }]
      });

    const prescriptionId = createResponse.body._id;

    const response = await request(app)
      .put(`/api/prescriptions/${prescriptionId}`)
      .send({ notes: 'Updated notes' });

    expect(response.status).toBe(200);
    expect(response.body.notes).toBe('Updated notes');
  });

  // Test 4: Delete Prescription
  it('should delete prescription (DELETE)', async () => {
    // Create prescription via API
    const createResponse = await request(app)
      .post('/api/prescriptions')
      .send({
        patientName: 'To Delete',
        patientAge: 25,
        medications: [{
          name: 'Drug A',
          dosage: '1 tab',
          frequency: 'daily',
          duration: '7 days'
        }]
      });

    const prescriptionId = createResponse.body._id;

    const response = await request(app)
      .delete(`/api/prescriptions/${prescriptionId}`);

    expect(response.status).toBe(200);
    
    // Verify it's deleted by trying to get it
    const getResponse = await request(app)
      .get('/api/prescriptions');

    expect(getResponse.body.length).toBe(0);
  });
});