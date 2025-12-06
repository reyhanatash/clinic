namespace Clinic.Api.Application.DTOs.Users
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string SecretCode { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string UserName { get; set; }
    }
}
