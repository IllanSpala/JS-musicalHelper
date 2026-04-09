// --- SHARED THEME DATA ---
const themes = [
    { bgStart: '#af8c62', bgEnd: '#6f4f43', glassBg: 'rgba(37, 34, 38, 0.5)', btnBg: 'rgba(79, 64, 70, 0.9)', accentA: '#596361', accentB: '#d6b89c' },
    { bgStart: '#c0bab3', bgEnd: '#52423d', glassBg: 'rgba(22, 15, 12, 0.6)', btnBg: 'rgba(57, 18, 20, 0.8)', accentA: '#e0e0e0', accentB: '#160f0c' },
    { bgStart: '#1c2c3b', bgEnd: '#192a34', glassBg: 'rgba(255, 255, 255, 0.05)', btnBg: 'rgba(68, 93, 99, 0.8)', accentA: '#718d99', accentB: '#b3c6d0' },
    { bgStart: '#959bb5', bgEnd: '#3a3e6c', glassBg: 'rgba(10, 17, 35, 0.6)', btnBg: 'rgba(58, 62, 108, 0.8)', accentA: '#8387c3', accentB: '#ffffff' }
];

function changeTheme(index) {
    const t = themes[index];
    const root = document.documentElement;
    root.style.setProperty('--bg-start', t.bgStart);
    root.style.setProperty('--bg-end', t.bgEnd);
    root.style.setProperty('--glass-bg', t.glassBg);
    root.style.setProperty('--btn-bg', t.btnBg);
    root.style.setProperty('--accent-a', t.accentA);
    root.style.setProperty('--accent-b', t.accentB);
    
    localStorage.setItem('appTheme', index);

    if (typeof applyThemeToBody === "function") applyThemeToBody(index);
    if (typeof drawShapes === "function") drawShapes();
}

const savedTheme = localStorage.getItem('appTheme');
const initialTheme = savedTheme !== null ? parseInt(savedTheme) : 0;
changeTheme(initialTheme);

// --- TRANSLATION SYSTEM (i18n) ---
const translations = {
    pt: {
        /* General / Footer */
        "footer_text": "© 2026 jojozelan Tools",
        "back_menu": "Voltar ao menu",
        "select_tool": "Selecione uma Ferramenta",

        /* Main Menu Cards */
        "metro_title": "Metrônomo",
        "metro_desc": "Gerador polirrítmico visual com batidas personalizáveis.",
        "scale_title": "Máquina de Escalas",
        "scale_desc": "Gerador e visualizador de escalas aleatórias.",
        "tab_title": "Tab Player",
        "tab_desc": "Leitor de tablatura com loop, metrônomo e transposição.",
        "open_tool": "ABRIR FERRAMENTA",

        /* Poly Metronome */
        "poly_title": "Metrônomo Polirrítmico",
        "main_beat": "Batida Princ.",
        "sub_beat": "Sub Batida",
        "btn_start": "INICIAR",
        "btn_stop": "PARAR",

        /* Scale Machine */
        "lbl_instrument": "Instrumento",
        "lbl_root": "Tônica",
        "lbl_scale": "Escala",
        "lbl_tuning": "Afinação",
        "lbl_frets": "Trastes",
        "legend_title": "Notas da escala — clique para detalhes e som",
        "custom_tuning_title": "Afinação personalizada",
        "btn_about": "Sobre a Escala",
        "btn_tasks": "Exercícios",
        "tasks_title": "Mini Tasks para Praticar",
        "btn_close": "✕ Fechar",
        "str_7": "7ª corda",
        "str_5": "5ª corda",

        /* Login */
        "login_title": "Entrar",
        "login_sub": "Salve suas tabs, perfil e progresso na nuvem.",
        "login_google": "Continuar com Google",
        "login_or": "ou",
        "login_email_lbl": "E-mail",
        "login_pass_lbl": "Senha",
        "login_email_ph": "seu@email.com",
        "login_pass_ph": "••••••••",
        "login_btn_enter": "Entrar",
        "login_btn_register": "Criar conta",
        "login_no_account": "Não tem conta?",
        "login_has_account": "Já tem conta?",
        "login_err_fill": "Preencha e-mail e senha.",
        "login_err_notfound": "Usuário não encontrado.",
        "login_err_wrongpass": "Senha incorreta.",
        "login_err_inuse": "Este e-mail já está em uso.",
        "login_err_invalidemail": "E-mail inválido.",
        "login_err_weakpass": "Senha muito fraca (mín. 6 caracteres).",
        "login_err_popup": "Login cancelado.",
        "login_err_generic": "Ocorreu um erro. Tente novamente.",

        /* Profile */
        "prof_title": "Meu Perfil",
        "prof_loading": "Carregando perfil…",
        "prof_avatar_hint": "Clique na foto para alterar",
        "prof_edit_title": "Editar Informações",
        "prof_username": "Nome de usuário",
        "prof_bio": "Bio",
        "prof_btn_save": " Salvar",
        "prof_btn_logout": " Sair da conta",
        "prof_panel_title": "Painel de Aprendizado",
        "prof_loading_tabs": " Carregando…",
        "prof_del_confirm": "Apagar esta tab do perfil e do armazenamento?",
        "prof_empty": "Nenhuma tab salva ainda.",
        "prof_err_load": "Erro ao carregar tabs.",
        "prof_tabs_saved": "tabs salvas",
        "prof_open_player": "Continuar no player",
        "prof_delete": "Apagar",
        "prof_bars": "compassos",
        "prof_last_access": "Último acesso:",
        "prof_bio_ph": "Fale um pouco sobre você…",
        "prof_username_ph": "seu_nome_aqui",
        "prof_learned_all": "Concluído ✓",
        "prof_learned_partial": "Em andamento",
        "prof_learned_none": "Não iniciado",
        "prof_learned_caption": "compassos aprendidos",
        "prof_save_ok": "✓ Salvo!",
        "prof_save_err": "✕ Erro ao salvar.",
        "prof_saving": "Salvando…",
        "prof_delete_spinner": "Apagando…",
        "prof_recent_tabs": "Tabs Recentes",
        "prof_load_recent": "Carregando…",
        "prof_no_recent": "Nenhuma tab recente salva ainda.",
        "prof_load_err": "Erro ao carregar tabs recentes.",
        "prof_size_kb": "KB",

        /* Tab Player */
        "tp_upload_sub": "Arraste ou clique para abrir um arquivo Guitar Pro",
        "tp_upload_btn": "Escolher arquivo",
        "tp_lbl_countin": "CONTAGEM",
        "tp_lbl_speed": "ANDAMENTO",
        "tp_lbl_loop": "LOOP & ESTUDO",
        "tp_lbl_metro": "METRÔNOMO",
        "tp_lbl_mode": "MODO",
        "tp_lbl_audio": "ÁUDIO",
        "tp_lbl_tracks": "TRACKS",
        "tp_sel_track": "SELECIONAR TRACK",
        "tp_btn_play": "Play / Pausa",
        "tp_btn_stop": "Stop",
        "tp_btn_cin": "Contar antes de tocar",
        "tp_btn_loop": "Loop on/off",
        "tp_btn_loopsel": "Definir região de loop",
        "tp_btn_loopclr": "Limpar loop",
        "tp_btn_mark": "Marcar como aprendido",
        "tp_btn_metro": "Metrônomo on/off",
        "tp_btn_open": "Abrir novo arquivo",
        "tp_loading": "Carregando soundfont e renderizando…",
        "tp_rendering": "Renderizando…",
        "tp_hint_start": "Clique no compasso INICIAL do loop",
        "tp_hint_end": "Início: c.{n} — clique no compasso FINAL",
        "tp_tracks_sel": "{n} Tracks Selecionadas",
        "tp_err_load": "AlphaTab não carregou. Verifique sua conexão e recarregue a página.",
        "tp_saving_cloud": "Salvando na nuvem e carregando…",
        "tp_loading_cloud": "Carregando da nuvem…",
        "tp_learned_caption": "compassos aprendidos",

        /* YouTube Sync */
        "yt_lbl_source": "ÁUDIO",
        "yt_btn_alphatab": "AlphaTab",
        "yt_btn_youtube": "YouTube",
        "yt_url_ph": "Cole a URL do YouTube aqui…",
        "yt_btn_load": "Carregar",
        "yt_offset_lbl": "Offset (ms)",
        "yt_community_load": "Carregar sync da comunidade",
        "yt_community_save": "Salvar meu offset",
        "yt_community_no_sync": "Nenhum sync disponível ainda.",
        "yt_community_saved": "✓ Offset salvo!",
        "yt_hint": "Ajuste o offset para sincronizar o vídeo com a partitura.",
        "yt_no_tab": "Carregue uma tab primeiro."
    },
    en: {
        /* General / Footer */
        "footer_text": "© 2026 jojozelan Tools",
        "back_menu": "Back to Main Menu",
        "select_tool": "Select a Tool",

        /* Main Menu Cards */
        "metro_title": "Metronome",
        "metro_desc": "Visual polyrhythmic generator with customizable beats.",
        "scale_title": "Scale Machine",
        "scale_desc": "Random scale generator and visualizer.",
        "tab_title": "Tab Player",
        "tab_desc": "Tab reader with loop, metronome & transposition.",
        "open_tool": "OPEN TOOL",

        /* Poly Metronome */
        "poly_title": "Polyrhythm Metronome",
        "main_beat": "MainBeat",
        "sub_beat": "SubBeat",
        "btn_start": "START",
        "btn_stop": "STOP",

        /* Scale Machine */
        "lbl_instrument": "Instrument",
        "lbl_root": "Root",
        "lbl_scale": "Scale",
        "lbl_tuning": "Tuning",
        "lbl_frets": "Frets",
        "legend_title": "Scale notes — click for details and sound",
        "custom_tuning_title": "Custom tuning",
        "btn_about": "About Scale",
        "btn_tasks": "Exercises",
        "tasks_title": "Mini Tasks to Practice",
        "btn_close": "✕ Close",
        "str_7": "7th string",
        "str_5": "5th string",

        /* Login */
        "login_title": "Sign In",
        "login_sub": "Save your tabs, profile and progress in the cloud.",
        "login_google": "Continue with Google",
        "login_or": "or",
        "login_email_lbl": "E-mail",
        "login_pass_lbl": "Password",
        "login_email_ph": "your@email.com",
        "login_pass_ph": "••••••••",
        "login_btn_enter": "Sign In",
        "login_btn_register": "Create account",
        "login_no_account": "No account?",
        "login_has_account": "Already have an account?",
        "login_err_fill": "Please fill in email and password.",
        "login_err_notfound": "User not found.",
        "login_err_wrongpass": "Incorrect password.",
        "login_err_inuse": "This email is already in use.",
        "login_err_invalidemail": "Invalid email address.",
        "login_err_weakpass": "Password too weak (min. 6 characters).",
        "login_err_popup": "Login cancelled.",
        "login_err_generic": "An error occurred. Please try again.",

        /* Profile */
        "prof_title": "My Profile",
        "prof_loading": "Loading profile…",
        "prof_avatar_hint": "Click photo to change",
        "prof_edit_title": "Edit Information",
        "prof_username": "Username",
        "prof_bio": "Bio",
        "prof_btn_save": " Save",
        "prof_btn_logout": " Logout",
        "prof_panel_title": "Learning Dashboard",
        "prof_loading_tabs": " Loading…",
        "prof_del_confirm": "Delete this tab from profile and storage?",
        "prof_empty": "No saved tabs yet.",
        "prof_err_load": "Error loading tabs.",
        "prof_tabs_saved": "saved tabs",
        "prof_open_player": "Continue in player",
        "prof_delete": "Delete",
        "prof_bars": "bars",
        "prof_last_access": "Last access:",
        "prof_bio_ph": "Tell us a bit about yourself…",
        "prof_username_ph": "your_name_here",
        "prof_learned_all": "Completed ✓",
        "prof_learned_partial": "In progress",
        "prof_learned_none": "Not started",
        "prof_learned_caption": "bars learned",
        "prof_save_ok": "✓ Saved!",
        "prof_save_err": "✕ Error saving.",
        "prof_saving": "Saving…",
        "prof_delete_spinner": "Deleting…",
        "prof_recent_tabs": "Recent Tabs",
        "prof_load_recent": "Loading…",
        "prof_no_recent": "No recent tabs saved yet.",
        "prof_load_err": "Error loading recent tabs.",
        "prof_size_kb": "KB",

        /* Tab Player */
        "tp_upload_sub": "Drag or click to open a Guitar Pro file",
        "tp_upload_btn": "Choose file",
        "tp_lbl_countin": "COUNT-IN",
        "tp_lbl_speed": "SPEED",
        "tp_lbl_loop": "LOOP & STUDY",
        "tp_lbl_metro": "METRONOME",
        "tp_lbl_mode": "MODE",
        "tp_lbl_audio": "AUDIO",
        "tp_lbl_tracks": "TRACKS",
        "tp_sel_track": "SELECT TRACK",
        "tp_btn_play": "Play / Pause",
        "tp_btn_stop": "Stop",
        "tp_btn_cin": "Count-in before playing",
        "tp_btn_loop": "Loop on/off",
        "tp_btn_loopsel": "Set loop region",
        "tp_btn_loopclr": "Clear loop",
        "tp_btn_mark": "Mark as learned",
        "tp_btn_metro": "Metronome on/off",
        "tp_btn_open": "Open new file",
        "tp_loading": "Loading soundfont and rendering…",
        "tp_rendering": "Rendering…",
        "tp_hint_start": "Click the STARTING measure of the loop",
        "tp_hint_end": "Start: m.{n} — click the ENDING measure",
        "tp_tracks_sel": "{n} Tracks Selected",
        "tp_err_load": "AlphaTab failed to load. Check your connection and refresh the page.",
        "tp_saving_cloud": "Saving to cloud and loading…",
        "tp_loading_cloud": "Loading from cloud…",
        "tp_learned_caption": "bars learned",

        /* YouTube Sync */
        "yt_lbl_source": "AUDIO",
        "yt_btn_alphatab": "AlphaTab",
        "yt_btn_youtube": "YouTube",
        "yt_url_ph": "Paste YouTube URL here…",
        "yt_btn_load": "Load",
        "yt_offset_lbl": "Offset (ms)",
        "yt_community_load": "Load community sync",
        "yt_community_save": "Save my offset",
        "yt_community_no_sync": "No community sync available yet.",
        "yt_community_saved": "✓ Offset saved!",
        "yt_hint": "Adjust offset to sync the video with the score.",
        "yt_no_tab": "Load a tab first."
    }
};

let currentLang = localStorage.getItem('appLang') || 'pt';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLang', lang);
    applyTranslations();
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang] && translations[currentLang][key])
            el.innerHTML = translations[currentLang][key];
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translations[currentLang] && translations[currentLang][key])
            el.title = translations[currentLang][key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang] && translations[currentLang][key])
            el.placeholder = translations[currentLang][key];
    });
    document.querySelectorAll('.lang-flag').forEach(f => f.classList.remove('active'));
    const activeFlag = document.getElementById('flag-' + currentLang);
    if (activeFlag) activeFlag.classList.add('active');
}

// Helper so tab-player.js can read dynamic translations
function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || key;
}

document.addEventListener('DOMContentLoaded', applyTranslations);