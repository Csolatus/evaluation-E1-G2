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

// ========== AFFICHAGE DES FORMATIONS ==========
const createSignupButton = (course) => {
    if (!course.available) {
        return '<button type="button" class="btn-ink btn-ink--outline btn-ink--small" disabled>Complet</button>';
    }

    return `<a href="inscription.html?formation=${course.id}" class="btn-ink btn-ink--outline btn-ink--small" aria-label="S'inscrire à la formation ${course.title}">S'inscrire</a>`;
};

const renderCourses = (courses) => {
    const grid = document.getElementById('courses-grid');
    const count = document.getElementById('courses-count');

    count.textContent = `${courses.length} formation${courses.length > 1 ? 's' : ''}`;

    if (courses.length === 0) {
        grid.innerHTML = '<div class="col-12"><p class="empty-state">Aucune formation ne correspond à votre recherche.</p></div>';
        return;
    }

    grid.innerHTML = courses.map((course) => `
        <div class="col-12 col-md-6 col-lg-4">
            <article class="card-item">
                <img src="${course.image}" alt="Illustration de la formation ${course.title}" class="card-item-img" loading="lazy">
                <div class="card-item-body">
                    <div class="card-item-top">
                        <p class="card-item-meta mono">${course.category}</p>
                        <span class="badge-status mono ${course.available ? 'is-available' : 'is-full'}">${course.available ? 'Disponible' : 'Complet'}</span>
                    </div>
                    <h3 class="card-item-title">${course.title}</h3>
                    <p class="card-item-sub">par ${course.instructor}</p>
                    <ul class="course-facts mono">
                        <li class="badge-level">${course.level}</li>
                        <li>${course.duration}</li>
                        <li>${course.price} €</li>
                    </ul>
                    <p class="course-stats mono">
                        <span aria-hidden="true">★</span>
                        <span class="visually-hidden">Note :</span> ${course.rating}<span class="visually-hidden"> sur 5</span>
                        · ${course.students} étudiants
                    </p>
                    <ul class="badge-list" aria-label="Technologies abordées">${createBadges(course.technologies)}</ul>
                    <div class="card-item-actions">
                        <button type="button" class="btn-ink btn-ink--small" data-course-id="${course.id}" aria-label="Voir les détails de la formation ${course.title}">Voir détails</button>
                        ${createSignupButton(course)}
                    </div>
                </div>
            </article>
        </div>
    `).join('');
};

// ========== FILTRES ==========
const getUniqueValues = (items, field) => [...new Set(items.flatMap((item) => item[field]))]
    .sort((a, b) => a.localeCompare(b, 'fr'));

const fillSelect = (selectId, values) => {
    const select = document.getElementById(selectId);
    const options = values
        .map((value) => `<option value="${value}">${value}</option>`)
        .join('');

    select.insertAdjacentHTML('beforeend', options);
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
        fillSelect('projects-tech', getUniqueValues(projectsData.projects, 'technologies'));
        fillSelect('projects-category', getUniqueValues(projectsData.projects, 'category'));
        renderProjects(projectsData.projects);
    }
    if (coursesData) {
        fillSelect('courses-category', getUniqueValues(coursesData.courses, 'category'));
        fillSelect('courses-level', coursesData.levels);
        fillSelect('courses-tech', getUniqueValues(coursesData.courses, 'technologies'));
        renderCourses(coursesData.courses)
    }
};

if (document.getElementById('projects-grid')) {
    initHome();
}