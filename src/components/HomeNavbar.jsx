import React, { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyDQfBbrw_0uDRN24HbJ2SfxFwUUMoAhAYA",
  authDomain: "jojo-webtools.firebaseapp.com",
  projectId: "jojo-webtools",
  storageBucket: "jojo-webtools.firebasestorage.app",
  messagingSenderId: "627186261950",
  appId: "1:627186261950:web:b5903904b845ea40a9e3ef"
};

export default function HomeNavbar() {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (window.firebase && !window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }
    if (window.firebase) {
      const auth = window.firebase.auth();
      const db = window.firebase.firestore();
      const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          let av = currentUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(currentUser.uid)}`;
          setAvatar(av);
          try {
            const doc = await db.collection('users').doc(currentUser.uid).get();
            if (doc.exists && doc.data().avatarUrl) setAvatar(doc.data().avatarUrl);
          } catch (e) { console.error(e); }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  return (
    <header style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '24px 0 0 0',
      flexShrink: 0,
      position: 'relative',
      zIndex: 100,
    }}>
      <nav style={{
        width: '90%',
        maxWidth: '1152px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderRadius: '9999px',
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <a
          href="/"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900,
            letterSpacing: '-1px',
            fontSize: '1.25rem',
            color: '#ffffff',
            textDecoration: 'none',
            textShadow: '0 0 12px rgba(255,255,255,0.35)',
          }}
        >
          JoJoTools
        </a>

        {/* Right side: GitHub + Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a
            href="https://github.com/IllanSpala"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#fff', fontSize: '1.2rem', transition: 'transform 0.2s', display: 'inline-flex' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <i className="fab fa-github"></i>
          </a>

          {user ? (
            <a href="/ferramentas/profile.html" style={{ display: 'block', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src={avatar} alt="Perfil" style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.2)', objectFit: 'cover',
              }} />
            </a>
          ) : (
            <a
              href="/ferramentas/login.html"
              style={{
                padding: '8px 20px',
                background: '#E63B2E',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderRadius: '9999px',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ff4a3d'; e.currentTarget.style.boxShadow = '0 0 20px rgba(230,59,46,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E63B2E'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Acessar
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
