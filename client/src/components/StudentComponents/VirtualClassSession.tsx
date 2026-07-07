import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios'; // Asegúrate de importar tu API
import { FiArrowLeft, FiEdit3, FiBookOpen, FiCheckSquare, FiList } from 'react-icons/fi';

export const VirtualClassSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  const location = useLocation();
  const activeTopic = location.state?.topic || 'Clase General';

  const [notes, setNotes] = useState('');
  const [newVocab, setNewVocab] = useState('');
  const [vocabList, setVocabList] = useState<string[]>([]);

  // ==========================================
  // ESCUDO Y AUTO-EXPULSOR PARA ALUMNOS
  // ==========================================
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkRoomStatus = async () => {
      try {
        const { data } = await api.get('/classrooms');
        const currentRoom = data.find((r: any) => r._id === id);

        // Si el usuario es un alumno...
        if (user?.role === 'student') {
          // Y la sala NO está en vivo (isLive: false)
          if (!currentRoom || !currentRoom.isLive) {
            alert("La clase ha finalizado o aún no ha comenzado.");
            navigate(`/sala/${id}`, { replace: true }); // Lo pateamos fuera y borramos el historial
          }
        }
      } catch (error) {
        console.error("Error verificando el estado de la sala:", error);
      }
    };

    // 1. Verificamos apenas carga la pantalla (por si escribió la URL a mano)
    if (user && !loading) {
      checkRoomStatus();
    }

    // 2. Si es alumno, dejamos un guardia revisando cada 10 segundos
    if (user?.role === 'student') {
      interval = setInterval(checkRoomStatus, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, user, loading, navigate]);
  // ==========================================

  const handleAddVocab = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newVocab.trim() !== '') {
      setVocabList([...vocabList, newVocab.trim()]);
      setNewVocab('');
    }
  };

  const handleFinishClass = async () => {
    try {
      // Guardamos los apuntes
      await api.post(`/classrooms/${id}/notes`, { 
        text: notes, 
        vocab: vocabList,
        topic: activeTopic 
      });

      // 💡 APAGAMOS LA SALA EN LA BASE DE DATOS
      await api.patch(`/classrooms/${id}/live`, { isLive: false });

      alert('Clase finalizada. El registro se ha guardado exitosamente.');
      navigate(`/sala/${id}`); 
    } catch (error) {
      alert("Hubo un error al cerrar la sala o guardar apuntes.");
    }
  };

  if (loading) {
    return <div className="h-screen bg-slate-900 text-white flex items-center justify-center">Cargando entorno...</div>;
  }

  // Si es alumno y entra rápido antes de que el useEffect lo patee, no renderizamos el Jitsi
  if (user?.role === 'student' && !loading && !user) {
    return null; 
  }

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden font-sans">
      
      {/* 🔴 LADO IZQUIERDO: EL VIDEO DE JITSI */}
      <div className="flex-1 flex flex-col relative h-full">
        {user?.role === 'student' && (
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-50 bg-slate-900/50 hover:bg-slate-800 text-white p-3 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 border border-slate-700/50"
          >
            <FiArrowLeft /> <span className="text-sm font-bold">Salir de la Llamada</span>
          </button>
        )}

        <div className="w-full h-full">
          <JitsiMeeting
            domain="meet.jit.si"
            roomName={`EnglishClassRoom-${id}`} 
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableModeratorIndicator: true,
              prejoinPageEnabled: false,
            }}
            userInfo={{ 
              displayName: user?.name || 'Usuario',
              email: user?.email || 'correo@ejemplo.com'
            }}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
            }}
          />
        </div>
      </div>

      {/* 🔵 LADO DERECHO: PANEL EN VIVO (SOLO PARA LA PROFESORA) */}
      {user?.role === 'teacher' && (
        <div className="w-80 lg:w-96 bg-white h-full flex flex-col shadow-2xl z-10 border-l border-slate-200">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">Clase en Vivo</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Registra el progreso</p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100">
              <h3 className="text-xs font-bold text-violet-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiBookOpen /> Tema a enseñar
              </h3>
              <p className="font-bold text-slate-700 text-sm">{activeTopic}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FiEdit3 className="text-slate-400" /> Notas de la sesión
              </h3>
              <textarea 
                value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Pedrito tuvo dudas con el verbo To Be..."
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50 h-32 resize-none text-sm"
              />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FiList className="text-slate-400" /> Vocabulario Nuevo
              </h3>
              <input 
                type="text" value={newVocab} onChange={(e) => setNewVocab(e.target.value)} onKeyDown={handleAddVocab}
                placeholder="Escribe y presiona Enter..."
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-sm mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {vocabList.map((word, index) => (
                  <span key={index} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-sm font-medium border border-emerald-200">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <button 
              onClick={handleFinishClass}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <FiCheckSquare /> Finalizar Clase y Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};