using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;


namespace Server.Controllers
{
    [Route("api/tasks")]
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TaskController(AppDbContext context)
        {
            _context = context;
        }

        // Create Task (Only Admins & Project Managers)
        [HttpPost("create")]
        [Authorize(Roles = "Admin,Project Manager")]
        public async Task<IActionResult> CreateTask([FromBody] TaskModel task)
        {
            if (task == null || string.IsNullOrWhiteSpace(task.Title))
                return BadRequest("Task title is required.");

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Get UserId from token

            task.CreatedBy = userId; // Automatically set CreatedBy

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task created successfully." });
        }


        // Assign Task (Only Admins & Project Managers)
        [HttpPost("assign")]
        [Authorize(Roles = "Admin,Project Manager")]
        public async Task<IActionResult> AssignTask(int taskId, int userId)
        {
            var task = await _context.Tasks.FindAsync(taskId);
            var user = await _context.Users.FindAsync(userId);

            if (task == null || user == null)
                return NotFound("Task or User not found.");

            var assignedByUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Keep as string

            task.AssignedTo = userId;
            task.AssignedBy = assignedByUserId; // Store as string

            await _context.SaveChangesAsync();

            return Ok(new { message = "Task assigned successfully." });
        }



        // Update Task Status (Only Assignee)
        [HttpPut("update-status")]
        public async Task<IActionResult> UpdateTaskStatus(int taskId, string status)
        {
            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null)
                return NotFound("Task not found.");

            // Get UpdatedBy from the JWT Token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Convert userIdClaim to int
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Invalid user ID in token.");

            // Store the old status before updating
            var oldStatus = task.Status;

            // ✅ Update task status
            task.Status = status;
            await _context.SaveChangesAsync();

            // ✅ Insert into TaskHistory
            var taskHistory = new TaskHistory
            {
                TaskId = taskId,
                UpdatedBy = userId,  // Now stored as int
                OldStatus = oldStatus,
                NewStatus = status,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TaskHistory.Add(taskHistory);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task status updated successfully, and history recorded." });
        }


        // Get All Tasks (Admins & Project Managers)
        [HttpGet("all")]
        [Authorize(Roles = "Admin,Project Manager")]
        public async Task<IActionResult> GetAllTasks()
        {
            var tasks = await _context.Tasks
                                      .Select(t => new
                                      {
                                          t.Id,
                                          t.Title,
                                          t.Description,
                                          AssignedTo = t.AssignedTo.HasValue ? t.AssignedTo.Value.ToString() : "", 
                                          t.CreatedAt,
                                          t.CreatedBy,
                                          t.AssignedBy,
                                          t.Status
                                      })
                                      .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("my-tasks")]
        //[Authorize] // Ensure the user is authenticated
        public async Task<IActionResult> GetMyTasks()
        {
            // Extract user ID from JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Invalid token: User ID not found" });
            }

            // Get tasks assigned to this user
            var userTasks = await _context.Tasks
                                          .Where(t => t.AssignedTo == int.Parse(userId))
                                          .Select(t => new
                                          {
                                              t.Id,
                                              t.Title,
                                              t.Description,
                                              // AssignedTo is removed
                                              t.CreatedAt,
                                              t.CreatedBy,
                                              t.AssignedBy,
                                              t.Status
                                          })
                                          .ToListAsync();

            return Ok(userTasks);
        }

        [HttpGet("get-username/{id}")]
        public async Task<IActionResult> GetUsername(int id)
        {
            var user = await _context.Users
                                     .Where(u => u.Id == id)
                                     .Select(u => new { u.Username })
                                     .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }

        // Get Task by ID (Admins, Project Managers, and Assigned Users)
        [HttpGet("{taskId}")]

public async Task<IActionResult> GetTaskById(int taskId)
{
    var task = await _context.Tasks.Include(t => t.AssignedToUser).FirstOrDefaultAsync(t => t.Id == taskId);
    if (task == null)
        return NotFound("Task not found.");

    // ✅ Check user role and permission
    //if (!User.IsInRole("Admin") && !User.IsInRole("Project Manager"))
    //{
    //    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

    //    // ✅ Only allow regular users to access tasks assigned to them
    //    if (task.AssignedTo != userId)
    //        return Forbid("You are not authorized to view this task.");
    //}

    return Ok(task);
}


        // Delete Task (Admins & Project Managers)
        [HttpDelete("delete/{taskId}")]
        [Authorize(Roles = "Admin,Project Manager")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            var task = await _context.Tasks.FindAsync(taskId);
            if (task == null)
                return NotFound("Task not found.");

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task deleted successfully." });
        }
        [HttpDelete("delete-all")]
        [Authorize(Roles = "Admin,Project Manager")]
        public async Task<IActionResult> DeleteAllTasks()
        {
            var tasks = _context.Tasks.ToList();
            if (!tasks.Any())
                return NotFound("No tasks found to delete.");

            _context.Tasks.RemoveRange(tasks);
            await _context.SaveChangesAsync();

            return Ok(new { message = "All tasks deleted successfully." });
        }


        [Authorize]
[HttpPost("addComment")]
public IActionResult AddComment([FromBody] TaskComment comment)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null)
        return Unauthorized("User ID not found in token.");

    if (string.IsNullOrWhiteSpace(comment.Comment))
        return BadRequest("Comment content is required.");

    try
    {
        int userId = int.Parse(userIdClaim.Value); // ✅ Extract user ID from JWT
        comment.UserId = userId;
        comment.CreatedAt = DateTime.UtcNow;

        _context.TaskComments.Add(comment);
        _context.SaveChanges();

        return Ok(new { Message = "Comment added successfully" });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = ex.Message });
    }
}








        // Get Task Comments (All Users)
        [HttpGet("comments/{taskId}")]
        [Authorize]
        public async Task<IActionResult> GetTaskComments(int taskId)
        {
            var taskExists = await _context.Tasks.AnyAsync(t => t.Id == taskId);
            if (!taskExists)
                return NotFound("Task not found.");

            var comments = await _context.TaskComments.Where(c => c.TaskId == taskId).ToListAsync();
            return Ok(comments);
        }

        // Track Task History (Admins & Project Managers)
        [HttpGet("history/{taskId}")]
        //[Authorize(Roles = "Admin,Project Manager")]
        public async Task<IActionResult> GetTaskHistory(int taskId)
        {
            var history = await _context.TaskHistory.Where(h => h.TaskId == taskId).ToListAsync();
            return Ok(history);
        }
        //[HttpPost("upload")]
        //public async Task<IActionResult> UploadFile(IFormFile file)
        //{
        //    if (file == null || file.Length == 0)
        //        return BadRequest("No file uploaded.");

        //    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/documents");
        //    if (!Directory.Exists(uploadsFolder))
        //        Directory.CreateDirectory(uploadsFolder);

        //    var fileName = $"{DateTime.UtcNow.Ticks}_{file.FileName}";
        //    var filePath = Path.Combine(uploadsFolder, fileName);

        //    using (var stream = new FileStream(filePath, FileMode.Create))
        //    {
        //        await file.CopyToAsync(stream);
        //    }

        //    var relativePath = $"/documents/{fileName}";
        //    return Ok(new { filePath = relativePath });
        //}

        // Get Users with Role = "User"
        [HttpGet("users")]
        //[Authorize(Roles = "Admin,Project Manager")]
        public async Task<IActionResult> GetUsersWithRoleUser()
        {
            var users = await _context.Users
                .Where(u => u.Role == "User")
                .Select(u => new { u.Id, u.Username })
                .ToListAsync();

            return Ok(users);
        }

    }
}
