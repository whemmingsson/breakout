using ScoreboardAPI.Models;
using System.Collections.Generic;

namespace ScoreboardAPI.Business
{
    public interface IScoreboardRepository
    {  
        void AddOrUpdate(ScoreEntry entry);
        IEnumerable<ScoreEntry> GetAll();
        IEnumerable<ScoreEntry> Top(int count = 1);
    }
}
