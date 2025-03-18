using System.Text.Json.Serialization;

namespace Server.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Salt { get; set; }
        public string Role { get; set; }

        [JsonIgnore]
        public string? ResetOtp { get; set; }
        [JsonIgnore]
        public DateTime? OtpExpiry { get; set; }

        private bool _isApproved;

        [JsonIgnore]
        public bool IsApproved
        {
            get => _isApproved;
            set => _isApproved = value;
        }
    }
}
