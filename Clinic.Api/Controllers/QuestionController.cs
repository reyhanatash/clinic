using Clinic.Api.Application.DTOs.Questions;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionController : ControllerBase
    {
        private readonly IQuestionService _questionsService;

        public QuestionController(IQuestionService questionsService)
        {
            _questionsService = questionsService;
        }

        [HttpGet("getQuestions")]
        [Authorize]
        public async Task<IActionResult> GetQuestions()
        {
            var result = await _questionsService.GetQuestions();
            return Ok(result);
        }

        [HttpPost("saveQuestionValue")]
        [Authorize]
        public async Task<IActionResult> SaveQuestionValue(SaveQuestionValueDto model)
        {
            var result = await _questionsService.SaveQuestionValue(model);
            return Ok(result);
        }

        [HttpGet("deleteQuestionValue/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteQuestionValue(int id)
        {
            var result = await _questionsService.DeleteQuestionValue(id);
            return Ok(result);
        }

        [HttpPost("saveQuestion")]
        [Authorize]
        public async Task<IActionResult> SaveQuestion(SaveQuestionDto model)
        {
            var result = await _questionsService.SaveQuestion(model);
            return Ok(result);
        }

        [HttpGet("deleteQuestion/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var result = await _questionsService.DeleteQuestion(id);
            return Ok(result);
        }
    }
}
