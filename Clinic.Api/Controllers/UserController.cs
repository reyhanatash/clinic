using Clinic.Api.Application.DTOs.Users;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly IUserService _svc;
    public UserController(IUserService svc) => _svc = svc;

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginUserDto model)
    {
        try
        {
            var result = await _svc.LoginAsync(model);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
    }

    [HttpGet("getAllUsers")]
    [Authorize("Admin","Secretary-Reception")]
    public async Task<IActionResult> GetAll() => Ok(await _svc.GetAllAsync());

    [HttpGet("getUserById/{id}")]
    [Authorize("Admin", "Secretary-Reception")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _svc.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpGet("getUsers/{roleId}")]
    [Authorize("Admin","Secretary-Reception","Doctor")]
    public async Task<IActionResult> GetUsers(int roleId)
    {
        var result = await _svc.GetUsers(roleId);
        return Ok(result);
    }

    [HttpGet("deleteUser/{id}")]
    [Authorize("Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _svc.DeleteAsync(id);
        return Ok(result);
    }

    [HttpPost("createUser")]
    [Authorize("Admin")]
    public async Task<IActionResult> CreateUser(CreateUserDto model)
    {
            var result = await _svc.CreateUserAsync(model);
            return Ok(result);
    }

    [HttpPut("updateUser")]
    [Authorize("Admin", "Secretary-Reception")]
    public async Task<IActionResult> UpdateUser(UpdateUserDto model)
    {
        var result = await _svc.UpdateUserAsync(model);
        return Ok(result);
    }

    [HttpPut("assignRole")]
    [Authorize("Admin", "Secretary-Reception")]
    public async Task<IActionResult> AssignRoleToUser(AssignRoleDto model)
    {
        var result = await _svc.AssignRoleAsync(model.UserId, model.RoleId);
        return result ? Ok("Role assigned successfully.") : NotFound("User not found.");
    }

    [HttpPost("forgotPassword")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
    {
        var result = await _svc.ForgotPasswordAsync(model);
        return Ok(new { success = result, message = "Password updated successfully" });
    }

    [HttpPost("saveUserBusiness")]
    [Authorize("Admin","Secretary-Reception")]
    public async Task<IActionResult> SaveUserBusiness(SaveUserBusinessDto model)
    {
        var result = await _svc.SaveUserBusiness(model);
        return Ok(result);
    }

    [HttpGet("getUserBusiness/{userId}")]
    [Authorize("Admin", "Secretary-Reception")]
    public async Task<IActionResult> GetUserBusiness(int userId)
    {
        var result = await _svc.GetUserBusiness(userId);
        return Ok(result);
    }

    [HttpGet("getRoles")]
    [Authorize("Admin","Secretary","Doctor")]
    public async Task<IActionResult> GetRoles()
    {
        var result = await _svc.GetRoles();
        return Ok(result);
    }

    [HttpPost("saveUserRole")]
    [Authorize]
    public async Task<IActionResult> SaveUserRole(SaveUserRoleDto model)
    {
        var result = await _svc.SaveUserRole(model);
        return Ok(result);
    }

    [HttpGet("deleteRole/{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteRole(int id)
    {
        var result = await _svc.DeleteRole(id);
        return Ok(result);
    }

    [HttpGet("getUserRole")]
    [Authorize]
    public async Task<IActionResult> GetUserRole()
    {
        var result = await _svc.GetUserRole();
        return Ok(result);
    }
}