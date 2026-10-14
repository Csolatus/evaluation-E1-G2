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
    .map((item) => `<li class="badge-tech">${item}</li>`)
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
                    <p class="card-item-meta">${project.category}</p>
                    <h3 class="card-item-title">${project.title}</h3>
                    <p class="card-item-sub">${project.client}</p>
                    <ul class="badge-list" aria-label="Technologies utilisées">${createBadges(project.technologies)}</ul>
                    <button type="button" class="btn-ink btn-ink--small" data-bs-toggle="modal" data-bs-target="#project-modal" data-project-id="${project.id}" aria-label="Voir les détails du projet ${project.title}">Voir détails</button>
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
                        <p class="card-item-meta">${course.category}</p>
                        <span class="badge-status ${course.available ? 'is-available' : 'is-full'}">${course.available ? 'Disponible' : 'Complet'}</span>
                    </div>
                    <h3 class="card-item-title">${course.title}</h3>
                    <p class="card-item-sub">par ${course.instructor}</p>
                    <p class="card-item-info">${course.level} · ${course.duration} · ${course.price} €</p>
                    <p class="card-item-info">
                        <span aria-hidden="true">★</span>
                        <span class="visually-hidden">Note :</span> ${course.rating}<span class="visually-hidden"> sur 5</span>
                        · ${course.students} étudiants
                    </p>
                    <ul class="badge-list" aria-label="Technologies abordées">${createBadges(course.technologies)}</ul>
                    <div class="card-item-actions">
                        <button type="button" class="btn-ink btn-ink--small" data-bs-toggle="modal" data-bs-target="#course-modal" data-course-id="${course.id}" aria-label="Voir les détails de la formation ${course.title}">Voir détails</button>
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

const normalize = (text) => text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const filterProjects = () => {
    const search = normalize(document.getElementById('projects-search').value.trim());
    const tech = document.getElementById('projects-tech').value;
    const category = document.getElementById('projects-category').value;

    const results = projectsData.projects.filter((project) => {
        const text = normalize(`${project.title} ${project.client} ${project.description} ${project.technologies.join(' ')}`);
        const matchSearch = text.includes(search);
        const matchTech = !tech || project.technologies.includes(tech);
        const matchCategory = !category || project.category === category;

        return matchSearch && matchTech && matchCategory;
    });

    renderProjects(results);
};

const filterCourses = () => {
    const search = normalize(document.getElementById('courses-search').value.trim());
    const category = document.getElementById('courses-category').value;
    const level = document.getElementById('courses-level').value;
    const tech = document.getElementById('courses-tech').value;

    const results = coursesData.courses.filter((course) => {
        const text = normalize(`${course.title} ${course.instructor} ${course.description} ${course.technologies.join(' ')}`);
        const matchSearch = text.includes(search);
        const matchCategory = !category || course.category === category;
        const matchLevel = !level || course.level === level;
        const matchTech = !tech || course.technologies.includes(tech);

        return matchSearch && matchCategory && matchLevel && matchTech;
    });

    renderCourses(results);
};

const debounce = (callback, delay = 300) => {
    let timer;

    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), delay);
    };
};

const bindFilters = (searchId, selectIds, callback) => {
    document.getElementById(searchId).addEventListener('input', debounce(callback));
    selectIds.forEach((id) => {
        document.getElementById(id).addEventListener('change', callback);
    });
};

// ========== MODALS ==========
const createList = (items) => items
    .map((item) => `<li>${item}</li>`)
    .join('');

const fillProjectModal = (event) => {
    const id = Number(event.relatedTarget.dataset.projectId);
    const project = projectsData.projects.find((item) => item.id === id);

    document.getElementById('project-modal-title').textContent = project.title;
    document.getElementById('project-modal-body').innerHTML = `
        <img src="${project.image}" alt="Aperçu du projet ${project.title}" class="modal-img">
        <p>${project.description}</p>
        <dl class="modal-details">
            <dt>Client</dt>
            <dd>${project.client}</dd>
            <dt>Catégorie</dt>
            <dd>${project.category}</dd>
            <dt>Année</dt>
            <dd>${project.year}</dd>
            <dt>Durée</dt>
            <dd>${project.duration}</dd>
        </dl>
        <h3 class="modal-subtitle">Technologies</h3>
        <ul class="badge-list">${createBadges(project.technologies)}</ul>
        <h3 class="modal-subtitle">Fonctionnalités</h3>
        <ul>${createList(project.features)}</ul>
        <a href="${project.url}" target="_blank" rel="noopener">Voir le site du projet (nouvel onglet)</a>
    `;
};

const fillCourseModal = (event) => {
    const id = Number(event.relatedTarget.dataset.courseId);
    const course = coursesData.courses.find((item) => item.id === id);
    const cta = document.getElementById('course-modal-cta');

    document.getElementById('course-modal-title').textContent = course.title;
    document.getElementById('course-modal-body').innerHTML = `
        <img src="${course.image}" alt="Illustration de la formation ${course.title}" class="modal-img">
        <p>${course.description}</p>
        <dl class="modal-details">
            <dt>Formateur</dt>
            <dd>${course.instructor}</dd>
            <dt>Catégorie</dt>
            <dd>${course.category}</dd>
            <dt>Niveau</dt>
            <dd>${course.level}</dd>
            <dt>Durée</dt>
            <dd>${course.duration}</dd>
            <dt>Prix</dt>
            <dd>${course.price} €</dd>
            <dt>Note</dt>
            <dd>${course.rating} / 5 (${course.students} étudiants)</dd>
            <dt>Places</dt>
            <dd>${course.available ? 'Disponible' : 'Complet'}</dd>
        </dl>
        <h3 class="modal-subtitle">Technologies</h3>
        <ul class="badge-list">${createBadges(course.technologies)}</ul>
        <h3 class="modal-subtitle">Programme</h3>
        <ol>${createList(course.modules)}</ol>
    `;

    cta.href = `inscription.html?formation=${course.id}`;
    cta.hidden = !course.available;
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
        bindFilters('projects-search', ['projects-tech', 'projects-category'], filterProjects);
        document.getElementById('project-modal').addEventListener('show.bs.modal', fillProjectModal);
    }

    if (coursesData) {
        fillSelect('courses-category', getUniqueValues(coursesData.courses, 'category'));
        fillSelect('courses-level', coursesData.levels);
        fillSelect('courses-tech', getUniqueValues(coursesData.courses, 'technologies'));
        renderCourses(coursesData.courses);
        bindFilters('courses-search', ['courses-category', 'courses-level', 'courses-tech'], filterCourses);
        document.getElementById('course-modal').addEventListener('show.bs.modal', fillCourseModal);
    }
};

if (document.getElementById('projects-grid')) {
    initHome();
}