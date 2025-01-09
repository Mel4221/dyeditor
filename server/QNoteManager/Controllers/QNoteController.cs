using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text;
using QNoteManager;
using Newtonsoft.Json;

namespace QNoteManager.Controllers
{
    [ApiController] 
    [Route("[controller]")]
    public class QNoteController : ControllerBase
    {
        [HttpGet]
        public IActionResult Index()
        {
            return Ok("Welcome to QNote!");
        }

        [HttpPost("save/file")]
        public async Task<IActionResult> SaveFile()
        {  
            try
            {
                string path = Request.Headers["path"].ToString();
                //string file = Request.Headers["file-name"].ToString();
                // Validate the input path
                if (string.IsNullOrWhiteSpace(path))
                {
                    return BadRequest("The 'path' header cannot be null or empty.");
                }
                // Reading raw JSON data from the body
                using (var reader = new System.IO.StreamReader(Request.Body))
                {
                    var data = await reader.ReadToEndAsync();
                    System.IO.File.WriteAllTextAsync(path, data);
                }
                return Ok(new
                {
                    Result = "saved"
                });

            }
            catch(Exception ex)
            {
                return BadRequest(ex); 
            }
        }
        [HttpGet("get/file-info")]
        public async Task<IActionResult> GetFile()
        {
            // Extract the 'path' header
            string path = Request.Headers["path"].ToString();

            // Validate the input path
            if (string.IsNullOrWhiteSpace(path))
            {
                return BadRequest("The 'path' header cannot be null or empty.");
            }

            // Check if the file exists
            if (!System.IO.File.Exists(path))
            {
                return NotFound($"The specified file '{path}' does not exist.");
            }

            try
            {
                // Read the file contents and return them
                string fileContent =await System.IO.File.ReadAllTextAsync(path,Encoding.UTF8);

                return Ok(new
                {
                    FileName = System.IO.Path.GetFileName(path),
                    Content = fileContent,
                    Length = fileContent.Length,
                    Size = QuickTools.QCore.Get.FileSize(QuickTools.QCore.Get.Bytes(fileContent))

                }) ;
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "Access to the specified file is denied.");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"An error occurred: {ex.Message}");
            }
        }


        [HttpGet("get/current-path")]
        public string CurrentPath()
        {
            return Directory.GetCurrentDirectory().Replace('\\', '/');
        }
        [HttpGet("is/file")]
        public bool ExistFile()
        {
            string path = Request.Headers["path"].ToString();
            return System.IO.File.Exists(path);
        }
        [HttpGet("is/dir")]
        public bool ExistDir()
        {
            string path = Request.Headers["path"].ToString();
            return Directory.Exists(path);
        }



        //[HttpGet("{path}")]
        [HttpGet("get/dir")]
        public IActionResult GetDir()
        {
            string path = Request.Headers["path"].ToString();
            string depthStr = Request.Headers["depth"].ToString();
            //Console.Write(depth);
            // Validate the input path
            if (string.IsNullOrWhiteSpace(path))
                return BadRequest("The path cannot be null or empty.");

            if (!Directory.Exists(path))
                return BadRequest($"The specified path '{path}' does not exist.");

            try
            {
                Tree tree = new Tree(path);
                tree.AllowDebugger =true;

                int depth = QuickTools.QCore.Get.IsNumber(depthStr) ? int.Parse(depthStr) : 0;
                tree.Depth = depth; 
                //tree.TopOnly = depth==1 ? true : false ;
                tree.Build();
                return Ok(tree.ToJson());
            }
            catch (Exception ex)
            {
                // Handle unexpected exceptions
                return StatusCode(500, $"An error occurred while processing the request: {ex.Message}");
            }
        }

    }
}