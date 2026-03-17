import { Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import { ProtectedRoute } from './components';
import { Home, Login, CreateRecipe, RecipeDetail, Profile, Messages } from './pages';

function App() {
  return (
    <Routes>
      {/* 登录页面不需要 Layout */}
      <Route path="/login" element={<Login />} />

      {/* 其他页面使用 Layout */}
      <Route path="/" element={
        <Layout>
          <Home />
        </Layout>
      } />

      <Route path="/recipe/:id" element={
        <Layout>
          <RecipeDetail />
        </Layout>
      } />

      <Route path="/profile/:id" element={
        <Layout>
          <Profile />
        </Layout>
      } />

      {/* 需要登录的页面 */}
      <Route path="/create" element={
        <ProtectedRoute>
          <Layout>
            <CreateRecipe />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/messages" element={
        <ProtectedRoute>
          <Layout>
            <Messages />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
