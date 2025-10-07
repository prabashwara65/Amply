namespace Amply.Server.Dtos
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string AccessToken { get; set; } = string.Empty;
        public String Email { get; set; } = String.Empty;
        public String UserId { get; set; } = String.Empty;
        public String Message { get; set; } = String.Empty;
        public String Role { get; set; } = String.Empty; 
    }
}
