// Mock Database implementation
const db = {
    getUsers: function() {
        let saved = localStorage.getItem('users');
        if (!saved) {
            const initial = [
                { id: 'T1', role: 'teacher', name: 'Prof. Anderson', password: 'password' },
                { id: 'S1', role: 'student', name: 'Alice Johnson', password: 'password' },
                { id: 'S2', role: 'student', name: 'Bob Williams', password: 'password' },
                { id: 'S3', role: 'student', name: 'Charlie Davis', password: 'password' },
                { id: 'S4', role: 'student', name: 'Diana Prince', password: 'password' },
            ];
            localStorage.setItem('users', JSON.stringify(initial));
            return initial;
        }
        return JSON.parse(saved);
    },

    saveUser: function(userObj) {
        let users = this.getUsers();
        users.push(userObj);
        localStorage.setItem('users', JSON.stringify(users));
        return userObj;
    },

    register: function(role, name, password) {
        let users = this.getUsers();
        let prefix = role === 'teacher' ? 'T' : 'S';
        let roleUsers = users.filter(u => u.role === role);
        let maxId = 0;
        roleUsers.forEach(u => {
            let num = parseInt(u.id.substring(1));
            if (num > maxId) maxId = num;
        });
        
        let newId = `${prefix}${maxId + 1}`;
        let newUser = { id: newId, role, name, password };
        this.saveUser(newUser);
        return newUser;
    },

    removeUser: function(id) {
        let users = this.getUsers();
        users = users.filter(u => u.id !== id);
        localStorage.setItem('users', JSON.stringify(users));
        
        let attendance = this.getAttendance();
        attendance = attendance.filter(a => a.studentId !== id);
        localStorage.setItem('attendance', JSON.stringify(attendance));
    },
    
    getStudents: function() {
        return this.getUsers().filter(u => u.role === 'student');
    },

    getAttendance: function() {
        return JSON.parse(localStorage.getItem('attendance') || '[]');
    },

    saveAttendanceRecords: function(records, date) {
        let currentDB = this.getAttendance();
        currentDB = currentDB.filter(a => a.date !== date);
        currentDB = [...currentDB, ...records];
        localStorage.setItem('attendance', JSON.stringify(currentDB));
    },

    getAttendanceByDate: function(date) {
        return this.getAttendance().filter(a => a.date === date);
    },

    getAttendanceByStudent: function(studentId) {
        return this.getAttendance().filter(a => a.studentId === studentId);
    },

    authenticate: function(id, password) {
        const user = this.getUsers().find(u => u.id === id && u.password === password);
        if (user) {
            const { password, ...safeUser } = user;
            return safeUser;
        }
        return null;
    }
};
