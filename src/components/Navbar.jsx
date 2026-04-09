import React, { useState, useEffect } from 'react';

// Chaves do seu Firebase já configurado (Igual ao seu firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyDQfBbrw_0uDRN24HbJ2SfxFwUUMoAhAYA",
  authDomain: "jojo-webtools.firebaseapp.com",
  projectId: "jojo-webtools",
  storageBucket: "jojo-webtools.firebasestorage.app",
  messagingSenderId: "627186261950",
  appId: "1:627186261950:web:b5903904b845ea40a9e3ef"
};

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    // Inicializa o Firebase no React se ainda não estiver pronto
    if (window.firebase && !window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }

    if (window.firebase) {
      const auth = window.firebase.auth();
      const db = window.firebase.firestore();

      const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          // Puxa a foto do Google ou avatar genérico temporário
          let currentAvatar = currentUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentUser.uid)}`;
          setAvatar(currentAvatar);

          // Procura no Firestore se existe uma foto customizada
          try {
            const doc = await db.collection('users').doc(currentUser.uid).get();
            if (doc.exists && doc.data().avatarUrl) {
              setAvatar(doc.data().avatarUrl);
            }
          } catch (e) {
            console.error("Erro ao carregar perfil:", e);
          }
        }
      });

      return () => unsubscribe();
    }
  }, []);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50">
      
      {/* Liquid Glass Container */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/20 backdrop-blur-2xl border border-white/10 border-t-white/20 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        
        {/* Logo */}
        <a href="/" className="text-white font-black tracking-tighter text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          jojoTools
        </a>

        {/* Links da Main Page */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-300 hover:text-white text-sm font-semibold uppercase tracking-widest transition-all hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            Operacional
          </a>
          <a href="#philosophy" className="text-gray-300 hover:text-white text-sm font-semibold uppercase tracking-widest transition-all hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            Intuito
          </a>
          <a href="#protocol" className="text-gray-300 hover:text-white text-sm font-semibold uppercase tracking-widest transition-all hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            Ferramentas
          </a>
        </div>

        {/* Lado Direito: GitHub + Auth Area */}
        <div className="flex items-center gap-6">
          
          {/* Link do GitHub */}
          <a href="https://github.com/IllanSpala" target="_blank" rel="noopener noreferrer" className="text-white text-xl transition-transform hover:scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            <i className="fab fa-github"></i>
          </a>

          {/* Autenticação */}
          <div>
            {user ? (
              <a href="/ferramentas/profile.html" className="block transition-transform hover:scale-110">
                <img 
                  src={avatar} 
                  alt="Perfil" 
                  className="w-10 h-10 rounded-full border-2 border-white/20 object-cover shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
                />
              </a>
            ) : (
              <a 
                href="/ferramentas/login.html" 
                className="px-5 py-2 bg-[#E63B2E] hover:bg-[#ff4a3d] text-white text-sm font-bold uppercase rounded-full transition-all shadow-lg hover:shadow-[#E63B2E]/50 border border-white/10"
              >
                Acessar
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}