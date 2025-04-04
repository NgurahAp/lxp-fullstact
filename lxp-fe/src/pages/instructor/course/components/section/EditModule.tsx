import React, { useState, FormEvent, useEffect } from "react";
import { X, FileText, Upload } from "lucide-react";

// Props interface with explicit types
interface EditModuleFormProps {
  onClose: () => void;
  onSubmit: (data: FormData, moduleId: string) => Promise<void>;
  isLoading?: boolean;
  module: {
    id: string;
    title: string;
    content?: string; // Making content optional to handle undefined case
  };
}

const EditModuleForm: React.FC<EditModuleFormProps> = ({
  onClose,
  onSubmit,
  isLoading = false,
  module,
}) => {
  const [title, setTitle] = useState(module.title);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string | null>(() => {
    // Using a function to safely access and process module.content
    if (module.content && typeof module.content === "string") {
      const parts = module.content.split("/");
      return parts[parts.length - 1] || null;
    }
    return null;
  });
  const [fileChanged, setFileChanged] = useState(false);

  useEffect(() => {
    // Initialize form with existing module data
    setTitle(module.title);
  }, [module]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFileChanged(true);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const moduleData = new FormData();
    moduleData.append("id", module.id);
    moduleData.append("title", title);

    // Only append file if it was changed
    if (file && fileChanged) {
      moduleData.append("content", file);
    }

    try {
      await onSubmit(moduleData, module.id);
      onClose(); // Only close after successful completion
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = isSubmitting || isLoading;
  const hasValidContent = fileChanged
    ? file !== null
    : currentFileName !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Edit Module</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Module Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Enter module title"
                required
                disabled={isProcessing}
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Module Content (PDF)
              </label>
              <div className="border border-gray-300 rounded-lg p-3">
                {file || (!fileChanged && currentFileName) ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between text-sm ">
                      <div className="flex w-[70%]">
                        <FileText size={16} className="mr-2 text-gray-600" />
                        <p className="line-clamp-1">
                          {file ? file.name : currentFileName}
                        </p>
                      </div>

                      {!fileChanged && currentFileName && (
                        <span className=" text-gray-500 ">(Current file)</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (!fileChanged) {
                          setFileChanged(true);
                          setCurrentFileName(null);
                        }
                      }}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                      disabled={isProcessing}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      Drag and drop your PDF here or click to browse
                    </p>
                    <label
                      htmlFor="content"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      Browse Files
                    </label>
                    <input
                      id="content"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isProcessing}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                isProcessing || !hasValidContent
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-gray-800"
              }`}
              disabled={isProcessing || !hasValidContent}
            >
              {isProcessing ? "Updating..." : "Update Module"}
            </button>
          </div>
        </form>

        <div className="bg-gray-50 p-4 border-t">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
              <FileText size={18} />
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Quick Tip</p>
              <p>
                You can update the module title without changing the PDF file,
                or replace the current PDF with a new one.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModuleForm;
