import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaReply,
  FaClock,
  FaCheckCircle,
  FaRegCircle,
  FaEnvelope,
  FaArrowLeft,
  FaPen,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import api from "../../Api/api";

const Inbox = () => {
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // Compose form state
  const [showCompose, setShowCompose] = useState(false);
  const [composeProjectId, setComposeProjectId] = useState(null);
  const [composeDropdownOpen, setComposeDropdownOpen] = useState(false);
  const [composeSubject, setComposeSubject] = useState("GENERAL QUESTION");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeSending, setComposeSending] = useState(false);

  const subjectOptions = ["GENERAL QUESTION", "SALES INQUIRY", "SUPPORT", "OTHER"];

  // Open compose if navigated from construction tracker
  useEffect(() => {
    if (location.state?.compose) {
      setShowCompose(true);
      if (location.state?.projectId) {
        setComposeProjectId(location.state.projectId);
      }
      // Clear the state so it doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Check screen size for mobile view
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/user-projects/question");
      setQuestions(response.data.data);
      setFilteredQuestions(response.data.data);
    } catch (err) {
      setError(err.message || "Failed to fetch questions");
      console.error("Error fetching questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's questions
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Submit new inquiry
  const handleComposeSend = async (e) => {
    e.preventDefault();
    if (!composeMessage.trim()) return;

    setComposeSending(true);
    try {
      await api.post("/user-projects/question", {
        subject: composeSubject,
        message: composeMessage.trim(),
        projectId: composeProjectId || null,
      });
      setComposeMessage("");
      setComposeSubject("GENERAL QUESTION");
      setShowCompose(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (err) {
      console.error("Error submitting question:", err);
      alert("Failed to submit your question. Please try again.");
    } finally {
      setComposeSending(false);
    }
  };

  // Filter questions based on search term and status
  useEffect(() => {
    let filtered = questions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (q.response &&
            q.response.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    // Sort by date (newest first)
    filtered = filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, statusFilter]);

  // Auto-select first question if none selected (only on desktop)
  useEffect(() => {
    if (!selectedQuestion && filteredQuestions.length > 0 && !isMobileView) {
      setSelectedQuestion(filteredQuestions[0]);
    }
  }, [filteredQuestions, selectedQuestion, isMobileView]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESPONDED":
        return <FaCheckCircle className="text-green-500" />;
      case "PENDING":
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaRegCircle className="text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "RESPONDED":
        return "Responded";
      case "PENDING":
        return "Pending";
      default:
        return status;
    }
  };

  // Show list view on mobile
  const showListView = () => {
    setSelectedQuestion(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading your questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Determine what to show based on mobile/desktop and selection state
  const showListViewOnMobile = isMobileView && !selectedQuestion;
  const showDetailViewOnMobile = isMobileView && selectedQuestion;
  const showSplitView = !isMobileView;

  return (
    <div className="bg-white rounded-lg shadow-lg min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Question List */}
      <div
        className={`
        ${showSplitView ? "w-full md:w-1/3" : "w-full"}
        ${showDetailViewOnMobile ? "hidden" : "flex"}
        border-r border-gray-200 flex flex-col
      `}
      >
        {/* Header with search and filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-gray-800">My Questions</h2>
            <button
              onClick={() => {
                setShowCompose(!showCompose);
                setSelectedQuestion(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              <FaPen className="text-xs" />
              New
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="RESPONDED">Responded</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
              <FaEnvelope className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-lg mb-2">No questions found</p>
              {searchTerm || statusFilter !== "ALL" ? (
                <p className="text-sm text-gray-400">
                  Try adjusting your search or filters
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    You haven't asked any questions yet
                  </p>
                  <button
                    onClick={() => setShowCompose(true)}
                    className="mt-4 px-4 py-2 bg-gradient text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    Ask Your First Question
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div
                key={question.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedQuestion?.id === question.id
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() => setSelectedQuestion(question)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800 truncate flex-1 mr-2">
                    {question.subject}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
                    {getStatusIcon(question.status)}
                    <span className="ml-1 hidden sm:inline">
                      {getStatusText(question.status)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {question.message}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {formatDate(question.createdAt)}
                  </span>
                </div>

                {question.response && (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <FaReply className="mr-1" />
                    Replied
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Question Details */}
      <div
        className={`
        ${showSplitView ? "w-full md:w-2/3" : "w-full"}
        ${showListViewOnMobile ? "hidden" : "flex"}
        flex flex-col
      `}
      >
        {/* Compose New Question */}
        {showCompose ? (
          <div className="flex flex-col h-full">
            {/* Compose Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-xl text-gray-800">New Inquiry</h2>
              <button
                onClick={() => setShowCompose(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            {/* Compose Form */}
            <form onSubmit={handleComposeSend} className="flex-1 p-4 md:p-6 flex flex-col">
              {/* Subject Dropdown */}
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setComposeDropdownOpen(!composeDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-xs bg-gradient text-white rounded-md font-medium"
                  >
                    {composeSubject}
                    <FaChevronDown className="text-xs" />
                  </button>
                  {composeDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {subjectOptions.map((opt) => (
                        <div
                          key={opt}
                          onClick={() => {
                            setComposeSubject(opt);
                            setComposeDropdownOpen(false);
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

              {/* Message */}
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                placeholder="Type your question here..."
                value={composeMessage}
                onChange={(e) => setComposeMessage(e.target.value)}
                className="w-full flex-1 min-h-[180px] border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
                required
              />

              <button
                type="submit"
                disabled={composeSending || !composeMessage.trim()}
                className="w-full py-3 bg-gradient text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {composeSending ? "Sending..." : "Send Message"}
              </button>

              <p className="text-xs text-gray-400 mt-3 text-center">
                Your inquiry will be sent to the UH Homes team. Expect a reply within 24–48 hours.
              </p>
            </form>
          </div>
        ) : selectedQuestion ? (
          <>
            {/* Mobile Back Button */}
            {isMobileView && (
              <button
                onClick={showListView}
                className="flex items-center p-4 border-b border-gray-200 text-blue-600 hover:bg-gray-50 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Back to Questions
              </button>
            )}

            {/* Question Header */}
            <div className="p-4 md:p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl md:text-2xl text-gray-800  pr-2">
                  {selectedQuestion.subject}
                </h2>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedQuestion.status === "RESPONDED"
                        ? "bg-green-100 text-green-800"
                        : selectedQuestion.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {getStatusText(selectedQuestion.status)}
                  </span>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <span>Asked on {formatDate(selectedQuestion.createdAt)}</span>
              </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-gray-800 mb-2">Your Question:</h3>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedQuestion.message}
                </p>
              </div>

              {/* Response Section */}
              {selectedQuestion.response ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <FaCheckCircle className="text-green-500 mr-2" />
                    <h3 className=" text-green-800">
                      Response from Support Team
                    </h3>
                  </div>
                  <p className="text-green-800 whitespace-pre-wrap">
                    {selectedQuestion.response}
                  </p>
                  {selectedQuestion.respondedAt && (
                    <p className="text-xs text-green-600 mt-2">
                      Responded on {formatDate(selectedQuestion.respondedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <FaClock className="text-yellow-500 mr-2" />
                    <span className="text-yellow-800 font-medium">
                      Waiting for response from support team
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-2">
                    Our team typically responds within 24-48 hours.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center text-gray-500">
              <FaEnvelope className="text-4xl mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">Select a question to view details</p>
              <p className="text-sm text-gray-400">
                {isMobileView
                  ? "Tap on a question from the list"
                  : "Click on a question from the list"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
