import { useState, type FormEvent, type ChangeEvent } from 'react'; 
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // IMPORTANTE: Importamos tu instancia de axios

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate(); // Hook para redirigir después del login
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // 1. Hacemos la petición HTTP enviando las credenciales al backend
      const response = await api.post('/auth/login', { email, password });
      
      // 2. Extraemos los datos que nos devuelve el backend
      // (Asumiendo que tu backend devuelve { token: "...", user: {...} })
      const { token} = response.data;
      const userData = response.data.user ? response.data.user : response.data;
      // 3. Pasamos los 2 argumentos exactos que ahora pide tu AuthContext
      login(token, userData);
      
      // 4. Redireccionamos automáticamente a la pantalla correcta según el rol
      if (userData.role === 'teacher') {
        navigate('/dashboard');
      } else {
        navigate('/mis-clases');
      }

    } catch (error) {
      console.error('Error al iniciar sesion', error);
      alert('Error al iniciar sesión. Verifica tu email y contraseña.');
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePassChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 w-80">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">Ingreso a la Plataforma</h2>
        
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={handleEmailChange} 
          className="w-full p-3 mb-4 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
          required
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={handlePassChange}
          className="w-full p-3 mb-6 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-violet-500"
          required
        />
        
        <button type="submit" className="w-full bg-violet-600 text-white font-bold p-3 rounded-xl hover:bg-violet-700 transition shadow-md">
          Entrar
        </button>
      </form>
    </div>
  );
};