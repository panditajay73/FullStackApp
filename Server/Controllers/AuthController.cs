using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Services;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;
        private readonly AuthService _authService;

        public AuthController(AppDbContext context, AuthService authService, EmailService emailService)
        {
            _context = context;
            _authService = authService;
            _emailService = emailService;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] User user)
        {
            if (_context.Users.Any(u => u.Username == user.Username))
                return BadRequest("User already exists");

            var (hash, salt) = _authService.HashPassword(user.PasswordHash);
            user.PasswordHash = hash;
            user.Salt = salt;
            user.Role = string.IsNullOrEmpty(user.Role) ? "User" : user.Role; // Default role
            user.IsApproved = user.Role == "User"; // Auto-approve Users, others need admin approval

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully.");
        }



        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest loginRequest)
        {
            var loginResult = _authService.Login(loginRequest.UsernameOrEmail, loginRequest.Password);

            if (loginResult == null)
            {
                return Unauthorized(new { message = "Invalid username/email or password" });
            }

            // Check if the user is approved
            var user = _context.Users.FirstOrDefault(u =>
                (u.Username == loginRequest.UsernameOrEmail || u.Email == loginRequest.UsernameOrEmail));

            if (user != null && !user.IsApproved)
            {
                return Unauthorized(new { message = "Your account is not approved by the admin." });
            }

            return Ok(new
            {
                token = loginResult.Value.Token,
                username = loginResult.Value.Username,
                role = loginResult.Value.Role
            });
        }


        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == request.Username);
            if (user == null)
                return NotFound("User not found.");

            if (!_authService.VerifyPassword(request.OldPassword, user.PasswordHash, user.Salt))
                return BadRequest("Old password is incorrect.");

            var (newHash, newSalt) = _authService.HashPassword(request.NewPassword);
            user.PasswordHash = newHash;
            user.Salt = newSalt;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok("Password changed successfully.");
        }
        [HttpGet("project-managers")]
        public async Task<IActionResult> GetProjectManagers()
        {
            var projectManagers = await _context.Users
                .Where(u => u.Role == "Project Manager")
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.IsApproved,
                    u.Role
                })
                .ToListAsync();

            if (projectManagers == null || !projectManagers.Any())
            {
                return NotFound("No Project Managers found.");
            }

            return Ok(projectManagers);
        }

        [HttpPost("toggle-approval/{id}")]
        public async Task<IActionResult> ToggleApproval(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null || user.Role != "Project Manager")
            {
                return NotFound("Project Manager not found.");
            }

            // Toggle the approval status
            user.IsApproved = !user.IsApproved;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            // Send email notification
            string status = user.IsApproved ? "activated" : "deactivated";
            string subject = "Account Approval Status Updated";
            string message = $"Dear {user.Username},\n\nYour login ID has been {status} by the admin.\n\nBest Regards,\nAdmin Team";

            _emailService.SendEmail(user.Email, subject, message);

            return Ok(new { message = $"User {user.Username} has been {status} successfully." });
        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (user == null)
                return NotFound("User with this email does not exist.");

            // Generate OTP
            string otp = _authService.GenerateOTP();
            user.ResetOtp = otp;
            user.OtpExpiry = System.DateTime.UtcNow.AddMinutes(10); // OTP valid for 10 minutes

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            // Send OTP via email
            _emailService.SendEmail(user.Email, "Password Reset OTP", $"Your OTP is: {otp}");

            return Ok("OTP sent to your email.");
        }

        [HttpPost("verify-otp")]
        public IActionResult VerifyOTP([FromBody] VerifyOtpRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (user == null || user.ResetOtp != request.Otp || user.OtpExpiry < System.DateTime.UtcNow)
                return BadRequest("Invalid or expired OTP.");

            return Ok("OTP verified. Proceed to reset password.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);
            if (user == null)
                return NotFound("User not found.");

            if (user.ResetOtp != request.Otp || user.OtpExpiry < System.DateTime.UtcNow)
                return BadRequest("Invalid or expired OTP.");

            // Hash the new password
            var (newHash, newSalt) = _authService.HashPassword(request.NewPassword);
            user.PasswordHash = newHash;
            user.Salt = newSalt;
            user.ResetOtp = null;
            user.OtpExpiry = null;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return Ok("Password reset successful.");
        }
    }

    public class LoginRequest
    {
        public string UsernameOrEmail { get; set; }
        public string Password { get; set; }
    }

    public class ChangePasswordRequest
    {
        public string Username { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
    public class ForgotPasswordRequest
    {
        public string Email { get; set; }
    }

    public class VerifyOtpRequest
    {
        public string Email { get; set; }
        public string Otp { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; }
        public string Otp { get; set; }
        public string NewPassword { get; set; }
    }

}
