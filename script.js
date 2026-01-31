// Lesson Data
const lessonsData = {
    math: {
        name: 'Mathématiques',
        icon: '📐',
        lessons: [
            'Limites et continuité',
            'Suites numériques',
            'Dérivation et étude des fonctions',
            'Fonctions logarithmiques',
            'Fonctions exponentielles',
            'Théorème des accroissements finis',
            'Équations différentielles',
            'Nombres complexes 1 & 2',
            'Fonctions primitives & intégral',
            'Géométrie dans l\'espace',
            'Dénombrement',
            'Probabilités'
        ]
    },
    physics: {
        name: 'Physique & Chimie',
        icon: '⚛️',
        lessons: [
            'Ondes mécaniques progressives',
            'Ondes périodiques',
            'Propagation des ondes lumineuses',
            'Transformations lentes/rapides',
            'Réactions & vitesse chimique',
            'Radioactivité',
            'Équilibre chimique',
            'Dipôles RC, RL',
            'Oscillations RLC',
            'Circuit RLC en régime sinusoïdal',
            'Ondes électromagnétiques'
        ]
    },
    svt: {
        name: 'SVT',
        icon: '🧬',
        lessons: [
            'Cellule & organisation',
            'Cycle cellulaire & mitose',
            'ADN & génétique',
            'Méiose & diversité',
            'Hérédité',
            'Métabolisme & respiration',
            'Écosystèmes',
            'Tectonique',
            'Évolution',
            'Environnement'
        ]
    },
    philosophy: {
        name: 'Philosophie',
        icon: '🧠',
        lessons: [
            'مجزوءة الوضع البشري - تعريف الوضع البشري',
            'اللغة والحقيقة',
            'الحرية والواجب',
            'الدولة والعدالة',
            'مجزوءة المعرفة والتجربة - النظرية والتجريب',
            'مفهوم الحقيقة',
            'العلاقة بين المعرفة والتجربة',
            'مجزوءة الإنسان والآخر - الشخص والهوية',
            'مفهوم الغير',
            'العلاقات الإنسانية'
        ]
    },
    english: {
        name: 'English',
        icon: '🇬🇧',
        lessons: [
            'Youth – Potential & Challenges',
            'Humour',
            'Education',
            'Sustainable Development',
            'Women and Power',
            'Culture',
            'Citizenship',
            'International Organizations',
            'Science & Technology',
            'Brain Drain',
            'Grammar, Comprehension, Writing'
        ]
    }
};

// State
let currentSubject = null;
let currentLesson = null;
let progress = JSON.parse(localStorage.getItem('epsilon-progress')) || {};
let notes = JSON.parse(localStorage.getItem('epsilon-notes')) || {};
let studyTime = parseInt(localStorage.getItem('epsilon-study-time')) || 0;

// Timer State
let timerInterval = null;
let timerSeconds = 25 * 60;
let timerDuration = 25 * 60;
let isTimerRunning = false;

// Focus Mode
let focusAudio = null;
let isFocusMode = false;

// Elements
const subjectsView = document.getElementById('subjectsView');
const lessonsView = document.getElementById('lessonsView');
const studyView = document.getElementById('studyView');
const lessonsContainer = document.getElementById('lessonsContainer');
const currentSubjectName = document.getElementById('currentSubjectName');
const currentSubjectIcon = document.getElementById('currentSubjectIcon');
const currentSubjectProgress = document.getElementById('currentSubjectProgress');
const lessonTitle = document.getElementById('lessonTitle');
const notesArea = document.getElementById('notesArea');
const timerDisplay = document.getElementById('timerDisplay');
const timerControl = document.getElementById('timerControl');
const timerProgress = document.querySelector('.timer-progress');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateSubjectProgress();
});

// Setup Event Listeners
function setupEventListeners() {
    // Subject cards
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', () => {
            const subject = card.dataset.subject;
            showLessons(subject);
        });
    });

    // Back buttons
    document.getElementById('backToSubjects').addEventListener('click', () => {
        showView('subjects');
    });

    document.getElementById('backToLessons').addEventListener('click', () => {
        showView('lessons');
    });

    // Complete lesson
    document.getElementById('completeLesson').addEventListener('click', () => {
        toggleLessonComplete();
    });

    // Save notes
    document.getElementById('saveNotes').addEventListener('click', () => {
        saveNotes();
    });

    // Timer controls
    timerControl.addEventListener('click', toggleTimer);
    
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTimerPreset(parseInt(btn.dataset.time));
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Focus mode
    document.getElementById('focusMode').addEventListener('click', toggleFocusMode);

    // Theme toggle
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);

    // Stats modal
    document.getElementById('statsBtn').addEventListener('click', () => {
        showStats();
        document.getElementById('statsModal').classList.add('active');
    });

    // Close modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.dataset.modal;
            document.getElementById(modal).classList.remove('active');
        });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Show View
function showView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${view}View`).classList.add('active');
}

// Show Lessons
function showLessons(subject) {
    currentSubject = subject;
    const subjectData = lessonsData[subject];
    
    currentSubjectName.textContent = subjectData.name;
    currentSubjectIcon.textContent = subjectData.icon;
    
    const completed = getCompletedCount(subject);
    const total = subjectData.lessons.length;
    currentSubjectProgress.textContent = `${completed}/${total} leçons complétées`;
    
    // Render lessons
    lessonsContainer.innerHTML = '';
    subjectData.lessons.forEach((lesson, index) => {
        const lessonId = `${subject}-${index}`;
        const isCompleted = progress[lessonId] || false;
        
        const lessonItem = document.createElement('div');
        lessonItem.className = `lesson-item ${isCompleted ? 'completed' : ''}`;
        lessonItem.innerHTML = `
            <div class="lesson-checkbox">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            </div>
            <div class="lesson-title">${lesson}</div>
            <div class="lesson-number">Leçon ${index + 1}</div>
        `;
        
        lessonItem.addEventListener('click', () => {
            showStudy(subject, index);
        });
        
        lessonsContainer.appendChild(lessonItem);
    });
    
    showView('lessons');
}

// Show Study
function showStudy(subject, lessonIndex) {
    currentLesson = lessonIndex;
    const subjectData = lessonsData[subject];
    const lesson = subjectData.lessons[lessonIndex];
    const lessonId = `${subject}-${lessonIndex}`;
    
    lessonTitle.textContent = lesson;
    notesArea.value = notes[lessonId] || '';
    
    // Update complete button
    const completeBtn = document.getElementById('completeLesson');
    if (progress[lessonId]) {
        completeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Leçon terminée
        `;
        completeBtn.style.background = 'var(--accent-green)';
    } else {
        completeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Marquer comme terminé
        `;
        completeBtn.style.background = 'var(--accent-blue)';
    }
    
    showView('study');
}

// Toggle Lesson Complete
function toggleLessonComplete() {
    const lessonId = `${currentSubject}-${currentLesson}`;
    progress[lessonId] = !progress[lessonId];
    localStorage.setItem('epsilon-progress', JSON.stringify(progress));
    
    // Update button
    const completeBtn = document.getElementById('completeLesson');
    if (progress[lessonId]) {
        completeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Leçon terminée
        `;
        completeBtn.style.background = 'var(--accent-green)';
    } else {
        completeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Marquer comme terminé
        `;
        completeBtn.style.background = 'var(--accent-blue)';
    }
    
    updateSubjectProgress();
}

// Save Notes
function saveNotes() {
    const lessonId = `${currentSubject}-${currentLesson}`;
    notes[lessonId] = notesArea.value;
    localStorage.setItem('epsilon-notes', JSON.stringify(notes));
    
    // Show feedback
    const saveBtn = document.getElementById('saveNotes');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '✓ Sauvegardé';
    saveBtn.style.background = 'var(--accent-green)';
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = 'var(--accent-blue)';
    }, 2000);
}

// Get Completed Count
function getCompletedCount(subject) {
    const subjectData = lessonsData[subject];
    let count = 0;
    subjectData.lessons.forEach((_, index) => {
        const lessonId = `${subject}-${index}`;
        if (progress[lessonId]) count++;
    });
    return count;
}

// Update Subject Progress
function updateSubjectProgress() {
    document.querySelectorAll('.subject-card').forEach(card => {
        const subject = card.dataset.subject;
        const subjectData = lessonsData[subject];
        const completed = getCompletedCount(subject);
        const total = subjectData.lessons.length;
        const percentage = (completed / total) * 100;
        
        card.querySelector('.progress-text').textContent = `${completed}/${total} leçons`;
        card.querySelector('.progress-fill').style.width = `${percentage}%`;
    });
}

// Timer Functions
function toggleTimer() {
    if (isTimerRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    isTimerRunning = true;
    timerControl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
        </svg>
    `;
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        updateTimerProgress();
        
        if (timerSeconds <= 0) {
            pauseTimer();
            playTimerSound();
            studyTime += timerDuration;
            localStorage.setItem('epsilon-study-time', studyTime.toString());
        }
    }, 1000);
}

function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
    timerControl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
    `;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimerProgress() {
    const progress = ((timerDuration - timerSeconds) / timerDuration) * 565;
    timerProgress.style.strokeDashoffset = 565 - progress;
}

function setTimerPreset(minutes) {
    pauseTimer();
    timerDuration = minutes * 60;
    timerSeconds = timerDuration;
    updateTimerDisplay();
    updateTimerProgress();
}

function playTimerSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Focus Mode
function toggleFocusMode() {
    const focusBtn = document.getElementById('focusMode');
    
    if (isFocusMode) {
        // Stop focus sound
        if (focusAudio) {
            focusAudio.close();
            focusAudio = null;
        }
        isFocusMode = false;
        focusBtn.classList.remove('active');
        focusBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            Activer le mode focus
        `;
    } else {
        // Start white noise
        focusAudio = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = 4096;
        const whiteNoise = focusAudio.createScriptProcessor(bufferSize, 1, 1);
        
        whiteNoise.onerror = () => {};
        whiteNoise.addEventListener('audioprocess', (e) => {
            const output = e.outputBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        });
        
        const gain = focusAudio.createGain();
        gain.gain.value = 0.05;
        
        whiteNoise.connect(gain);
        gain.connect(focusAudio.destination);
        
        isFocusMode = true;
        focusBtn.classList.add('active');
        focusBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
            Mode focus activé
        `;
    }
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('epsilon-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

// Load theme
const savedTheme = localStorage.getItem('epsilon-theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}

// Show Stats
function showStats() {
    let totalCompleted = 0;
    let totalLessons = 0;
    
    Object.keys(lessonsData).forEach(subject => {
        const subjectData = lessonsData[subject];
        totalLessons += subjectData.lessons.length;
        totalCompleted += getCompletedCount(subject);
    });
    
    const completionRate = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
    const hours = Math.floor(studyTime / 3600);
    const minutes = Math.floor((studyTime % 3600) / 60);
    
    document.getElementById('totalCompleted').textContent = totalCompleted;
    document.getElementById('totalTime').textContent = `${hours}h ${minutes}m`;
    document.getElementById('completionRate').textContent = `${completionRate}%`;
}

// Add SVG gradient for timer
const svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
svgDefs.innerHTML = `
    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0a84ff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#bf5af2;stop-opacity:1" />
    </linearGradient>
`;
document.querySelector('.timer-circle').appendChild(svgDefs);
