import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { Sala } from '../types';
import { useAuth } from '../context/AuthContext';

export const SalaDetail = () => {
  const { id } = useParams(); // Obtenemos ID de la URL
  const { user } = useAuth();
  const [sala, setSala] = useState<Sala | null>(null);
  
  // Estado para nueva tarea
  const [taskContent, setTaskContent] = useState('');
  const [taskType, setTaskType] = useState('quiz');

  const fetchSala = async () => {
    // NOTA: Como en el backend no hicimos un endpoint específico GET /salas/:id
    // vamos a pedir todas y filtrar (solución temporal rápida).
    // Lo ideal sería crear router.get('/:id', ...) en el backend.
    try {
      const { data } = await api.get('/salas');
      const found = data.find((s: Sala) => s._id === id);
      setSala(found);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchSala(); }, [id]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sala) return;
    try {
      await api.post(`/salas/${sala._id}/tareas`, {
        tipo: taskType,
        contenido: taskContent,
        correccion: 'Pendiente' // Simplificado para el ejemplo
      });
      setTaskContent('');
      fetchSala();
    } catch (error) {
      alert('Error agregando tarea');
    }
  };

  const handleToggleTask = async (tareaId: string) => {
    if (!sala) return;
    // UI Optimista: Cambiamos visualmente antes de esperar al servidor
    const newTareas = sala.tareas.map(t => 
       t._id === tareaId ? { ...t, completada: !t.completada } : t
    );
    setSala({ ...sala, tareas: newTareas });

    try {
      await api.patch(`/salas/${sala._id}/tareas/${tareaId}`);
    } catch (error) {
      console.error('Error al actualizar');
      fetchSala(); // Revertimos si falla
    }
  };

  if (!sala) return <div>Cargando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{sala.name}</h1>

      {/* LISTA DE TAREAS */}
      <div className="space-y-4 mb-8">
        {sala.tareas.length === 0 && <p className="text-gray-500">No hay tareas asignadas aún.</p>}
        
        {sala.tareas.map(tarea => (
          <div key={tarea._id} className={`p-4 border rounded flex justify-between items-center ${tarea.completada ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
            <div>
              <span className="text-xs uppercase font-bold text-gray-400 border px-1 rounded mr-2">{tarea.tipo}</span>
              <span className={tarea.completada ? 'line-through text-gray-500' : ''}>{tarea.contenido}</span>
            </div>
            
            <input 
              type="checkbox" 
              checked={tarea.completada} 
              onChange={() => handleToggleTask(tarea._id)}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* FORMULARIO AGREGAR TAREA (Solo Profes) */}
      {user?.role === 'teacher' && (
        <div className="bg-gray-50 p-6 rounded border">
          <h3 className="font-bold mb-4">Agregar Tarea</h3>
          <form onSubmit={handleAddTask} className="flex gap-2">
            <select value={taskType} onChange={e => setTaskType(e.target.value)} className="border p-2 rounded">
              <option value="quiz">Quiz</option>
              <option value="flashcard">Flashcard</option>
              <option value="texto">Texto</option>
            </select>
            <input 
              placeholder="Contenido de la tarea..." 
              value={taskContent} 
              onChange={e => setTaskContent(e.target.value)} 
              className="border p-2 rounded flex-1"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 rounded hover:bg-blue-700">Agregar</button>
          </form>
        </div>
      )}
    </div>
  );
};