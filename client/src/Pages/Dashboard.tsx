import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { RoomManager } from '../components/RoomManager';
import { Register } from '../components/RegisterStudent';
import { TeacherCalendar } from '../components/TeacherCalendar';
import { VideoCallPanel } from '../components/VideoCallPanel';
// Importamos FiMenu (hamburguesa) y FiX (cerrar)
import { FiUsers, FiCalendar, FiVideo, FiUserPlus, FiMenu, FiX } from 'react-icons/fi';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'salas' | 'calendario' | 'videollamadas' | 'registrar'>('salas');
  // Nuevo estado para controlar el menú en móviles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Función para cambiar de pestaña y cerrar el menú automáticamente en el celular
  const handleTabChange = (tab: 'salas' | 'calendario' | 'videollamadas' | 'registrar') => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* OVERLAY OSCURO PARA MÓVILES (Fondo semitransparente al abrir el menú) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MENÚ LATERAL (SIDEBAR) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">English Platform</h2>
            <p className="text-sm text-violet-400 mt-1">Panel de Profesores</p>
          </div>
          {/* Botón para cerrar el menú en móviles */}
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => handleTabChange('salas')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'salas' ? 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <FiUsers className="w-5 h-5 shrink-0" /> Mis Salas
          </button>
          
          <button 
            onClick={() => handleTabChange('calendario')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'calendario' ? 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <FiCalendar className="w-5 h-5 shrink-0" /> Calendario
          </button>

          <button 
            onClick={() => handleTabChange('videollamadas')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'videollamadas' ? 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <FiVideo className="w-5 h-5 shrink-0" /> Videollamadas
          </button>

          <button 
            onClick={() => handleTabChange('registrar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'registrar' ? 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-900/50' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <FiUserPlus className="w-5 h-5 shrink-0" /> Registrar Alumnos
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-white font-bold text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white py-2 rounded-lg transition-colors font-semibold">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        <header className="mb-6 md:mb-8 flex items-center gap-4">
          
          {/* BOTÓN DE MENÚ HAMBURGUESA (Solo visible en móviles) */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:text-violet-600 transition-colors"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 capitalize">
              {activeTab.replace('videollamadas', 'Videollamadas')}
            </h1>
            <p className="text-sm md:text-base text-slate-500 mt-1 hidden sm:block">
              Gestiona tus clases y alumnos eficientemente.
            </p>
          </div>
        </header>

        {/* Renderizado dinámico de componentes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
          {activeTab === 'salas' && <RoomManager />}
          {activeTab === 'calendario' && <TeacherCalendar />}
          {activeTab === 'videollamadas' && <VideoCallPanel />}
          {activeTab === 'registrar' && <Register />}
        </div>
      </main>

    </div>
  );
};