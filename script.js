// Elementos del DOM
const postsContainer = document.getElementById('postsContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const userFilter = document.getElementById('userFilter');
const loadingElement = document.getElementById('loading');
const noResultsElement = document.getElementById('noResults');

// Estado de la aplicación
let posts = [];
let users = new Map();

// Inicialización
async function init() {
    showLoading(true);
    try {
        await Promise.all([fetchPosts(), fetchUsers()]);
        renderUserFilter();
        renderPosts(posts);
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        alert('Hubo un error al cargar los datos. Por favor, recarga la página.');
    } finally {
        showLoading(false);
    }
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    userFilter.addEventListener('change', handleSearch);
}

// Obtener publicaciones de la API
async function fetchPosts() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        posts = await response.json();
    } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
        throw error;
    }
}

// Obtener usuarios de la API
async function fetchUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const userList = await response.json();
        userList.forEach(user => {
            users.set(user.id, user);
        });
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        throw error;
    }
}

// Renderizar el selector de usuarios
function renderUserFilter() {
    const userOptions = Array.from(users.values()).map(user => 
        `<option value="${user.id}">${user.name}</option>`
    ).join('');
    
    userFilter.innerHTML = '<option value="">Todos los usuarios</option>' + userOptions;
}

// Renderizar publicaciones
function renderPosts(postsToRender) {
    if (postsToRender.length === 0) {
        postsContainer.style.display = 'none';
        noResultsElement.style.display = 'flex';
        return;
    }
    
    postsContainer.style.display = 'grid';
    noResultsElement.style.display = 'none';
    
    postsContainer.innerHTML = postsToRender.map(post => {
        const user = users.get(post.userId);
        const userName = user ? user.name : 'Usuario desconocido';
        const userEmail = user ? user.email : '';
        
        // Limitar el contenido a 150 caracteres
        const contentPreview = post.body.length > 150 
            ? post.body.substring(0, 150) + '...' 
            : post.body;
        
        return `
            <div class="post-card">
                <div class="post-header">
                    <div class="post-user">
                        <i class="fas fa-user"></i>
                        <span>${userName}</span>
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                </div>
                <div class="post-body">
                    <span class="post-id">#${post.id}</span>
                    <p class="post-content">${contentPreview}</p>
                    <div class="post-footer">
                        <div class="post-actions">
                            <span><i class="far fa-comment"></i> Comentarios</span>
                            <span><i class="far fa-heart"></i> Me gusta</span>
                        </div>
                        <div class="post-meta">
                            <i class="far fa-envelope"></i> ${userEmail}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Manejar búsqueda y filtrado
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedUserId = userFilter.value;
    
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm) || 
                            post.body.toLowerCase().includes(searchTerm);
        const matchesUser = !selectedUserId || post.userId === parseInt(selectedUserId);
        return matchesSearch && matchesUser;
    });
    
    renderPosts(filteredPosts);
}

// Mostrar/ocultar indicador de carga
function showLoading(show) {
    loadingElement.style.display = show ? 'flex' : 'none';
    if (show) {
        postsContainer.style.display = 'none';
        noResultsElement.style.display = 'none';
    }
}

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Agregar estilos para el spinner
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .fa-spinner {
            animation: spin 1s linear infinite;
        }
    `;
    document.head.appendChild(style);
    
    init();
});
