using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Users;
using Clinic.Api.Domain.Entities;

namespace Clinic.Api.Application.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllAsync();
        Task<IEnumerable<UserContext>> GetByIdAsync(int id);
        Task<LoginResponseDto> LoginAsync(LoginUserDto loginDto);
        Task<GlobalResponse> DeleteAsync(int id);
        Task<bool> AssignRoleAsync(int userId, int roleId);
        Task<GlobalResponse> CreateUserAsync(CreateUserDto model);
        Task<GlobalResponse> UpdateUserAsync(UpdateUserDto model);
        Task<bool> ForgotPasswordAsync(ForgotPasswordDto model);
        Task<IEnumerable<UserContext>> GetUsers(int roleId);
        Task<GlobalResponse> SaveUserBusiness(SaveUserBusinessDto model);
        Task<IEnumerable<UserBusinessesContext>> GetUserBusiness(int userId);
        Task<IEnumerable<RolesContext>> GetRoles();
        Task<GlobalResponse> SaveUserRole(SaveUserRoleDto model);
        Task<GlobalResponse> DeleteRole(int id);
        Task<IEnumerable<RolesContext>> GetUserRole();
    }
}
