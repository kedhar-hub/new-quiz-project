// ------------------- SUPABASE SETUP -------------------
const supabaseUrl = "YOUR_SUPABASE_URL"; // <-- https://qgvgwvqzsenzliqbtigk.supabase.co
const supabaseKey = "YOUR_SUPABASE_ANON_KEY"; // <-- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndmd3dnF6c2VuemxpcWJ0aWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5OTY5OTYsImV4cCI6MjA3MzU3Mjk5Nn0.PieDT51qrUSoAsfqUZLHOSEjrdOai7ToatkNJqHn8VM
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ------------------- GLOBAL VARIABLES -------------------
let userEmail = "";
let score = 0;
let startTime, timerInterval;
let timeLeft = 200; // 200 seconds total
let currentQuestionIndex = 0;

// ------------------- VERY TOUGH PATIENT SAFETY QUESTIONS -------------------
const questions = [
  {
    q: "What is the most critical step in preventing medication errors in pediatric patients?",
    options: ["Checking patient ID", "Double-checking the drug dose", "Hand hygiene before administration", "Confirming family consent"],
    answer: "Double-checking the drug dose"
  },
  {
    q: "Which neonatal intervention has the highest evidence for reducing hospital-acquired infections?",
    options: ["Frequent bathing", "Strict hand hygiene protocols", "Daily antibiotic prophylaxis", "Limited feeding schedules"],
    answer: "Strict hand hygiene protocols"
  },
  {
    q: "During a neonatal resuscitation, which is the first physiological parameter to assess after initial ventilation?",
    options: ["Blood glucose", "Heart rate", "Oxygen saturation", "Respiratory rate"],
    answer: "Heart rate"
  },
  {
    q: "What is the recommended maximum time for umbilical catheter placement verification to prevent complications?",
    options: ["24 hours", "48 hours", "Immediately after insertion", "1 week"],
    answer: "Immediately after insertion"
  },
  {
    q: "Which of the following is considered the most reliable indicator of safe pediatric fluid management?",
    options: ["Urine output", "Blood pressure", "Heart rate", "Capillary refill time"],
    answer: "Urine output"
  },
  {
    q: "For pediatric patients, the 'five rights' of medication administration include all except:",
    options: ["Right patient", "Right dose", "Right time", "Right nurse"],
    answer: "Right nurse"
  },
  {
    q: "In a NICU setting, which strategy is most effective in preventing central line-associated bloodstream infections (CLABSI)?",
    options: ["Routine line changes every 48 hours", "Full barrier precautions during insertion", "Daily dressing changes regardless of contamination", "Topical antibiotics at insertion site"],
    answer: "Full barrier precautions during insertion"
  },
  {
    q: "A newborn shows persistent hypoglycemia despite IV glucose. Which patient safety action is most urgent?",
    options: ["Increase feeding frequency", "Recheck blood glucose immediately", "Order routine labs tomorrow", "Document and wait"],
    answer: "Recheck blood glucose immediately"
  },
  {
    q: "Which is the most accurate method for preventing wrong-site surgery in pediatric patients?",
    options: ["Marking surgical site with a pen", "Team 'time-out' before incision", "Asking parents for site confirmation", "Visual check by surgeon only"],
    answer: "Team 'time-out' before incision"
  },
  {
    q: "In infection control, what is the single most effective intervention to reduce hospital-acquired infections in children?",
    options: ["Proper hand hygiene", "Routine environmental cleaning", "Wearing gloves", "Isolating all patients"],
    answer: "Proper hand hygiene"
  }
];

// ------------------- REGISTRATION LOGIC -------------------
const form = document.getElementById("registrationForm");
if(form){
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    userEmail = email;

    // Check if email already exists
    let { data } = await supabase.from("players").select().eq("email", email);
    if(data.length > 0){
      document.getElementById("errorMsg").innerText = "Email already registered!";
      return;
    }

    // Save to Supabase
    await supabase.from("players").insert([{name, email, score:0, time:0}]);

    // Go to quiz
    window.location.href = "quiz.html";
  });
}

// ------------------- QUIZ LOGIC -------------------
const quizContainer = document.getElementById("quiz-container");
if(quizContainer){
  startTime = Date.now();
  timerInterval = setInterval(()=>{
    timeLeft--;
    document.getElementById("time").innerText = timeLeft;
    if(timeLeft <= 0){
      clearInterval(timerInterval);
      endQuiz();
    }
  }, 1000);
  showQuestion();
}

function showQuestion(){
  if(currentQuestionIndex >= questions.length){
    endQuiz();
    return;
  }
  const q = questions[currentQuestionIndex];
  document.getElementById("question").innerText = q.q;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  q.options.forEach(opt=>{
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = ()=>checkAnswer(opt);
    optionsDiv.appendChild(btn);
  });
}

async function checkAnswer(selected){
  if(selected === questions[currentQuestionIndex].answer){
    score++;
    currentQuestionIndex++;
    showQuestion();
  } else {
    endQuiz();
  }
}

async function endQuiz(){
  clearInterval(timerInterval);
  const totalTime = 200 - timeLeft;

  // Update score in Supabase
  if(userEmail){
    await supabase.from("players")
      .update({score, time: totalTime})
      .eq("email", userEmail);
  }

  alert("Quiz over! Your result will be updated in leaderboard.");
  window.location.href = "index.html";
}

// ------------------- LEADERBOARD LOGIC -------------------
const leaderboardTable = document.getElementById("leaderboard");
if(leaderboardTable){
  loadLeaderboard();
}

async function loadLeaderboard(){
  const { data } = await supabase.from("players")
    .select()
    .order('score', {ascending:false})
    .order('time', {ascending:true});
  const tbody = leaderboardTable.querySelector("tbody");
  data.forEach(player=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${player.name}</td><td>${player.score}</td><td>${player.time}</td>`;
    tbody.appendChild(tr);
  });
}
