'use strict';

// ========== CONFIGURATION ==========
const API_PROJECTS = 'https://webcraft-api.vercel.app/data/projects.json';
const API_COURSES = 'https://webcraft-api.vercel.app/data/courses.json';

// ========== DONNÉES ==========
let projectsData = null;
let coursesData = null;

// ========== CHARGEMENT DES API ==========
const fetchData = async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status} sur ${url}`);
    }

    return response.json();
};

const loadSection = async (url, loaderId, errorId, errorMessage) => {
    const loader = document.getElementById(loaderId);
    const error = document.getElementById(errorId);

    loader.hidden = false;
    error.hidden = true;

    try {
        return await fetchData(url);
    } catch (err) {
        console.error(err);
        error.textContent = errorMessage;
        error.hidden = false;
        return null;
    } finally {
        loader.hidden = true;
    }
};

// ========== INITIALISATION ==========
const initHome = async () => {
    [projectsData, coursesData] = await Promise.all([
        loadSection(
            API_PROJECTS,
            'projects-loader',
            'projects-error',
            'Impossible de charger les projets pour le moment. Vérifiez votre connexion puis rechargez la page.'
        ),
        loadSection(
            API_COURSES,
            'courses-loader',
            'courses-error',
            'Impossible de charger les formations pour le moment. Vérifiez votre connexion puis rechargez la page.'
        )
    ]);

    console.log('Projets :', projectsData);
    console.log('Formations :', coursesData);
};

if (document.getElementById('projects-grid')) {
    initHome();
}