namespace Amply.Server.Dtos
{
    public class RegisterResponse
    {
        public String Message { get; set; } = String.Empty;
        public bool success { get; set; }
        public bool Success { get; internal set; }
    }
}
