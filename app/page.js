"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [emails, setEmails] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [emailTemplate, setEmailTemplate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [templatePreview, setTemplatePreview] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const [importedFileName, setImportedFileName] = useState("");

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportedFileName(file.name);
      const text = await file.text();
      const emailList = text
        .split(/[\n,]/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0);
      setEmails(emailList.join(", "));
    }
  };

  const [attachmentFileNames, setAttachmentFileNames] = useState([]);

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
    setAttachmentFileNames(files.map((file) => file.name));
  };

  // Add this state for file name display
  const [templateFileName, setTemplateFileName] = useState("");

  const handleTemplateChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEmailTemplate(file);
      setTemplateFileName(file.name);

      // Add preview functionality
      const reader = new FileReader();
      reader.onload = (e) => {
        setTemplatePreview(e.target.result);
      };
      reader.readAsText(file);
    } else {
      setTemplatePreview("");
    }
  };

  const [sendingProgress, setSendingProgress] = useState({
    current: 0,
    total: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const emailList = emails.split(",").map((email) => email.trim());
    const invalidEmails = emailList.filter((email) => !validateEmail(email));

    if (invalidEmails.length > 0) {
      setStatus(`Invalid email(s): ${invalidEmails.join(", ")}`);
      setIsSubmitting(false);
      return;
    }

    try {
      setStatus("Sending emails...");
      setSendingProgress({ current: 0, total: emailList.length });
      const formData = new FormData();
      formData.append("emails", JSON.stringify(emailList));
      formData.append("subject", subject);
      formData.append("message", message);

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      if (emailTemplate) {
        formData.append("emailTemplate", emailTemplate);
      }

      const response = await fetch("/api/send-emails", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send emails");
      setSendingProgress({
        current: data.progress.current,
        total: data.progress.total,
      });
      setStatus(
        `${data.progress.current} out of ${data.progress.total} emails sent successfully!`
      );
      setIsSubmitting(false);
    } catch (error) {
      setStatus("Failed to send emails. Please try again.");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setShowForm(true);
  }, []);

  return (
    <div
      className={`min-h-screen p-8 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 to-purple-900 text-white"
          : "bg-gradient-to-br from-blue-50 to-purple-50"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:scale-110 transition-transform duration-300"
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        <h1
          className={`text-5xl font-bold mb-12 text-center bg-clip-text ${
            isDarkMode
              ? "text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
              : "text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
          } transform hover:scale-105 transition-transform duration-300`}
        >
          Bulk Email Sender
        </h1>

        <form
          onSubmit={handleSubmit}
          className={`space-y-8 ${
            isDarkMode ? "bg-gray-800/50" : "bg-white"
          } rounded-2xl p-8 shadow-xl backdrop-blur-sm border ${
            isDarkMode ? "border-white/10" : "border-black/5"
          } transform transition-all duration-500 ${
            showForm ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="space-y-2 transform transition-all duration-300 hover:scale-[1.01]">
            <label
              className={`block mb-2 font-semibold ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Email Addresses (comma-separated)
            </label>
            <div className="space-y-2">
              <textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-700/50 border-gray-600 text-white"
                    : "bg-white border-gray-200"
                }`}
                placeholder="email1@example.com, email2@example.com"
                rows={3}
                required
              />
              <div className="flex items-center gap-2">
                <label
                  className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700 border border-gray-600"
                      : "bg-purple-50 hover:bg-purple-100 border border-purple-200"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      isDarkMode ? "text-gray-400" : "text-purple-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-200" : "text-purple-600"
                    }`}
                  >
                    {importedFileName || "Import List"}
                  </span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
                {importedFileName && (
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {importedFileName.split(".").pop().toUpperCase()} file
                    loaded
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 transform transition-all duration-300 hover:scale-[1.01]">
            <label
              className={`block mb-2 font-semibold ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full border-2 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                isDarkMode
                  ? "bg-gray-700/50 border-gray-600 text-white"
                  : "bg-white border-gray-200"
              }`}
              required
            />
          </div>

          <div className="space-y-2 transform transition-all duration-300 hover:scale-[1.01]">
            <label
              className={`block mb-2 font-semibold ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                isDarkMode
                  ? "bg-gray-700/50 border-gray-600 text-white"
                  : "bg-white border-gray-200"
              }`}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2 transform transition-all duration-300 hover:scale-[1.01]">
            <label
              className={`block mb-2 font-semibold ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Email Template (HTML)
            </label>
            <label
              className={`flex flex-col items-center justify-center w-full h-32 px-4 transition-all duration-300 border-2 border-dashed rounded-xl cursor-pointer ${
                isDarkMode
                  ? "border-gray-600 hover:border-purple-400 bg-gray-800/50"
                  : "border-purple-200 hover:border-purple-400 bg-gray-50 hover:bg-purple-50"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {!templateFileName ? (
                  <>
                    <svg
                      className={`w-10 h-10 mb-3 ${
                        isDarkMode ? "text-gray-400" : "text-purple-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p
                      className={`mb-2 text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      HTML template file only
                    </p>
                  </>
                ) : (
                  <div className="flex items-center space-x-3">
                    <svg
                      className={`w-8 h-8 ${
                        isDarkMode ? "text-purple-400" : "text-purple-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-medium ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        {templateFileName}
                      </span>
                      <span
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Click to change
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".html"
                onChange={handleTemplateChange}
                className="hidden"
              />
            </label>
            {templatePreview && (
              <div className="mt-4 space-y-2">
                <div
                  className={`flex items-center justify-between ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  <span className="text-sm font-medium">Template Preview</span>
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        `data:text/html;charset=utf-8,${encodeURIComponent(
                          templatePreview
                        )}`,
                        "_blank"
                      )
                    }
                    className={`text-xs px-3 py-1 rounded-md transition-colors ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    Open in New Tab
                  </button>
                </div>
                <div
                  className={`relative rounded-lg border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-800/50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div
                    className={`absolute top-0 right-0 left-0 h-8 px-4 flex items-center border-b bg-opacity-50 backdrop-blur-sm rounded-t-lg ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Preview
                    </span>
                  </div>
                  <div className="h-64 mt-8 overflow-auto p-4">
                    <iframe
                      srcDoc={templatePreview}
                      className="w-full h-full bg-white rounded"
                      title="Template Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 transform transition-all duration-300 hover:scale-[1.01]">
            <label
              className={`block mb-2 font-semibold ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Attachments
            </label>
            <label
              className={`flex flex-col items-center justify-center w-full min-h-[8rem] px-4 transition-all duration-300 border-2 border-dashed rounded-xl cursor-pointer ${
                isDarkMode
                  ? "border-gray-600 hover:border-purple-400 bg-gray-800/50"
                  : "border-purple-200 hover:border-purple-400 bg-gray-50 hover:bg-purple-50"
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {attachmentFileNames.length === 0 ? (
                  <>
                    <svg
                      className={`w-10 h-10 mb-3 ${
                        isDarkMode ? "text-gray-400" : "text-purple-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    <p
                      className={`mb-2 text-sm ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Support for multiple files
                    </p>
                  </>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center justify-center mb-4">
                      <svg
                        className={`w-8 h-8 ${
                          isDarkMode ? "text-purple-400" : "text-purple-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          isDarkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        {attachmentFileNames.length} file(s) selected
                      </span>
                    </div>
                    <div
                      className={`max-h-32 overflow-auto p-2 rounded-lg ${
                        isDarkMode ? "bg-gray-700/30" : "bg-white/50"
                      }`}
                    >
                      {attachmentFileNames.map((name, index) => (
                        <div key={index} className="flex items-center py-1">
                          <svg
                            className={`w-4 h-4 mr-2 ${
                              isDarkMode ? "text-gray-400" : "text-purple-500"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                          <span
                            className={`text-xs ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p
                      className={`mt-2 text-xs text-center ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Click to add more files
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                multiple
                onChange={handleAttachmentChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`relative w-full py-4 px-6 rounded-lg font-medium text-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-90 disabled:cursor-not-allowed overflow-hidden ${
              isDarkMode
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            }`}
          >
            {isSubmitting ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Sending Emails...</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Progress</span>
                    <span>
                      {Math.round(
                        (sendingProgress.current / sendingProgress.total) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300 rounded-full"
                      style={{
                        width: `${
                          (sendingProgress.current / sendingProgress.total) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-white/80 text-center">
                    {sendingProgress.current} of {sendingProgress.total} emails
                    sent
                  </div>
                </div>
              </div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send Emails
              </span>
            )}
            {isSubmitting && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
            )}
          </button>

          {status && (
            <div
              className={`p-4 rounded-lg transform transition-all duration-500 animate-fadeIn ${
                status.includes("Invalid") || status.includes("Failed")
                  ? isDarkMode
                    ? "bg-red-900/50 text-red-200"
                    : "bg-red-100 text-red-700"
                  : isDarkMode
                  ? "bg-green-900/50 text-green-200"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
