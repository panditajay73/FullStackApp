using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models
{
    public class TaskComment
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Tasks")]
        public int TaskId { get; set; }
        //public string Username { get; set; }
        [ForeignKey("Users")]
        public int UserId { get; set; }

        public string Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
