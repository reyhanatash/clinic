using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Patients;
using Clinic.Api.Domain.Entities;

namespace Clinic.Api.Application.Interfaces
{
    public interface IPatientService
    {
        Task<GlobalResponse> SavePatient(SavePatientDto model);
        Task<GlobalResponse> DeletePatient(int id);
        Task<IEnumerable<PatientsContext>> GetPatients();
        Task<IEnumerable<GetPatientInfoResponse>> GetPatientById(int patientId);
        Task<GlobalResponse> SavePatientPhone(SavePatientPhoneDto model);
        Task<GlobalResponse> DeletePatientPhone(int id);
        Task<IEnumerable<PatientPhonesContext>> GetPatientPhones(int patientId);
        Task<IEnumerable<GetPatientAppointmentsResponse>> GetPatientAppointments(int patientId);
        Task<IEnumerable<InvoicesContext>> GetPatientInvoices(int patientId);
        Task<IEnumerable<ReceiptsContext>> GetPatientReceipts(int patientId);
        Task<IEnumerable<PaymentsContext>> GetPatientPayments(int patientId);
        Task<GlobalResponse> SaveAttachment(SaveAttachmentsDto model);
        Task<IEnumerable<FileAttachmentsContext>> GetAttachment(int patientId);
        Task<GlobalResponse> DeleteAttachment(int id);
        Task<GlobalResponse> GetFilteredPatients(GetFilteredPatientsDto model);
        Task<GlobalResponse> SavePatientField(SavePatientFieldDto model);
        Task<IEnumerable<PatientFieldsContext>> GetPatientField(int patientId);
        Task<IEnumerable<PatientFieldsContext>> GetPatientFields();
    }
}
