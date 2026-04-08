import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { RoleBasedRoute } from "./components/RoleBasedRoute"
import { Home } from "./pages/Home"
import { AdminLayout } from "./components/admin/AdminLayout"
import { StudentLayout } from "./components/student/StudentLayout"
import { Documents } from "./pages/admin/Documents"
import { QuizGenerate } from "./pages/admin/QuizGenerate"
import { QuizEdit } from "./pages/admin/QuizEdit"
import { Quizzes } from "./pages/admin/Quizzes"
import { Settings } from "./pages/admin/Settings"
import { QuizList } from "./pages/student/QuizList"
import { QuizTake } from "./pages/student/QuizTake"
import { QuizResults } from "./pages/student/QuizResults"
import { QuizHistory } from "./pages/student/QuizHistory"
import { Profile } from "./pages/student/Profile"
import { BlankPage } from "./pages/BlankPage"
import { ROLES } from "@shared/config/roles"

function App() {
  return (
  <AuthProvider>
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute><RoleBasedRoute allowedRole={ROLES.ADMIN}><AdminLayout /></RoleBasedRoute></ProtectedRoute>}>
            <Route index element={<Documents />} />
            <Route path="documents" element={<Documents />} />
            <Route path="quiz/generate" element={<QuizGenerate />} />
            <Route path="quiz/:id/edit" element={<QuizEdit />} />
            <Route path="quizzes" element={<Quizzes />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/student" element={<ProtectedRoute><RoleBasedRoute allowedRole={ROLES.STUDENT}><StudentLayout /></RoleBasedRoute></ProtectedRoute>}>
            <Route index element={<QuizList />} />
            <Route path="quizzes" element={<QuizList />} />
            <Route path="quiz/:id" element={<QuizTake />} />
            <Route path="quiz-result/:id" element={<QuizResults />} />
            <Route path="results/:id" element={<QuizResults />} />
            <Route path="history" element={<QuizHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<BlankPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  </AuthProvider>
  )
}

export default App