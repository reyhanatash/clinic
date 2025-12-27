using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Questions;
using Clinic.Api.Domain.Entities;

namespace Clinic.Api.Application.Interfaces
{
    public interface IQuestionService
    {
        Task<IEnumerable<QuestionsContext>> GetQuestions();
        Task<GlobalResponse> SaveQuestionValue(SaveQuestionValueDto model);
        Task<GlobalResponse> DeleteQuestionValue(int id);
        Task<GlobalResponse> SaveQuestion(SaveQuestionDto model);
        Task<GlobalResponse> DeleteQuestion(int id);
    }
}
