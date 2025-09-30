using System.ComponentModel.DataAnnotations;

namespace Amply.Server.Dtos
{
    public class LoginRequest
    {
        [Required, EmailAddress]
        public String Email { get; set; } = String.Empty;

        [Required, DataType(DataType.Password)]
        public String Password { get; set; } = String.Empty;
    }
}
