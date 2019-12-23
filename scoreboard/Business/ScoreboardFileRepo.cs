using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;
using ScoreboardAPI.Models;

namespace ScoreboardAPI.Business
{
    public class ScoreboardFileRepo : IScoreboardRepository
    {
        private string DbPath => _env.ContentRootPath + @"\db\scoreboard.txt";
        private readonly IWebHostEnvironment _env;

        public ScoreboardFileRepo(IWebHostEnvironment env)
        {
            _env = env;
        }

        public void AddOrUpdate(ScoreEntry entry)
        {
            var entries = ReadFromFile().ToList();
            var existingEntry = entries.FirstOrDefault(e => string.Compare(e.User, entry.User, true) == 0);

            if (existingEntry == null)
                entries.Add(entry);
            else
                existingEntry.Score = Math.Max(existingEntry.Score, entry.Score);

            SaveToFile(entries);
        }

        public IEnumerable<ScoreEntry> GetAll() => ReadFromFile();
        public IEnumerable<ScoreEntry> Top(int count = 1) => ReadFromFile().Take(count);

        private IEnumerable<ScoreEntry> ReadFromFile()
        {
            if (!File.Exists(DbPath))
                return Enumerable.Empty<ScoreEntry>();

            var fileContent = File.ReadAllText(DbPath);

            if(fileContent == string.Empty)
                return Enumerable.Empty<ScoreEntry>();

            return JsonConvert.DeserializeObject<IEnumerable<ScoreEntry>>(fileContent);
        }

        private void SaveToFile(IEnumerable<ScoreEntry> entries)
        {
            File.WriteAllText(DbPath, JsonConvert.SerializeObject(entries.OrderByDescending(e => e.Score)));
        }
    }
}
