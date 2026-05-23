import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import api from "../../Api/api";

export default function InquiryForm({ projectId }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState("GENERAL QUESTION");
  const [message, setMessage] = useState("");
  const [replyMethod, setReplyMethod] = useState("email");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const options = ["GENERAL QUESTION", "SALES INQUIRY", "SUPPORT", "OTHER"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    setLoading(true);

    try {
      await api.post("/user-projects/question", {
        subject: selected,
        message: message.trim(),
        projectId: projectId,
      });

      setSubmitted(true);
      setMessage("");
    } catch (error) {
      console.error("Error submitting question:", error);
      alert("Failed to submit your question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex justify-center items-center min-h-screen px-3">
        <div className="p-2 w-full max-w-7xl">
          <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md text-center">
            <h3 className="text-lg font-semibold text-green-600 mb-4">
              Thank You!
            </h3>
            <p className="text-gray-800 mb-4">
              Your inquiry has been sent to the UH-Homes team. You'll receive a
              reply within 24–48 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-2 bg-gradient text-white rounded-md font-medium"
            >
              Ask Another Question
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-3">
      <div className="p-2 w-full max-w-7xl">
        <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
          <h2 className="text-xl mb-4">Ask UH Homes (Inquiry Form)</h2>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-4 p-2">
              <span className="text-md font-medium text-gray-800">
                Recommended
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center px-3 py-2 text-xs bg-gradient text-white rounded-md font-medium"
                >
                  {selected}
                  <FaChevronDown className="ml-2 text-xs" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border-2 border-gray-100 rounded-md shadow-md z-10">
                    {options.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setSelected(opt);
                          setDropdownOpen(false);
                        }}
                        className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer"
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <label className="block text-md text-gray-800 font-medium mb-1">
              Message
            </label>
            <textarea
              placeholder="Type Here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-md p-3 mb-4 text-sm focus:ring-1 focus:ring-gray-300 focus:outline-none"
              rows="6"
              required
            />

            {/* <div className="flex items-center gap-6 mb-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reply"
                  value="email"
                  checked={replyMethod === "email"}
                  onChange={() => setReplyMethod("email")}
                />
                Reply by Email
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reply"
                  value="phone"
                  checked={replyMethod === "phone"}
                  onChange={() => setReplyMethod("phone")}
                />
                Reply by Phone/SMS
              </label>
            </div> */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient text-white rounded-md font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

            <p className="text-sm text-gray-500 mt-3 mx-auto text-center max-w-xl">
              *Thank you, your inquiry has been sent to the UH-Homes team.
              You'll receive a reply within 24–48 hours.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
