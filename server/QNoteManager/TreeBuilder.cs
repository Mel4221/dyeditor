using System;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
using QuickTools.QCore;
using System.Threading;

public class Item
{
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public double Id { get; set; } = IRandom.RandomInt(11111111, 99999999);
    public List<Item> Sub { get; set; } = new List<Item>();
}

public class Tree
{
    public string Path { get; set; } = string.Empty;
    public bool AllowDebugger { get; set; } = false;
    public int Depth { get; set; } = 0; //disabled
    private int CurrentDepth { get; set; } = 0; 
    public List<Item> Items { get; set; } = new List<Item>();

    private Item Map(string path, int currentDepth)
    {
        // Create the item
        var item = new Item
        {
            Type = Directory.Exists(path) ? "dir" : "file",
            Name = System.IO.Path.GetFileName(path),
            Path = (System.IO.Path.GetRelativePath(this.Path, Directory.Exists(path) ? path : System.IO.Path.GetFullPath(path))).Replace('\\', '/')
        };

        // Stop recursion if depth is exceeded
        //if (item.Type == "dir" && (Depth == 0 || currentDepth < Depth))
         if (item.Type == "dir" && (currentDepth < Depth))

        {
            try
            {
                // Get subdirectories and files
                string[] subDirs = Directory.GetDirectories(path);
                string[] subFiles = Directory.GetFiles(path);

                if (this.AllowDebugger) Get.Blue(path);

                // Add subdirectories if within depth limit
                foreach (var dir in subDirs)
                {
                    try
                    {
                        // if (currentDepth + 1 <= Depth) // Check if adding this subdirectory exceeds depth
                        if (Depth == 0 || currentDepth + 1 <= Depth) // Check if adding this subdirectory exceeds depth
                            item.Sub.Add(Map(dir, currentDepth + 1));
                    }
                    catch (Exception ex)
                    {
                        if (this.AllowDebugger) Get.Red($"Error processing directory: {dir}. {ex.Message}");
                    }
                }

                // Add files at the current level
                foreach (var file in subFiles)
                {
                    try
                    {
                        // if (currentDepth < Depth) // Files can only exist within the current depth
                        if (Depth == 0 || currentDepth < Depth) // Files can only exist within the current depth
                            item.Sub.Add(Map(file, currentDepth));
                    }
                    catch (Exception ex)
                    {
                        if (this.AllowDebugger) Get.Red($"Error processing file: {file}. {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                if (this.AllowDebugger) Get.Red($"Error accessing directory: {path}. {ex.Message}");
            }
        }

        return item;
    }

    public void Build()
    {
        if (string.IsNullOrEmpty(this.Path))
        {
            throw new ArgumentNullException("The path is empty");
        }

        var rootItem = Map(this.Path, 0); // Start mapping with depth 0
        this.Items.Add(rootItem);
    }


    /*
    private Item Map(string path,int depth)
    {
       
        // Determine if the current path is a directory or a file
        var item = new Item
        {
            Type = Directory.Exists(path) ? "dir" : "file",
            Name = System.IO.Path.GetFileName(path),
            Path = (System.IO.Path.GetRelativePath(this.Path, Directory.Exists(path) ? path : System.IO.Path.GetFullPath(path))).Replace('\\', '/')
        };

        // If it's a directory, recursively map its contents
        if (item.Type == "dir")
        {
            try
            {
                string[] subDirs = Directory.GetDirectories(path);
                string[] subFiles = Directory.GetFiles(path);
                if (this.AllowDebugger) Get.Blue(path);
                    foreach (var dir in subDirs)
                    {
                        try
                        {
                            this.CurrentDepth++;
                            item.Sub.Add(Map(dir,this.CurrentDepth)); // Recursive call for directories


                        // if (Depth > 0 && Level == Depth) break;
                        // if (Depth > 0) Level++;

                    }
                    catch (Exception ex)
                        {
                            if (this.AllowDebugger) Get.Red($"Error processing directory: {dir}. {ex.Message}");
                        }
                    }
                     foreach (var file in subFiles)
                    {
                        try
                        {
                            if (this.AllowDebugger) Get.Yellow(file);
                            item.Sub.Add(Map(file, this.CurrentDepth)); // Add files in the current directory
                        }
                        catch (Exception ex)
                        {
                            if (this.AllowDebugger) Get.Red($"Error processing file: {file}. {ex.Message}");
                        }
                    }
              
             
            }
            catch (Exception ex)
            {
                if (this.AllowDebugger) Get.Red($"Error accessing directory: {path}. {ex.Message}");
            }
        }

        return item;
    }

    */

    // Method to serialize the tree to JSON using Newtonsoft.Json
    public string ToJson()
    {
        return JsonConvert.SerializeObject(new { items = this.Items }, Formatting.None);
    }

    /*
    public void Build()
    {
        if (string.IsNullOrEmpty(this.Path))
        {
            throw new ArgumentNullException("The path is empty");
        }

        // Map the entire tree starting from the root path
        var rootItem = Map(this.Path,this.CurrentDepth);
        this.Items.Add(rootItem);
  
        
    }
    */
    public void Build(string path)
    {
        this.Path = path;
        this.Build();
    }

    
    public Tree() { }
    public Tree(string path) { this.Path = path; }
}
