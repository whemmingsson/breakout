using Ganss.XSS;
using System;
using System.ComponentModel.DataAnnotations;

namespace ScoreboardAPI.Models
{
    public class ScoreEntry
    {
        private string _user;

        [Required]
        [Range(1, double.PositiveInfinity)]
        public int Score { get; set; }

        public DateTime Date { get; set; }

        [Required]
        public string User
        {
            get => _user;
            set
            {
                _user = Sanitize(value);
            }
        }
        private static string Sanitize(string text)
        {
            var sanitizer = new HtmlSanitizer();
            return sanitizer.Sanitize(text);
        }
    }
}
