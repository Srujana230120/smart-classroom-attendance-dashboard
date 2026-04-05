

// ---- State Management ----
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
// For Teacher Dashboard
let selectedDate = new Date().toISOString().split('T')[0];
// Map of studentId -> 'present' | 'absent' | null
let currentAttendanceDraft = {}; 
let currentView = 'login'; // 'login' or 'signup'

const appContainer = document.getElementById('app');

// ---- Setup & Initialization ----
function init() {
    render();
}

function showNotification(msg) {
    let notifyEl = document.getElementById('notification-toast');
    if (!notifyEl) {
        notifyEl = document.createElement('div');
        notifyEl.id = 'notification-toast';
        notifyEl.className = 'notification';
        document.body.appendChild(notifyEl);
    }
    notifyEl.innerHTML = msg;
    notifyEl.classList.add('show');
    setTimeout(() => {
        notifyEl.classList.remove('show');
    }, 3000);
}

// ---- Render Router ----
function render() {
    if (!currentUser) {
        if (currentView === 'signup') renderSignup();
        else renderLogin();
    } else if (currentUser.role === 'teacher') {
        renderTeacherDashboard();
    } else if (currentUser.role === 'student') {
        renderStudentDashboard();
    }
    // Re-initialize feather icons after DOM update
    if (window.feather) {
        window.feather.replace();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const idInput = document.getElementById('login-id').value.trim();
    const passwordInput = document.getElementById('login-password').value;
    
    if(!idInput || !passwordInput) return;

    const user = db.authenticate(idInput, passwordInput);
    if(user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification(`Welcome back, ${user.name}!`);
        render();
    } else {
        showNotification('Invalid User ID or Password.');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    render();
}

// ---- Render: Login ----
function renderLogin() {
    appContainer.innerHTML = `
        <div class="center-wrapper">
            <div class="glass-panel login-card">
                <div class="brand-icon">
                    <i data-feather="check-circle" style="width: 32px; height: 32px;"></i>
                </div>
                <h1>Sign In</h1>
                <p>Smart Classroom</p>

                <form id="login-form">
                    <div class="input-group">
                        <label for="login-id">User ID (Hint: T1, S1)</label>
                        <input type="text" id="login-id" class="input-glass" placeholder="Enter 'T1' for Teacher" required autocomplete="off">
                    </div>
                    <div class="input-group">
                        <label for="login-password">Password (Hint: password)</label>
                        <input type="password" id="login-password" class="input-glass" placeholder="Enter password" required>
                    </div>
                    <button type="submit" class="btn-primary">
                        <span>Access Dashboard</span>
                        <i data-feather="arrow-right"></i>
                    </button>
                    <div class="login-switch" style="margin-top: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">
                        Don't have an account? <a id="link-to-signup" style="color: var(--accent); cursor: pointer; font-weight: 500;">Sign Up</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('link-to-signup').addEventListener('click', () => {
        currentView = 'signup';
        render();
    });

    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

// ---- Render: Signup ----
function renderSignup() {
    appContainer.innerHTML = `
        <div class="center-wrapper">
            <div class="glass-panel login-card">
                <div class="brand-icon">
                    <i data-feather="user-plus" style="width: 32px; height: 32px;"></i>
                </div>
                <h1>Create Account</h1>
                <p>Register to sync your attendance</p>

                <form id="signup-form">
                    <div class="input-group">
                        <label for="signup-name">Full Name</label>
                        <input type="text" id="signup-name" class="input-glass" placeholder="E.g. Jane Doe" required autocomplete="off">
                    </div>
                    <div class="input-group">
                        <label for="signup-role">Role</label>
                        <select id="signup-role" class="input-glass" required style="background: rgba(0,0,0,0.5);">
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="signup-password">Password</label>
                        <input type="password" id="signup-password" class="input-glass" placeholder="Create a password" required>
                    </div>
                    <button type="submit" class="btn-primary">
                        <span>Register Now</span>
                        <i data-feather="check"></i>
                    </button>
                    <div class="login-switch" style="margin-top: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">
                        Already have an account? <a id="link-to-login" style="color: var(--accent); cursor: pointer; font-weight: 500;">Log In</a>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('link-to-login').addEventListener('click', () => {
        currentView = 'login';
        render();
    });

    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const nm = document.getElementById('signup-name').value.trim();
        const role = document.getElementById('signup-role').value;
        const pass = document.getElementById('signup-password').value;

        if(!nm || !pass) return;

        const newUser = db.register(role, nm, pass);
        const safeUser = { id: newUser.id, role: newUser.role, name: newUser.name };
        currentUser = safeUser;
        localStorage.setItem('currentUser', JSON.stringify(safeUser));
        
        showNotification(`Success! Your Auto-Generated ID is ${newUser.id}`);
        // Render will occur due to currentUser state change
        render();
    });
}

// ---- Navigation Component ----
function getNavHtml() {
    return `
        <nav class="dashboard-nav glass-panel">
            <div class="nav-brand">
                <div class="nav-brand-icon">
                    <i data-feather="layers"></i>
                </div>
                SyncClass
            </div>
            <div class="nav-actions">
                <div class="user-info">
                    <i data-feather="user"></i>
                    <span>${currentUser.name}</span>
                </div>
                <button class="btn-logout" id="btn-logout">
                    <i data-feather="log-out"></i>
                    <span>Log Out</span>
                </button>
            </div>
        </nav>
    `;
}

function attachNavEvents() {
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
}

// ---- Render: Teacher Dashboard ----
function renderTeacherDashboard() {
    // Determine existing records for selected Date
    const existingRecords = db.getAttendanceByDate(selectedDate);
    const students = db.getStudents();
    
    // Initialize draft state if empty
    currentAttendanceDraft = {};
    students.forEach(s => {
        const found = existingRecords.find(r => r.studentId === s.id);
        currentAttendanceDraft[s.id] = found ? found.status : null;
    });

    const studentListHtml = students.map(s => {
        const cStat = currentAttendanceDraft[s.id];
        return `
            <div class="student-row glass-panel">
                <div class="student-info">
                    <h3>${s.name}</h3>
                    <p>ID: ${s.id}</p>
                </div>
                <div class="attendance-toggle" style="display:flex; align-items:center; gap: 0.5rem;">
                    <button class="btn-toggle ${cStat === 'present' ? 'active present' : ''}" 
                            data-student="${s.id}" data-action="present">
                        Present
                    </button>
                    <button class="btn-toggle ${cStat === 'absent' ? 'active absent' : ''}" 
                            data-student="${s.id}" data-action="absent">
                        Absent
                    </button>
                    <button class="btn-remove" data-student="${s.id}" style="background:transparent; border:none; color:var(--danger); cursor:pointer; padding:0.5rem; transition:var(--transition);" title="Remove Student">
                        <i data-feather="trash-2" style="width:18px; pointer-events:none;"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    appContainer.innerHTML = `
        ${getNavHtml()}
        <div class="dashboard-grid">
            <aside>
                <div id="live-stats-container"></div>
                <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 1.5rem;">
                    <h3 style="margin-bottom:0.5rem;font-size:1rem;color:var(--text-main)">Enroll Student</h3>
                    <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">Add a student directly to the roll.</p>
                    <div class="quick-add-form" style="display:flex;gap:0.5rem;">
                        <input type="text" id="quick-student-name" class="input-glass" placeholder="Student Name" style="padding:0.5rem; flex:1;">
                        <button id="btn-quick-add" class="btn-primary" style="padding: 0.5rem 1rem; width:auto;">Add</button>
                    </div>
                </div>

                <div class="glass-panel" style="padding: 1.5rem;">
                    <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-muted)">Instructions</h3>
                    <p style="font-size:0.9rem;line-height:1.5;">Select a date using the picker, then mark each student as Present or Absent. Click Save changes when done.</p>
                </div>
            </aside>
            <main>
                <div class="glass-panel" style="padding: 2rem;">
                    <div class="control-header">
                        <h2>Attendance Roll Call</h2>
                        <input type="date" id="date-picker" class="input-glass" style="width: auto;" value="${selectedDate}">
                    </div>
                    
                    <div class="student-list" id="student-list-container">
                        ${studentListHtml}
                    </div>

                    <div class="save-wrapper">
                        <button class="btn-primary" id="btn-save-attendance" style="width:auto; padding: 0.8rem 2rem;">
                            <i data-feather="save"></i>
                            Save Attendance
                        </button>
                    </div>
                </div>
            </main>
        </div>
    `;

    function renderStats() {
        const totalSt = students.length;
        let presentCount = 0; let absentCount = 0;
        Object.values(currentAttendanceDraft).forEach(status => {
            if (status === 'present') presentCount++;
            if (status === 'absent') absentCount++;
        });
        const attendancePercent = totalSt > 0 ? Math.round((presentCount / totalSt) * 100) : 0;
        
        const container = document.getElementById('live-stats-container');
        if (container) {
            container.innerHTML = `
                <div class="stat-card glass-panel" style="margin-bottom: 0.5rem; padding: 1rem;">
                    <div class="stat-value" style="font-size: 2rem;">${totalSt}</div>
                    <div class="stat-label">Total Students</div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <div class="stat-card glass-panel" style="margin-bottom: 0; padding: 1rem;">
                        <div class="stat-value" style="font-size: 1.5rem; color: var(--success);">${presentCount}</div>
                        <div class="stat-label" style="font-size: 0.8rem;">Present</div>
                    </div>
                    <div class="stat-card glass-panel" style="margin-bottom: 0; padding: 1rem;">
                        <div class="stat-value" style="font-size: 1.5rem; color: var(--danger);">${absentCount}</div>
                        <div class="stat-label" style="font-size: 0.8rem;">Absent</div>
                    </div>
                </div>
                <div class="stat-card glass-panel" style="margin-bottom: 1.5rem; padding: 1rem;">
                    <div class="stat-value" style="font-size: 2rem; color: var(--accent);">${attendancePercent}%</div>
                    <div class="stat-label">Attendance Rate</div>
                </div>
            `;
        }
    }
    renderStats();

    attachNavEvents();

    document.getElementById('date-picker').addEventListener('change', (e) => {
        selectedDate = e.target.value;
        render(); // Re-render table for new date
    });

    document.getElementById('btn-quick-add').addEventListener('click', () => {
        const inputStr = document.getElementById('quick-student-name').value.trim();
        if(!inputStr) return;
        const newStudent = db.register('student', inputStr, 'password');
        showNotification(`Added ${newStudent.name} (ID: ${newStudent.id})`);
        render();
    });

    document.getElementById('student-list-container').addEventListener('click', (e) => {
        if(e.target.classList.contains('btn-remove') || e.target.closest('.btn-remove')) {
            const btn = e.target.closest('.btn-remove') || e.target;
            const studentId = btn.getAttribute('data-student');
            if (confirm(`Are you sure you want to remove student ${studentId}?`)) {
                db.removeUser(studentId);
                showNotification(`Student ${studentId} removed.`);
                render();
            }
            return;
        }

        if(e.target.classList.contains('btn-toggle')) {
            const studentId = e.target.getAttribute('data-student');
            const action = e.target.getAttribute('data-action');
            currentAttendanceDraft[studentId] = action;
            // visually update
            const parent = e.target.parentElement;
            parent.querySelectorAll('.btn-toggle').forEach(b => {
                b.className = 'btn-toggle';
            });
            e.target.classList.add('active', action);
            renderStats(); // Dynamically update the teacher stats
        }
    });

    document.getElementById('btn-save-attendance').addEventListener('click', () => {
        // Collect draft into array
        const recordsToSave = [];
        for (const [sId, status] of Object.entries(currentAttendanceDraft)) {
            if (status) {
                recordsToSave.push({
                    date: selectedDate,
                    studentId: sId,
                    status: status
                });
            }
        }
        
        if (recordsToSave.length === 0) {
            showNotification('No attendance marked to save.');
            return;
        }

        db.saveAttendanceRecords(recordsToSave, selectedDate);
        showNotification('Attendance Saved Successfully!');
    });
}

// ---- Render: Student Dashboard ----
function renderStudentDashboard() {
    const records = db.getAttendanceByStudent(currentUser.id);
    
    const totalClasses = records.length;
    const presentClasses = records.filter(r => r.status === 'present').length;
    let attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    // Check if percentage is bad to color code
    const colorCode = attendancePercentage > 75 ? 'var(--success)' : (attendancePercentage > 50 ? 'orange' : 'var(--danger)');

    const historyHtml = records.sort((a,b) => new Date(b.date) - new Date(a.date)).map(r => {
        const isPresent = r.status === 'present';
        return `
            <div class="student-row glass-panel hover-none" style="margin-bottom: 1rem;">
                <div class="student-info">
                    <h3 style="font-size: 1.1rem; display: flex; align-items:center; gap: 0.5rem;">
                        <i data-feather="calendar" style="width: 16px;"></i> ${r.date}
                    </h3>
                </div>
                <div>
                   <span style="padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; 
                                background: ${isPresent ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; 
                                color: ${isPresent ? 'var(--success)' : 'var(--danger)'}">
                       ${isPresent ? 'Present' : 'Absent'}
                   </span>
                </div>
            </div>
        `;
    }).join('') || '<p style="color:var(--text-muted); text-align:center; padding: 2rem;">No attendance records found.</p>';

    appContainer.innerHTML = `
        ${getNavHtml()}
        <div class="dashboard-grid">
            <aside>
                <div class="stat-card glass-panel" style="border-top: 4px solid ${colorCode}">
                    <div class="stat-value" style="color: ${colorCode}; font-size: 3rem;">${attendancePercentage}%</div>
                    <div class="stat-label">Overall Attendance</div>
                </div>
                <div class="stat-card glass-panel">
                    <div class="stat-value" style="font-size: 2rem;">${presentClasses} / ${totalClasses}</div>
                    <div class="stat-label">Classes Attended</div>
                </div>
            </aside>
            <main>
                <div class="glass-panel" style="padding: 2rem;">
                    <h2 style="margin-bottom: 1.5rem; display:flex; align-items:center; gap:0.5rem;">
                        <i data-feather="clock"></i> History
                    </h2>
                    <div class="student-list" style="max-height: 500px; overflow-y: auto;">
                        ${historyHtml}
                    </div>
                </div>
            </main>
        </div>
    `;

    attachNavEvents();
}

// ---- Boot up ----
init();
