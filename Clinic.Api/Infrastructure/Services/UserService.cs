using AutoMapper;
using Clinic.Api.Application.DTOs;
using Clinic.Api.Application.DTOs.Users;
using Clinic.Api.Application.Interfaces;
using Clinic.Api.Domain.Entities;
using Clinic.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Clinic.Api.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _uow;
        private readonly ITokenService _token;
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher<UserContext> _passwordHasher;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;
        private readonly IReadTokenClaims _claims;

        public UserService(IUnitOfWork uow,
            ITokenService token,
            ApplicationDbContext context,
            IPasswordHasher<UserContext> passwordHasher,
            IHttpContextAccessor httpContextAccessor,
            IMapper mapper,
            IReadTokenClaims claims
            )
        {
            _uow = uow;
            _token = token;
            _context = context;
            _passwordHasher = passwordHasher;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
            _claims = claims;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync() =>
            (await _uow.Users.GetAllAsync()).Select(u => new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                RoleId = u.RoleId
            });

        public async Task<IEnumerable<UserContext>> GetByIdAsync(int id)
        {
            try
            {
                var u = await _context.Users.Where(u => u.Id == id).ToListAsync();
                return u;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<UserContext>> GetUsers(int roleId)
        {
            try
            {
                var result = await _context.Users.Where(u => u.RoleId == roleId).ToListAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<LoginResponseDto> LoginAsync(LoginUserDto model)
        {
            try
            {
                var user = await _context.Users
              .FirstOrDefaultAsync(u => u.Email == model.Username);

                if (user == null)
                    throw new Exception("Invalid username or password.");

                var verify = _passwordHasher.VerifyHashedPassword(
                    user,
                    user.Password,
                    model.Password
                );

                if (verify != PasswordVerificationResult.Success)
                    throw new Exception("Invalid username or password.");

                var roleName = await _context.Roles
                    .Where(r => r.Id == user.RoleId)
                    .Select(r => r.Name)
                    .FirstOrDefaultAsync() ?? string.Empty;

                var secret = await _context.Roles
                    .Where(r => r.Id == user.RoleId)
                    .Select(r => r.Secret)
                    .FirstOrDefaultAsync() ?? string.Empty;

                var token = _token.CreateToken(user, roleName);

                await SaveLoginHistory(model.Username);

                return new LoginResponseDto
                {
                    Token = token,
                    SecretCode = secret,
                    Role = roleName,
                    UserName = $"{user.FirstName} {user.LastName}",
                    Secret = secret
                };
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteAsync(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var user = await _uow.Users.GetByIdAsync(id);
                if (user == null) throw new Exception("user not found");

                _context.Users.Remove(user);
                await _uow.SaveAsync();
                result.Message = "User Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<bool> AssignRoleAsync(int userId, int roleId)
        {
            try
            {
                var user = await _uow.Users.GetByIdAsync(userId);
                if (user == null) return false;

                user.RoleId = roleId;
                await _uow.SaveAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> CreateUserAsync(CreateUserDto model)
        {
            var response = new GlobalResponse();

            try
            {
                var existingUser = await _context.Users
              .FirstOrDefaultAsync(u => u.Email == model.Username);

                if (existingUser != null)
                    throw new Exception("Email already exists.");

                var user = new UserContext
                {
                    Email = model.Username,
                    FirstName = model.FirstName,
                    LastName = model.LastName,
                    RoleId = model.RoleId,
                    IsActive = model.IsActive,
                    IsPractitioner = model.IsDoctor,
                    ShowTreatmentOnClickPatientName = model.ShowTreatmentOnClick,
                    CanChangeOldTreatment = model.CanChangeOldTreatment,
                    SuspendReservationDays = model.SuspendReservationDays,
                    OutOfRange = model.OutOfRangePatients,
                    Designation = model.DoctorSkill,
                    Description = model.Description,
                    TitleId = model.TitleId,
                    ShowInOnlineBookings = model.ShowInOnlineBookings,
                    LoadLastDataOnNewTreatment = model.LoadLastDataOnNewTreatment,
                    SMSEnabled = model.SMSEnabled,
                    CanConfirmInvoice = model.CanConfirmInvoice
                };

                user.Password = _passwordHasher.HashPassword(user, model.Password);

                await _uow.Users.AddAsync(user);
                await _uow.SaveAsync();

                var creatorId = _claims.GetUserId();

                if (!string.IsNullOrEmpty(model.BusinessIds))
                {
                    var businessIds = model.BusinessIds
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(int.Parse)
                        .ToList();

                    foreach (var businessId in businessIds)
                    {
                        var ub = new UserBusinessesContext
                        {
                            BusinessId = businessId,
                            User_Id = user.Id,
                            CreatorId = creatorId,
                            CreatedOn = DateTime.Now,
                            IsActive = true
                        };

                        await _context.UserBusinesses.AddAsync(ub);
                    }
                }

                if (!string.IsNullOrEmpty(model.AppointmentTypesIds))
                {
                    var typeIds = model.AppointmentTypesIds
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(int.Parse)
                        .ToList();

                    foreach (var typeId in typeIds)
                    {
                        var pt = new AppointmentTypePractitionersContext
                        {
                            AppointmentTypeId = typeId,
                            PractitionerId = user.Id,
                            CreatorId = creatorId,
                            CreatedOn = DateTime.Now,
                            IsActive = true
                        };

                        await _context.AppointmentTypePractitioners.AddAsync(pt);
                    }
                }

                await _context.SaveChangesAsync();

                response.Status = 0;
                response.Data = user.Id;
                return response;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> UpdateUserAsync(UpdateUserDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var user = await _uow.Users.GetByIdAsync(model.Id);
                if (user == null) throw new Exception("User Not Exists");

                var creatorId = _claims.GetUserId();

                if (!string.IsNullOrEmpty(model.BusinessIds))
                {
                    var businessIds = model.BusinessIds
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(id => int.Parse(id.Trim()))
                        .ToList();

                    foreach (var businessId in businessIds)
                    {
                        var userBusiness = new UserBusinessesContext
                        {
                            BusinessId = businessId,
                            User_Id = user.Id,
                            ModifierId = creatorId,
                            LastUpdated = DateTime.Now,
                            IsActive = true
                        };
                        await _context.UserBusinesses.AddAsync(userBusiness);
                    }
                }

                if (!string.IsNullOrEmpty(model.AppointmentTypesIds))
                {
                    var appointmentTypeIds = model.AppointmentTypesIds
                        .Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(id => int.Parse(id.Trim()))
                        .ToList();

                    foreach (var typeId in appointmentTypeIds)
                    {
                        var practitionerType = new AppointmentTypePractitionersContext
                        {
                            AppointmentTypeId = typeId,
                            PractitionerId = user.Id,
                            ModifierId = creatorId,
                            LastUpdated = DateTime.Now,
                            IsActive = true
                        };
                        await _context.AppointmentTypePractitioners.AddAsync(practitionerType);
                    }
                }

                _mapper.Map(model, user);

                if (!string.IsNullOrWhiteSpace(model.Username) || !string.IsNullOrWhiteSpace(model.Password))
                {
                    user.Email = model.Username.Trim();
                    user.Password = _passwordHasher.HashPassword(user, model.Password);
                }
                else
                {
                    _context.Entry(user).Property(x => x.Email).IsModified = false;
                    _context.Entry(user).Property(x => x.Password).IsModified = false;
                }
        
                _context.Users.Update(user);
                await _uow.SaveAsync();

                result.Status = 0;
                result.Message = "User Updated Successfully";
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto model)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Username);
                if (user == null)
                    throw new Exception("User not found");

                var passwordVerification = _passwordHasher.VerifyHashedPassword(user, user.Password, model.OldPassword);
                if (passwordVerification != PasswordVerificationResult.Success)
                    throw new Exception("Old password is incorrect");

                user.Password = _passwordHasher.HashPassword(user, model.NewPassword);
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task SaveLoginHistory(string? Username)
        {
            try
            {
                var ip = GetClientIp();
                var loginHistoryModel = new SaveLoginHistoryDto
                {
                    UserName = Username,
                    Ip = ip,
                    LoginDateTime = DateTime.Now,
                    HostName = ip
                };

                var history = _mapper.Map<LoginHistoriesContext>(loginHistoryModel);
                _context.LoginHistories.Add(history);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public string GetClientIp()
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null)
                return "Unknown";

            var forwardedIp = context.Request.Headers["MC-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedIp))
                return forwardedIp;

            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        public async Task<GlobalResponse> SaveUserBusiness(SaveUserBusinessDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _claims.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var userBusiness = _mapper.Map<UserBusinessesContext>(model);
                    userBusiness.CreatorId = userId;
                    userBusiness.CreatedOn = DateTime.Now;
                    userBusiness.PractitionerId = 0;
                    userBusiness.IsActive = true;
                    userBusiness.User_Id = model.UserId;
                    _context.UserBusinesses.Add(userBusiness);
                    await _context.SaveChangesAsync();
                    result.Message = "User Business Saved Successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingBusiness = await _context.UserBusinesses.FirstOrDefaultAsync(j => j.Id == model.EditOrNew);
                    if (existingBusiness == null)
                    {
                        throw new Exception("User Business Not Found");
                    }

                    _mapper.Map(model, existingBusiness);
                    existingBusiness.ModifierId = userId;
                    existingBusiness.LastUpdated = DateTime.Now;
                    _context.UserBusinesses.Update(existingBusiness);
                    await _context.SaveChangesAsync();
                    result.Message = "User Business Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<UserBusinessesContext>> GetUserBusiness(int userId)
        {
            try
            {
                var res = await _context.UserBusinesses.Where(s => s.User_Id == userId).ToListAsync();
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<RolesContext>> GetRoles()
        {
            try
            {
                var res = await _context.Roles.ToListAsync();
                return res;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> SaveUserRole(SaveUserRoleDto model)
        {
            var result = new GlobalResponse();

            try
            {
                var userId = _claims.GetUserId();

                if (model.EditOrNew == -1)
                {
                    var userRole = _mapper.Map<RolesContext>(model);
                    userRole.CreatorId = userId;
                    userRole.CreatedOn = DateTime.Now;
                    _context.Roles.Add(userRole);
                    await _context.SaveChangesAsync();
                    result.Message = "User Role Saved Successfully";
                    result.Status = 0;
                    return result;
                }
                else
                {
                    var existingUserRole = await _context.Roles.FirstOrDefaultAsync(j => j.Id == model.EditOrNew);
                    if (existingUserRole == null)
                    {
                        throw new Exception("User Role Not Found");
                    }

                    _mapper.Map(model, existingUserRole);
                    existingUserRole.ModifierId = userId;
                    existingUserRole.LastUpdated = DateTime.Now;
                    _context.Roles.Update(existingUserRole);
                    await _context.SaveChangesAsync();
                    result.Message = "User Role Updated Successfully";
                    result.Status = 0;
                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<GlobalResponse> DeleteRole(int id)
        {
            var result = new GlobalResponse();

            try
            {
                var role = await _context.Roles.FindAsync(id);

                if (role == null)
                    throw new Exception("Role Not Found");

                _context.Roles.Remove(role);
                await _context.SaveChangesAsync();
                result.Message = "Role Deleted Successfully";
                result.Status = 0;
                return result;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<RolesContext>> GetUserRole()
        {
            try
            {
                var userRole = _claims.GetUserRole();

                var role = await _context.Roles.Where(r => r.Name == userRole).ToListAsync();
                return role;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
