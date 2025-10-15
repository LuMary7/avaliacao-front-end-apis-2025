const API_BASE_URL = 'https://dummyjson.com';
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('login__username');
const passwordInput = document.getElementById('login__password');
const loginBtn = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');

document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  // Preenche os campos para teste, caso deseje
  usernameInput.value = 'Aysha';
  passwordInput.value = 'fate2930';
});

function checkAuthStatus() {
  const token = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (token && refreshToken) {
    validateToken(token);
  }
}

async function validateToken(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      window.location.href = 'posts.html';
    } else {
      await refreshAccessToken();
    }
  } catch (error) {
    console.error('Erro ao validar token:', error);
    clearAuthData();
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    clearAuthData();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    const data = await response.json();
    console.log('Dados de resposta ao tentar renovar token:', data);

    if (data.token) {
      localStorage.setItem('accessToken', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      window.location.href = 'posts.html';
    } else {
      clearAuthData();
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    clearAuthData();
  }
}

function clearAuthData() {
  localStorage.clear();
}

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    showError('Preencha todos os campos.');
    return;
  }

  await performLogin(username, password);
});

async function performLogin(username, password) {
  try {
    setLoadingState(true);
    hideError();

    const loginData = { username, password };
    console.log('Dados enviados para login:', loginData);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();
    console.log('Resposta da API de login:', data);

    if (response.ok) {
      if (data.token) {
        // Salvando o token e redirecionando para posts.html
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userData', JSON.stringify(data));
        window.location.href = 'posts.html';
      } else {
        showError('Token não encontrado.');
      }
    } else {
      // Exibindo a mensagem de erro detalhada da API
      showError(data.message || 'Credenciais inválidas.');
    }
  } catch (error) {
    console.error('Erro durante login:', error);
    showError('Erro de conexão.');
  } finally {
    setLoadingState(false);
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  setTimeout(hideError, 4000);
}

function hideError() {
  errorMessage.classList.remove('show');
}

function setLoadingState(loading) {
  loginBtn.disabled = loading;
  loginBtn.textContent = loading ? 'Entrando...' : 'Entrar';
}
