using AutoMapper;
using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Questions;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Domain.Entities;
using Clinic.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Infrastructure.Services
{
    public class QuestionService : IQuestionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IReadTokenClaims _token;

        public QuestionService(ApplicationDbContext context, IMapper mapper, IReadTokenClaims token)
        {
            _context = context;
            _mapper = mapper;
            _token = token;
        }

        public async Task<IEnumerable<QuestionsContext>> GetQuestions()
        {
            try
            {
                var result = await _context.Questions.ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveQuestionValue(SaveQuestionValueDto model)
        {
            var result = new GlobalResponse();
            var userId = _token.GetUserId();

            try
            {
                var treatment = await _context.Treatments
           .Where(t => t.InvoiceItemId == model.InvoiceItemId)
           .Select(t => new { t.Id })
           .FirstOrDefaultAsync();

                if (treatment == null)
                    throw new Exception("Treatment Not Found For The Given InvoiceItemId");

                var treatmentId = treatment.Id;

                var existingValue = await _context.QuestionValues
           .FirstOrDefaultAsync(qv => qv.TreatmentId == treatmentId && qv.QuestionId == model.QuestionId);

                if (existingValue == null)
                {
                    var newValue = new QuestionValuesContext
                    {
                        TreatmentId = treatmentId,
                        QuestionId = model.QuestionId,
                        selectedValue = model.selectedValue,
                        AnswerId = model.AnswerId,
                        CreatorId = userId
                    };

                    _context.QuestionValues.Add(newValue);
                    await _context.SaveChangesAsync();

                    result.Status = 0;
                    result.Message = "Question Value Saved Successfully";
                }
                else
                {
                    existingValue.selectedValue = model.selectedValue;
                    existingValue.AnswerId = model.AnswerId;

                    _context.QuestionValues.Update(existingValue);
                    await _context.SaveChangesAsync();

                    result.Status = 0;
                    result.Message = "Question Value Updated Successfully";
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteQuestionValue(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var questionValue = await _context.QuestionValues.FindAsync(id);
                if (questionValue == null)
                    throw new Exception("Question Value Not Found");

                _context.QuestionValues.Remove(questionValue);
                await _context.SaveChangesAsync();
                result.Message = "QuestionValue Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveQuestion(SaveQuestionDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _token.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var question = _mapper.Map<QuestionsContext>(model);
                    _context.Questions.Add(question);
                    await _context.SaveChangesAsync();
                    result.Message = "Question Saved Successfully";
                    result.Status = 0;
                    result.Data = question.Id;
                    return result;
                }
                else
                {
                    var existingQuestion = await _context.Questions.FirstOrDefaultAsync(j => j.Id == model.EditOrNew);
                    if (existingQuestion == null)
                    {
                        throw new Exception("Job Not Found");
                    }

                    _mapper.Map(model, existingQuestion);
                    _context.Questions.Update(existingQuestion);
                    await _context.SaveChangesAsync();
                    result.Message = "Question Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteQuestion(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var question = await _context.Questions.FindAsync(id);
                if (question == null)
                    throw new Exception("Question Not Found");

                _context.Questions.Remove(question);
                await _context.SaveChangesAsync();
                result.Message = "Question Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
