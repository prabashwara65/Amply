using System.ComponentModel.DataAnnotations;

namespace Amply.Server.Dtos
{
    public class RegisterRequest
    {
        [Required, EmailAddress]
        public String Email { get; set; } = String.Empty;
        public String UserName { get; set; } = String.Empty;
        [Required]
        public String FullName { get; set; } = String.Empty;
        [Required, DataType(DataType.Password)]
        public String Password { get; set; } = String.Empty;
        [Required, DataType(DataType.Password), Compare(nameof(Password), ErrorMessage = "Password Do not match")]
        public String ConfirmPassword {  get; set; } = String.Empty;
    }
}
