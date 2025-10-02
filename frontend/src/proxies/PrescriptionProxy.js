// Proxy Pattern: Controls access to sensitive prescription operations based on user role

// Real Subject: Actual prescription service
class PrescriptionService {
  constructor(axiosInstance, token) {
    this.axiosInstance = axiosInstance;
    this.token = token;
  }

  async deletePrescription(prescriptionId) {
    const response = await this.axiosInstance.delete(`/api/prescriptions/${prescriptionId}`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data;
  }
}

// Proxy: Controls access based on user role
class PrescriptionProxy {
  constructor(axiosInstance, token, userRole) {
    this.realService = new PrescriptionService(axiosInstance, token);
    this.userRole = userRole;
  }

  async deletePrescription(prescriptionId) {
    // Only admins can delete prescriptions
    if (this.userRole !== 'admin') {
      throw new Error('Access Denied: Only administrators can delete prescriptions');
    }
    console.log(`[Proxy] Access granted: Admin can delete prescription ${prescriptionId}`);
    return await this.realService.deletePrescription(prescriptionId);
  }
}

export { PrescriptionService, PrescriptionProxy };
