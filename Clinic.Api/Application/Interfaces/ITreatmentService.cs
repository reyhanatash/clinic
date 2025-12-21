using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Treatments;
using Clinic.Api.Domain.Entities;

namespace Clinic.Api.Application.Interfaces
{
    public interface ITreatmentService
    {
        Task<GlobalResponse> CreateAppointmentAsync(CreateAppointmentDto model);
        Task<GlobalResponse> DeleteAppointment(int id);
        Task<IEnumerable<GetAppointmentsResponse>> GetAppointments(GetAppointmentsDto model);
        Task<IEnumerable<TreatmentsContext>> GetTreatments(int appointmentId);
        Task<GlobalResponse> DeleteTreatment(int id);
        Task<IEnumerable<GetTodayAppointmentsInfoDto>> GetTodayAppointments(GetTodayAppointmentsDto model);
        Task<GlobalResponse> SaveAppointmentType(SaveAppointmentTypeDto model);
        Task<IEnumerable<GetAppointmentTypesResponse>> GetAppointmentTypes();
        Task<GlobalResponse> DeleteAppointmentType(int id);
        Task<List<GetTodayAppointmentsInfoDto>> GetWeekAppointments(GetAppointmentsDto model);
        Task<IEnumerable<GetBillableItemsResponse>> GetBillableItems();
        Task<GlobalResponse> SaveBillableItem(SaveBillableItemsDto model);
        Task<GlobalResponse> DeleteBillableItem(int id);
        Task<IEnumerable<SectionsContext>> GetSectionPerService(int serviceId);
        Task<IEnumerable<QuestionsContext>> GetQuestionsPerSection(int sectionId);
        Task<IEnumerable<AnswersContext>> GetAnswersPerQuestion(int questionId);
        Task<IEnumerable<GetServicesPerPatientResponse>> GetPatientServices(int patinetId);
        Task<IEnumerable<GetPatientTreatmentsResponse>> GetPatientTreatments(int patientId);
        Task<IEnumerable<ItemCategoriesContext>> GetItemCategory();
        Task<GlobalResponse> SaveItemCategory(SaveItemCategoryDto model);
        Task<GlobalResponse> DeleteItemCategory(int id);
        Task<IEnumerable<TreatmentTemplatesContext>> GetTreatmentTemplates(GetTreatmentTemplateDto model);
        Task<GlobalResponse> SavePatientArrived(int appointmentId);
        Task<GlobalResponse> CancelAppointment(int appointmentId);
        Task<GlobalResponse> SaveTreatmentTemplate(SaveTreatmentTemplateDto model);
        Task<IEnumerable<TreatmentTemplatesContext>> GetTreatmentTemplates();
        Task<GlobalResponse> DeleteTreatmentTemplate(int id);
    }
}
