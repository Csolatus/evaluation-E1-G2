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

// ========== AFFICHAGE DES PROJETS ==========
const createBadges = (items) => items
    .map((item) => `<li class="badge-tech mono">${item}</li>`)
    .join('');

const renderProjects = (projects) => {
    const grid = document.getElementById('projects-grid');
    const count = document.getElementById('projects-count');

    count.textContent = `${projects.length} projet${projects.length > 1 ? 's' : ''}`;

    if (projects.length === 0) {
        grid.innerHTML = '<div class="col-12"><p class="empty-state">Aucun projet ne correspond à votre recherche.</p></div>';
        return;
    }

    grid.innerHTML = projects.map((project) => `
        <div class="col-12 col-md-6 col-lg-4">
            <article class="card-item">
                <img src="${project.image}" alt="Aperçu du projet ${project.title}" class="card-item-img" loading="lazy">
                <div class="card-item-body">
                    <p class="card-item-meta mono">${project.category} · ${project.year}</p>
                    <h3 class="card-item-title">${project.title}</h3>
                    <p class="card-item-sub">${project.client}</p>
                    <ul class="badge-list" aria-label="Technologies utilisées">${createBadges(project.technologies)}</ul>
                    <button type="button" class="btn-ink btn-ink--small" data-project-id="${project.id}" aria-label="Voir les détails du projet ${project.title}">Voir détails</button>
                </div>
            </article>
        </div>
    `).join('');
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

    if (projectsData) {
        renderProjects(projectsData.projects);
    }
    console.log('Formations :', coursesData);
};

if (document.getElementById('projects-grid')) {
    initHome();
}