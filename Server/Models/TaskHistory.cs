using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class TaskHistory
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Tasks")]
        public int TaskId { get; set; }

        [ForeignKey("Users")]
        public int UpdatedBy { get; set; }

        public string OldStatus { get; set; }
        public string NewStatus { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
