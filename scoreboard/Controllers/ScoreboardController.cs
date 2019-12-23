using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ScoreboardAPI.Business;
using ScoreboardAPI.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ScoreboardAPI.Controllers
{
#if DEBUG
    [EnableCors(Startup.MyAllowSpecificOrigins)]
#endif
    [ApiController]
    [Route("api/[controller]")]
    public class ScoreboardController : ControllerBase
    {
        private readonly IScoreboardRepository _repo;
        private readonly ILogger<ScoreboardController> _logger;

        public ScoreboardController(
            IScoreboardRepository repo, 
            ILogger<ScoreboardController> logger)
        {
            _repo = repo;
            _logger = logger;
        }

        // GET: api/all/<controller>
        [HttpGet("/get/all")]
        public ActionResult<IEnumerable<ScoreEntry>> GetAll()
        {
            try
            {
                return Ok(_repo.GetAll());
            }
            catch(Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        // GET: api/all/<controller>
        [HttpGet("/get/{count}")]
        public ActionResult<IEnumerable<ScoreEntry>> GetX(int count)
        {
            try
            {
                return Ok(_repo.Top(count));
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }

        // POST api/<controller>
        [HttpPost("/add")]
        public ActionResult<ScoreEntry> Post(ScoreEntry entry)
        {
            try
            {
                // Actually, the modelstate is always valid at this point; it's processed before this code runs.
                // Thanks Microsoft!
                var isValid = ModelState.IsValid;

                if(!isValid)
                {
                    entry.Date = DateTime.Now;
                    _repo.AddOrUpdate(entry);
                    return Ok(entry);
                }

                return Problem(
                    string.Join(",",ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)), 
                    null, 
                    400, 
                    "Validation error");
            }
            catch (Exception e)
            {
                _logger.LogError(e.Message);
                return Problem(e.Message);
            }
        }
    }
}
