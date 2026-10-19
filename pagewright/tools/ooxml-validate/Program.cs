// Validates .docx packages against the Office 2019 schema set of Microsoft's Open XML SDK
// (DocumentFormat.OpenXml, MIT). Prints one JSON object per file; exit code 1 if any file has errors.
using System.Text.Json;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Validation;

var failed = false;
foreach (var path in args)
{
    var errors = new List<object>();
    string? openError = null;
    try
    {
        using var doc = WordprocessingDocument.Open(path, false);
        var validator = new OpenXmlValidator(FileFormatVersions.Office2019);
        foreach (var e in validator.Validate(doc).Take(200))
            errors.Add(new { part = e.Part?.Uri.ToString(), path = e.Path?.XPath, type = e.ErrorType.ToString(), id = e.Id, description = e.Description });
    }
    catch (Exception ex) { openError = ex.GetType().Name + ": " + ex.Message; }
    if (openError != null || errors.Count > 0) failed = true;
    Console.WriteLine(JsonSerializer.Serialize(new { file = path, valid = openError == null && errors.Count == 0, openError, errorCount = errors.Count, errors }));
}
return failed ? 1 : 0;
