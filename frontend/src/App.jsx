import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import TakeQuiz from './pages/TakeQuiz';
import Profile from './pages/Profile';

function App() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Если нет токена - только страницы входа и регистрации
    if (!token) {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Главная страница - для студентов, для админа тоже показываем (не редиректим) */}
                <Route path="/" element={<Dashboard />} />
                
                {/* Админ-панель - только для админов */}
                <Route 
                    path="/admin" 
                    element={user.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} 
                />
                
                {/* Профиль - доступен всем */}
                <Route path="/profile" element={<Profile />} />
                
                {/* Прохождение теста - доступно всем */}
                <Route path="/quiz/:id" element={<TakeQuiz />} />
                
                {/* Редиректы для страниц входа/регистрации, если уже авторизован */}
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/register" element={<Navigate to="/" />} />
                
                {/* 404 - всё остальное */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;