using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Server.Models
{
    public class TaskModel
    {
        [Key]
        [JsonIgnore] // Will not be included in request/response
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        [JsonIgnore] // Exclude from request/response
        public int? AssignedTo { get; set; }

        [ForeignKey("AssignedTo")]
        [JsonIgnore] // Exclude from request/response
        public User? AssignedToUser { get; set; }

        [Required]
        public string Status { get; set; } = "To Do";

        //public string? Attachments { get; set; }
        [JsonIgnore]
        public string? CreatedBy { get; set; } // Store ID of the user who created the task
        [JsonIgnore]
        public string? AssignedBy { get; set; } // Store ID of the user who assigned the task
        [JsonIgnore] // Exclude from request/response
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
