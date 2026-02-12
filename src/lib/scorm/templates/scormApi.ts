/**
 * SCORM 1.2 API Wrapper
 * This JavaScript code is embedded in the SCORM package HTML
 * to communicate with the LMS (Learning Management System)
 */

export const SCORM_API_WRAPPER = `
// SCORM 1.2 API Wrapper
var API = null;
var findAPITries = 0;
var maxTries = 500;

// Find the SCORM API in parent/opener windows
function findAPI(win) {
  while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
    findAPITries++;
    if (findAPITries > maxTries) {
      return null;
    }
    win = win.parent;
  }
  return win.API;
}

function getAPI() {
  if (API == null) {
    API = findAPI(window);
  }
  if ((API == null) && (window.opener != null) && (typeof(window.opener) != "undefined")) {
    API = findAPI(window.opener);
  }
  return API;
}

// Initialize SCORM session
function initSCORM() {
  var api = getAPI();
  if (api == null) {
    console.warn("SCORM API not found - running in standalone mode");
    return false;
  }
  var result = api.LMSInitialize("");
  if (result == "true") {
    var status = api.LMSGetValue("cmi.core.lesson_status");
    if (status == "not attempted") {
      api.LMSSetValue("cmi.core.lesson_status", "incomplete");
    }
    return true;
  }
  return false;
}

// Terminate SCORM session
function termSCORM() {
  var api = getAPI();
  if (api == null) {
    return false;
  }
  api.LMSFinish("");
  return true;
}

// Set completion status
function setComplete() {
  var api = getAPI();
  if (api == null) return;
  api.LMSSetValue("cmi.core.lesson_status", "completed");
  api.LMSCommit("");
}

// Set score (0-100)
function setScore(score) {
  var api = getAPI();
  if (api == null) return;
  api.LMSSetValue("cmi.core.score.raw", score.toString());
  api.LMSSetValue("cmi.core.score.min", "0");
  api.LMSSetValue("cmi.core.score.max", "100");
  
  // Determine pass/fail based on mastery score
  var masteryScore = api.LMSGetValue("cmi.student_data.mastery_score");
  if (masteryScore && score >= parseFloat(masteryScore)) {
    api.LMSSetValue("cmi.core.lesson_status", "passed");
  } else if (masteryScore) {
    api.LMSSetValue("cmi.core.lesson_status", "failed");
  } else {
    api.LMSSetValue("cmi.core.lesson_status", "completed");
  }
  
  api.LMSCommit("");
}

// Set progress (0-100)
function setProgress(progress) {
  var api = getAPI();
  if (api == null) return;
  api.LMSSetValue("cmi.core.lesson_location", progress.toString());
  api.LMSCommit("");
}

// Save state data to SCORM suspend_data
function saveState(stateData) {
  var api = getAPI();
  if (api == null) return false;
  try {
    var jsonString = JSON.stringify(stateData);
    api.LMSSetValue("cmi.suspend_data", jsonString);
    api.LMSCommit("");
    console.log("State saved to SCORM:", stateData);
    return true;
  } catch (e) {
    console.error("Error saving state:", e);
    return false;
  }
}

// Load state data from SCORM suspend_data
function loadState() {
  var api = getAPI();
  if (api == null) return null;
  try {
    var jsonString = api.LMSGetValue("cmi.suspend_data");
    if (jsonString && jsonString !== "") {
      var stateData = JSON.parse(jsonString);
      console.log("State loaded from SCORM:", stateData);
      return stateData;
    }
  } catch (e) {
    console.error("Error loading state:", e);
  }
  return null;
}

// Set section progress
function setSectionProgress(sectionId, completed, score) {
  var api = getAPI();
  if (api == null) return;
  try {
    var suspendData = api.LMSGetValue("cmi.suspend_data") || "{}";
    var progressData = JSON.parse(suspendData);

    if (!progressData.sections) {
      progressData.sections = {};
    }

    progressData.sections[sectionId] = {
      completed: completed,
      score: score || 0,
      completedAt: new Date().toISOString()
    };

    api.LMSSetValue("cmi.suspend_data", JSON.stringify(progressData));
    api.LMSCommit("");
    console.log("Section progress saved:", sectionId, completed);
  } catch (e) {
    console.warn("Error saving section progress:", e);
  }
}

// Get section progress
function getSectionProgress() {
  var api = getAPI();
  if (api == null) return {};
  try {
    var suspendData = api.LMSGetValue("cmi.suspend_data") || "{}";
    var progressData = JSON.parse(suspendData);
    return progressData.sections || {};
  } catch (e) {
    console.warn("Error loading section progress:", e);
    return {};
  }
}

// Get student name
function getStudentName() {
  var api = getAPI();
  if (api == null) return "Student";
  return api.LMSGetValue("cmi.core.student_name") || "Student";
}

// Get previous score
function getPreviousScore() {
  var api = getAPI();
  if (api == null) return null;
  var score = api.LMSGetValue("cmi.core.score.raw");
  return score ? parseFloat(score) : null;
}

// Get lesson status
function getLessonStatus() {
  var api = getAPI();
  if (api == null) return "not attempted";
  return api.LMSGetValue("cmi.core.lesson_status") || "not attempted";
}

// Save suspend data (for bookmarking/state)
function saveSuspendData(data) {
  var api = getAPI();
  if (api == null) return;
  api.LMSSetValue("cmi.suspend_data", JSON.stringify(data));
  api.LMSCommit("");
}

// Load suspend data
function loadSuspendData() {
  var api = getAPI();
  if (api == null) return null;
  var data = api.LMSGetValue("cmi.suspend_data");
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

// Auto-initialize on page load
window.addEventListener('load', function() {
  initSCORM();
});

// Auto-terminate on page unload
window.addEventListener('beforeunload', function() {
  termSCORM();
});

window.addEventListener('unload', function() {
  termSCORM();
});
`;

/**
 * Standalone API Wrapper
 * This JavaScript code provides SCORM-like functionality using localStorage
 * for courses that are not running in an LMS environment
 */
export const STANDALONE_API_WRAPPER = `
// Standalone Mode API - Uses localStorage for progress tracking
var isStandaloneMode = true;
var STORAGE_KEY = 'standalone_course_' + (window.location.pathname.replace(/[^a-z0-9]/gi, '_'));

// Initialize standalone session
function initSCORM() {
  console.log("Running in standalone mode - progress saved locally");
  var data = loadLocalData();
  if (!data.lesson_status) {
    data.lesson_status = 'incomplete';
    saveLocalData(data);
  }
  return true;
}

// Terminate session (no-op in standalone)
function termSCORM() {
  console.log("Standalone session ended");
  return true;
}

// Save data to localStorage
function saveLocalData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Error saving to localStorage:", e);
    return false;
  }
}

// Load data from localStorage
function loadLocalData() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Error loading from localStorage:", e);
    return {};
  }
}

// Set completion status
function setComplete() {
  var data = loadLocalData();
  data.lesson_status = 'completed';
  data.completed_at = new Date().toISOString();
  saveLocalData(data);
  console.log("Course marked as completed");
}

// Set score (0-100)
function setScore(score) {
  var data = loadLocalData();
  data.score = score;
  if (score >= 80) {
    data.lesson_status = 'passed';
  }
  saveLocalData(data);
  console.log("Score saved:", score);
}

// Set progress (0-100)
function setProgress(progress) {
  var data = loadLocalData();
  data.progress = progress;
  saveLocalData(data);
}

// Save state data
function saveState(stateData) {
  var data = loadLocalData();
  data.state = stateData;
  saveLocalData(data);
  console.log("State saved locally:", stateData);
  return true;
}

// Load state data
function loadState() {
  var data = loadLocalData();
  if (data.state) {
    console.log("State loaded from localStorage:", data.state);
    return data.state;
  }
  return null;
}

// Set section progress
function setSectionProgress(sectionId, completed, score) {
  var data = loadLocalData();
  if (!data.sections) {
    data.sections = {};
  }
  data.sections[sectionId] = {
    completed: completed,
    score: score || 0,
    completedAt: new Date().toISOString()
  };
  saveLocalData(data);
  console.log("Section progress saved:", sectionId, completed);
}

// Get section progress
function getSectionProgress() {
  var data = loadLocalData();
  return data.sections || {};
}

// Get student name (not available in standalone)
function getStudentName() {
  return "Learner";
}

// Get previous score
function getPreviousScore() {
  var data = loadLocalData();
  return data.score || null;
}

// Get lesson status
function getLessonStatus() {
  var data = loadLocalData();
  return data.lesson_status || "not attempted";
}

// Save suspend data
function saveSuspendData(suspendData) {
  var data = loadLocalData();
  data.suspend_data = suspendData;
  saveLocalData(data);
}

// Load suspend data
function loadSuspendData() {
  var data = loadLocalData();
  return data.suspend_data || null;
}

// Auto-initialize on page load
window.addEventListener('load', function() {
  initSCORM();
});
`;

