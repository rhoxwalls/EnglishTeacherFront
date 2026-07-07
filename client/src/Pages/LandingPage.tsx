// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { 
//   CheckCircle2, 
//   MessageCircle, 
//   Star, 
//   ChevronDown, 
//   ChevronUp, 
//   BookOpen, 
//   Target, 
//   Coffee 
// } from 'lucide-react';

// export const LandingPage = () => {
//   const [openFaq, setOpenFaq] = useState<number | null>(null);

//   const faqs = [
//     {
//       question: "¿Qué pasa si tengo que cancelar una clase?",
//       answer: "Puedes cancelar o reprogramar sin costo hasta 24 horas antes de la sesión. Entiendo que los imprevistos ocurren."
//     },
//     {
//       question: "¿Por qué plataforma se dictan las clases?",
//       answer: "Usamos Google Meet o Zoom, según tu preferencia. Te enviaré un enlace recurrente para que sea súper fácil conectarte."
//     },
//     {
//       question: "¿Necesito comprar algún libro?",
//       answer: "No. Todo el material didáctico, ejercicios y recursos interactivos están incluidos y te los proveeré de forma digital."
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-violet-200">
      
//       {/* 1. HERO SECTION (Glassmorphism & Gradients) */}
//       <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
//         {/* Fondos abstractos desenfocados */}
//         <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
//           <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-violet-300/30 blur-3xl" />
//           <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-300/30 blur-3xl" />
//         </div>

//         <div className="max-w-6xl mx-auto px-6 relative">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
            
//             {/* Texto Hero */}
//             <div>
//               <span className="inline-block py-1 px-3 rounded-full bg-violet-100 text-violet-700 font-semibold text-sm mb-6 border border-violet-200">
//                 Aprende a tu propio ritmo ✨
//               </span>
//               <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
//                 Domina el inglés sin <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">miedo a hablar.</span>
//               </h1>
//               <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
//                 Clases personalizadas, dinámicas y enfocadas en la comunicación real. Diseñadas específicamente para profesionales que necesitan resultados tangibles.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <a href="#precios" className="bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 transition-all text-center">
//                   Reserva tu clase de prueba
//                 </a>
//                 <Link to="/login" className="bg-white text-slate-700 font-bold py-4 px-8 rounded-full border border-slate-200 hover:bg-slate-50 transition-all text-center">
//                   Acceso Alumnos
//                 </Link>
//               </div>
//             </div>

//             {/* Tarjeta Glassmorphism */}
//             <div className="relative mx-auto w-full max-w-md">
//               <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
//                 {/* Reemplaza el src con la foto de la profesora */}
//                 <img 
//                   src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
//                   alt="Profesora de Inglés" 
//                   className="object-cover w-full h-full"
//                 />
                
//                 {/* Elemento de Cristal flotante */}
//                 <div className="absolute bottom-6 left-6 right-6 bg-white/70 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-xl">
//                   <div className="flex items-center gap-3">
//                     <div className="bg-green-100 p-2 rounded-full">
//                       <Star className="w-5 h-5 text-green-600 fill-current" />
//                     </div>
//                     <div>
//                       <p className="font-bold text-slate-800 text-sm">Más de 500+ alumnos</p>
//                       <p className="text-xs text-slate-600">Hablando con fluidez</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 2. BARRA DE CONFIANZA */}
//       <section className="bg-white border-y border-slate-200 py-10">
//         <div className="max-w-6xl mx-auto px-6 text-center">
//           <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">
//             Certificaciones y alumnos trabajando en
//           </p>
//           <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60 grayscale">
//             {/* Aquí van logos. Usamos texto como placeholder */}
//             <span className="font-bold text-xl">CAMBRIDGE</span>
//             <span className="font-bold text-xl">TOEFL</span>
//             <span className="font-bold text-xl">Google</span>
//             <span className="font-bold text-xl">Microsoft</span>
//           </div>
//         </div>
//       </section>

//       {/* 4. METODOLOGÍA (Tarjetas interactivas) */}
//       <section className="py-24 bg-slate-50">
//         <div className="max-w-6xl mx-auto px-6">
//           <div className="text-center max-w-2xl mx-auto mb-16">
//             <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
//             <p className="text-slate-600">Un proceso simple diseñado para reducir tu ansiedad y enfocarnos en lo que importa: aprender.</p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {/* Card 1 */}
//             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
//               <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-6">
//                 <Target className="w-7 h-7" />
//               </div>
//               <h3 className="text-xl font-bold mb-3">1. Evaluación Diagnóstica</h3>
//               <p className="text-slate-600">Nos reunimos 30 minutos para conocer tu nivel actual, tus objetivos y tus bloqueos al hablar.</p>
//             </div>

//             {/* Card 2 */}
//             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
//               <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
//                 <BookOpen className="w-7 h-7" />
//               </div>
//               <h3 className="text-xl font-bold mb-3">2. Plan a Medida</h3>
//               <p className="text-slate-600">Diseño un programa específico para ti. Nada de libros genéricos; material relevante para tu vida y trabajo.</p>
//             </div>

//             {/* Card 3 */}
//             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
//               <div className="w-14 h-14 bg-fuchsia-100 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-6">
//                 <Coffee className="w-7 h-7" />
//               </div>
//               <h3 className="text-xl font-bold mb-3">3. ¡A hablar!</h3>
//               <p className="text-slate-600">Clases 100% prácticas donde tú eres el protagonista. Pierde el miedo equivocándote en un entorno seguro.</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 5. PLANES Y PRECIOS */}
//       <section id="precios" className="py-24 bg-white">
//         <div className="max-w-6xl mx-auto px-6">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl font-bold mb-4">Planes diseñados para tu progreso</h2>
//             <p className="text-slate-600">Elige la intensidad que mejor se adapte a tu rutina.</p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
//             {/* Plan Básico */}
//             <div className="p-8 rounded-3xl border border-slate-200 bg-slate-50">
//               <h3 className="text-xl font-bold mb-2">Casual</h3>
//               <p className="text-slate-500 text-sm mb-6">Para mantener el idioma activo</p>
//               <div className="mb-6">
//                 <span className="text-4xl font-extrabold">$40</span><span className="text-slate-500">/mes</span>
//               </div>
//               <ul className="space-y-4 mb-8">
//                 <li className="flex items-center gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-violet-500" /> 1 clase a la semana</li>
//                 <li className="flex items-center gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-violet-500" /> Material incluido</li>
//                 <li className="flex items-center gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-violet-500" /> Acceso al aula virtual</li>
//               </ul>
//               <button className="w-full py-3 rounded-full font-bold border-2 border-violet-600 text-violet-600 hover:bg-violet-50 transition-colors">Elegir Plan</button>
//             </div>

//             {/* Plan Popular (Destacado) */}
//             <div className="p-8 rounded-3xl bg-gradient-to-b from-violet-600 to-blue-700 text-white shadow-2xl relative transform md:-translate-y-4">
//               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
//                 Más Elegido
//               </div>
//               <h3 className="text-xl font-bold mb-2">Intensivo</h3>
//               <p className="text-violet-200 text-sm mb-6">Resultados rápidos y notorios</p>
//               <div className="mb-6">
//                 <span className="text-4xl font-extrabold">$75</span><span className="text-violet-200">/mes</span>
//               </div>
//               <ul className="space-y-4 mb-8">
//                 <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-violet-300" /> 2 clases a la semana</li>
//                 <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-violet-300" /> Corrección de CV y LinkedIn</li>
//                 <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-violet-300" /> Soporte por WhatsApp</li>
//                 <li className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-violet-300" /> Acceso al aula virtual</li>
//               </ul>
//               <button className="w-full py-3 rounded-full font-bold bg-white text-violet-700 hover:bg-slate-100 transition-colors shadow-lg">Comenzar Ahora</button>
//             </div>

//             {/* Plan Pro */}
//             <div className="p-8 rounded-3xl border border-slate-200 bg-slate-50">
//               <h3 className="text-xl font-bold mb-2">Entrevista</h3>
//               <p className="text-slate-500 text-sm mb-6">Prepárate para conseguir ese trabajo</p>
//               <div className="mb-6">
//                 <span className="text-4xl font-extrabold">$120</span><span className="text-slate-500">/pago único</span>
//               </div>
//               <ul className="space-y-4 mb-8">
//                 <li className="flex items-center gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-violet-500" /> 4 sesiones simulacro</li>
//                 <li className="flex items-center gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-violet-500" /> Vocabulario IT/Negocios</li>
//                 <li className="flex items-center gap-3 text-slate-600"><CheckCircle2 className="w-5 h-5 text-violet-500" /> Feedback detallado</li>
//               </ul>
//               <button className="w-full py-3 rounded-full font-bold border-2 border-violet-600 text-violet-600 hover:bg-violet-50 transition-colors">Elegir Plan</button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* 7. FAQ (Acordeón interactivo) */}
//       <section className="py-24 bg-slate-50">
//         <div className="max-w-3xl mx-auto px-6">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold mb-4">Preguntas Frecuentes</h2>
//           </div>
//           <div className="space-y-4">
//             {faqs.map((faq, index) => (
//               <div 
//                 key={index} 
//                 className="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-violet-300 transition-colors"
//                 onClick={() => setOpenFaq(openFaq === index ? null : index)}
//               >
//                 <div className="p-6 flex justify-between items-center">
//                   <h4 className="font-bold text-slate-800">{faq.question}</h4>
//                   {openFaq === index ? <ChevronUp className="text-violet-600" /> : <ChevronDown className="text-slate-400" />}
//                 </div>
//                 {openFaq === index && (
//                   <div className="px-6 pb-6 text-slate-600">
//                     {faq.answer}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* 8. FOOTER */}
//       <footer className="bg-slate-900 text-slate-400 py-12">
//         <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
//           <div>
//             <span className="text-white font-bold text-xl flex items-center gap-2 mb-4">
//               <MessageCircle className="w-6 h-6 text-violet-400" /> English Platform
//             </span>
//             <p className="text-sm">Ayudando a profesionales a romper la barrera del idioma y alcanzar sus metas globales.</p>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Enlaces Rápidos</h4>
//             <ul className="space-y-2 text-sm">
//               <li><a href="#" className="hover:text-white transition-colors">Inicio</a></li>
//               <li><a href="#precios" className="hover:text-white transition-colors">Planes</a></li>
//               <li><Link to="/login" className="hover:text-white transition-colors">Portal de Alumnos</Link></li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-white font-bold mb-4">Contacto</h4>
//             <p className="text-sm">hola@englishplatform.com</p>
//             <p className="text-sm mt-2">📍 Formato 100% Online</p>
//           </div>
//         </div>
//         <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
//           © {new Date().getFullYear()} English Platform. Todos los derechos reservados.
//         </div>
//       </footer>

//       {/* FLOATING ACTION BUTTON (Chatbot / WhatsApp Automation Placeholder) */}
//       <a 
//         href="#" 
//         className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all z-50 flex items-center justify-center group"
//         aria-label="Contactar por WhatsApp"
//       >
//         <MessageCircle className="w-6 h-6" />
//         <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 ease-in-out font-bold">
//           Escríbeme
//         </span>
//       </a>

//     </div>
//   );
// };

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiMessageCircle, 
  FiStar, 
  FiChevronDown, 
  FiChevronUp, 
  FiBookOpen, 
  FiTarget, 
  FiCoffee 
} from 'react-icons/fi';

export const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Qué pasa si tengo que cancelar una clase?",
      answer: "Puedes cancelar o reprogramar sin costo hasta 24 horas antes de la sesión. Entiendo que los imprevistos ocurren."
    },
    {
      question: "¿Por qué plataforma se dictan las clases?",
      answer: "Usamos Google Meet o Zoom, según tu preferencia. Te enviaré un enlace recurrente para que sea súper fácil conectarte."
    },
    {
      question: "¿Necesito comprar algún libro?",
      answer: "No. Todo el material didáctico, ejercicios y recursos interactivos están incluidos y te los proveeré de forma digital."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-violet-200">
      
      {/* 1. HERO SECTION (Glassmorphism & Gradients) */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
        {/* Fondos abstractos desenfocados */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-violet-300/30 blur-3xl" />
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-300/30 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Texto Hero */}
            <div>
              <span className="inline-block py-1 px-3 rounded-full bg-violet-100 text-violet-700 font-semibold text-sm mb-6 border border-violet-200">
                Aprende a tu propio ritmo ✨
              </span>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 leading-tight">
                Domina el inglés sin <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">miedo a hablar.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Clases personalizadas, dinámicas y enfocadas en la comunicación real. Diseñadas específicamente para profesionales que necesitan resultados tangibles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#precios" className="bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 transition-all text-center">
                  Reserva tu clase de prueba
                </a>
                <Link to="/login" className="bg-white text-slate-700 font-bold py-4 px-8 rounded-full border border-slate-200 hover:bg-slate-50 transition-all text-center">
                  Acceso Alumnos
                </Link>
              </div>
            </div>

            {/* Tarjeta Glassmorphism */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Profesora de Inglés" 
                  className="object-cover w-full h-full"
                />
                
                {/* Elemento de Cristal flotante */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/70 backdrop-blur-md border border-white/50 p-4 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FiStar className="w-5 h-5 text-green-600 fill-current" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Más de 500+ alumnos</p>
                      <p className="text-xs text-slate-600">Hablando con fluidez</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE CONFIANZA */}
      <section className="bg-white border-y border-slate-200 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Certificaciones y alumnos trabajando en
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-60 grayscale">
            <span className="font-bold text-xl">CAMBRIDGE</span>
            <span className="font-bold text-xl">TOEFL</span>
            <span className="font-bold text-xl">Google</span>
            <span className="font-bold text-xl">Microsoft</span>
          </div>
        </div>
      </section>

      {/* 4. METODOLOGÍA (Tarjetas interactivas) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-slate-600">Un proceso simple diseñado para reducir tu ansiedad y enfocarnos en lo que importa: aprender.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-6">
                <FiTarget className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Evaluación Diagnóstica</h3>
              <p className="text-slate-600">Nos reunimos 30 minutos para conocer tu nivel actual, tus objetivos y tus bloqueos al hablar.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <FiBookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Plan a Medida</h3>
              <p className="text-slate-600">Diseño un programa específico para ti. Nada de libros genéricos; material relevante para tu vida y trabajo.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-fuchsia-100 text-fuchsia-600 rounded-2xl flex items-center justify-center mb-6">
                <FiCoffee className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. ¡A hablar!</h3>
              <p className="text-slate-600">Clases 100% prácticas donde tú eres el protagonista. Pierde el miedo equivocándote en un entorno seguro.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PLANES Y PRECIOS */}
      <section id="precios" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Planes diseñados para tu progreso</h2>
            <p className="text-slate-600">Elige la intensidad que mejor se adapte a tu rutina.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            {/* Plan Básico */}
            <div className="p-8 rounded-3xl border border-slate-200 bg-slate-50">
              <h3 className="text-xl font-bold mb-2">Casual</h3>
              <p className="text-slate-500 text-sm mb-6">Para mantener el idioma activo</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">$40</span><span className="text-slate-500">/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600"><FiCheckCircle className="w-5 h-5 text-violet-500" /> 1 clase a la semana</li>
                <li className="flex items-center gap-3 text-slate-600"><FiCheckCircle className="w-5 h-5 text-violet-500" /> Material incluido</li>
                <li className="flex items-center gap-3 text-slate-600"><FiCheckCircle className="w-5 h-5 text-violet-500" /> Acceso al aula virtual</li>
              </ul>
              <button className="w-full py-3 rounded-full font-bold border-2 border-violet-600 text-violet-600 hover:bg-violet-50 transition-colors">Elegir Plan</button>
            </div>

            {/* Plan Popular (Destacado) */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-violet-600 to-blue-700 text-white shadow-2xl relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                Más Elegido
              </div>
              <h3 className="text-xl font-bold mb-2">Intensivo</h3>
              <p className="text-violet-200 text-sm mb-6">Resultados rápidos y notorios</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">$75</span><span className="text-violet-200">/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-white"><FiCheckCircle className="w-5 h-5 text-violet-300" /> 2 clases a la semana</li>
                <li className="flex items-center gap-3 text-white"><FiCheckCircle className="w-5 h-5 text-violet-300" /> Corrección de CV y LinkedIn</li>
                <li className="flex items-center gap-3 text-white"><FiCheckCircle className="w-5 h-5 text-violet-300" /> Soporte por WhatsApp</li>
                <li className="flex items-center gap-3 text-white"><FiCheckCircle className="w-5 h-5 text-violet-300" /> Acceso al aula virtual</li>
              </ul>
              <button className="w-full py-3 rounded-full font-bold bg-white text-violet-700 hover:bg-slate-100 transition-colors shadow-lg">Comenzar Ahora</button>
            </div>

            {/* Plan Pro */}
            <div className="p-8 rounded-3xl border border-slate-200 bg-slate-50">
              <h3 className="text-xl font-bold mb-2">Entrevista</h3>
              <p className="text-slate-500 text-sm mb-6">Prepárate para conseguir ese trabajo</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">$120</span><span className="text-slate-500">/pago único</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-600"><FiCheckCircle className="w-5 h-5 text-violet-500" /> 4 sesiones simulacro</li>
                <li className="flex items-center gap-3 text-slate-600"><FiCheckCircle className="w-5 h-5 text-violet-500" /> Vocabulario IT/Negocios</li>
                <li className="flex items-center gap-3 text-slate-600"><FiCheckCircle className="w-5 h-5 text-violet-500" /> Feedback detallado</li>
              </ul>
              <button className="w-full py-3 rounded-full font-bold border-2 border-violet-600 text-violet-600 hover:bg-violet-50 transition-colors">Elegir Plan</button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ (Acordeón interactivo) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Preguntas Frecuentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-violet-300 transition-colors"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="p-6 flex justify-between items-center">
                  <h4 className="font-bold text-slate-800">{faq.question}</h4>
                  {openFaq === index ? <FiChevronUp className="text-violet-600" /> : <FiChevronDown className="text-slate-400" />}
                </div>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <span className="text-white font-bold text-xl flex items-center gap-2 mb-4">
              <FiMessageCircle className="w-6 h-6 text-violet-400" /> English Platform
            </span>
            <p className="text-sm">Ayudando a profesionales a romper la barrera del idioma y alcanzar sus metas globales.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Inicio</a></li>
              <li><a href="#precios" className="hover:text-white transition-colors">Planes</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Portal de Alumnos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contacto</h4>
            <p className="text-sm">hola@englishplatform.com</p>
            <p className="text-sm mt-2">📍 Formato 100% Online</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
          © {new Date().getFullYear()} English Platform. Todos los derechos reservados.
        </div>
      </footer>

      {/* FLOATING ACTION BUTTON */}
      <a 
        href="#" 
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-all z-50 flex items-center justify-center group"
        aria-label="Contactar por WhatsApp"
      >
        <FiMessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 ease-in-out font-bold">
          Escríbeme
        </span>
      </a>

    </div>
  );
};