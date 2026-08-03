/* ============================================================
   InoSys — Mockup de média fidelidade
   Sidebar de navegação compartilhada.

   Injeta a sidebar em <div id="sidebar-root"> presente em cada
   tela interna. Responsabilidades:
   - Renderizar marca, itens de navegação e bloco do usuário;
   - Filtrar itens conforme o perfil simulado (persistido em
     localStorage, escolhido na tela de seleção);
   - Destacar o item da página atual;
   - Expor API usada pela tela de seleção (troca de perfil).

   No sistema Django, este JS deixaria de existir: os itens e
   o perfil viriam do template ({% if perms %}) e do usuário
   autenticado ({{ user.perfil }}).
   ============================================================ */
(function () {
  'use strict';

  var CHAVE_PERFIL = 'inosys_perfil';

  /* Perfis e seus módulos permitidos (espelha o modelo de acesso). */
  var PERMISSOES = {
    'administrador': ['estoque', 'fretes', 'visao', 'administracao'],
    'gestor': ['estoque', 'fretes', 'visao'],
    'operacional-estoque': ['estoque'],
    'operacional-fretes': ['fretes']
  };

  var ROTULOS = {
    'administrador': 'Administrador',
    'gestor': 'Gestor',
    'operacional-estoque': 'Operacional de Estoque',
    'operacional-fretes': 'Operacional de Fretes'
  };

  var MODULOS = [
    { id: 'estoque', rotulo: 'Estoque', icone: 'bi-box-seam', arquivo: 'estoque.html' },
    { id: 'fretes', rotulo: 'Fretes', icone: 'bi-truck', arquivo: 'fretes.html' },
    { id: 'visao', rotulo: 'Visão Geral', icone: 'bi-speedometer2', arquivo: 'visao-geral.html' },
    { id: 'administracao', rotulo: 'Administração', icone: 'bi-shield-lock', arquivo: 'administracao.html' }
  ];

  /* Usuário exibido (no Django viria de {{ request.user }}). */
  var NOME_USUARIO = 'Carlos Andrade';

  /* ------------------------------------------------------------
     Leitura/escrita do perfil simulado
     ------------------------------------------------------------ */
  function obterPerfil() {
    var perfil = null;
    try { perfil = localStorage.getItem(CHAVE_PERFIL); } catch (e) { /* ignorar */ }
    return (perfil && PERMISSOES[perfil]) ? perfil : 'administrador';
  }

  function definirPerfil(perfil) {
    if (!PERMISSOES[perfil]) return;
    try { localStorage.setItem(CHAVE_PERFIL, perfil); } catch (e) { /* ignorar */ }
    atualizarInterface();
  }

  /* ------------------------------------------------------------
     Renderização da sidebar
     ------------------------------------------------------------ */
  function injetarSidebar() {
    var root = document.getElementById('sidebar-root');
    if (!root) return;

    var pagina = (window.location.pathname.split('/').pop() || 'selecao.html');
    var ativos = {};
    ativos['estoque.html'] = 'estoque';
    ativos['fretes.html'] = 'fretes';
    ativos['visao-geral.html'] = 'visao';
    ativos['administracao.html'] = 'administracao';
    var moduloAtual = ativos[pagina] || null;

    var html = '';
    html += '<aside class="offcanvas offcanvas-lg offcanvas-start sidebar-off" tabindex="-1" id="sidebarInoSys" aria-labelledby="sidebarTitulo">';
    html += '  <div class="offcanvas-header d-lg-none">';
    html += '    <span class="fs-5 fw-bold" id="sidebarTitulo">InoSys</span>';
    html += '    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" data-bs-target="#sidebarInoSys" aria-label="Fechar menu"></button>';
    html += '  </div>';
    html += '  <div class="offcanvas-body p-0">';
    html += '    <div class="sidebar-caixa">';

    // Marca
    html += '      <a class="sidebar-marca" href="selecao.html"><i class="bi bi-box-seam"></i>InoSys</a>';

    // Itens de navegação (Django: {% if perms.estoque.view_material %} ... {% endif %})
    html += '      <nav class="flex-grow-1">';
    html += '        <p class="sidebar-rotulo">Módulos</p>';
    html += '        <ul class="nav flex-column">';
    for (var i = 0; i < MODULOS.length; i++) {
      var mod = MODULOS[i];
      var ativo = (moduloAtual === mod.id) ? ' active' : '';
      html += '          <li class="nav-item" data-modulo="' + mod.id + '">';
      html += '            <a class="nav-link' + ativo + '" href="' + mod.arquivo + '">';
      html += '              <i class="bi ' + mod.icone + ' me-2"></i>' + mod.rotulo;
      html += '            </a>';
      html += '          </li>';
    }
    html += '        </ul>';
    html += '      </nav>';

    // Troca de perfil simulada (dropdown). Django: no backend vira menu do usuário.
    html += '      <div class="px-1 sidebar-perfil">';
    html += '        <p class="sidebar-rotulo">Perfil simulado</p>';
    html += '        <div class="dropdown w-100">';
    html += '          <button class="btn btn-outline-light btn-sm w-100 dropdown-toggle d-flex justify-content-between align-items-center" type="button" id="dropdownPerfil" data-bs-toggle="dropdown" aria-expanded="false">';
    html += '            <span><i class="bi bi-person-gear me-1"></i><span id="dropdownPerfilRotulo">' + ROTULOS[obterPerfil()] + '</span></span>';
    html += '            <i class="bi bi-chevron-down"></i>';
    html += '          </button>';
    html += '          <ul class="dropdown-menu w-100" aria-labelledby="dropdownPerfil">';
    var perfis = ['administrador', 'gestor', 'operacional-estoque', 'operacional-fretes'];
    for (var p = 0; p < perfis.length; p++) {
      var perfilId = perfis[p];
      html += '            <li><button class="dropdown-item" type="button" data-perfil="' + perfilId + '"><i class="bi bi-check-lg me-2 check-perfil"></i>' + ROTULOS[perfilId] + '</button></li>';
    }
    html += '          </ul>';
    html += '        </div>';
    html += '      </div>';

    // Usuário + Sair
    html += '      <div class="sidebar-usuario border-top">';
    html += '        <div class="d-flex align-items-center gap-2">';
    html += '          <i class="bi bi-person-circle fs-4"></i>';
    html += '          <div>';

    // Django: {{ user.get_full_name }} e {{ user.get_perfil_display }}
    html += '            <div class="fw-semibold">' + NOME_USUARIO + '</div>';
    html += '            <div class="pequeno" id="sidebarPerfilUsuario"></div>';
    html += '          </div>';
    html += '        </div>';
    html += '        <a href="login.html" class="btn btn-outline-light btn-sm w-100 mt-3"><i class="bi bi-box-arrow-right me-1"></i>Sair</a>';
    html += '      </div>';

    html += '    </div>';
    html += '  </div>';
    html += '</aside>';

    root.innerHTML = html;

    // Vincula o fechamento do menu ao clicar num link interno (mobile).
    var offcanvasEl = document.getElementById('sidebarInoSys');
    offcanvasEl.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var destino = link.getAttribute('href');
      if (destino && destino.charAt(0) !== '#' && destino.indexOf('.html') !== -1) {
        var instancia = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (instancia) instancia.hide();
      }
    });

    // Troca de perfil pelo dropdown.
    var togglePerfil = offcanvasEl.querySelector('#dropdownPerfil');
    offcanvasEl.querySelector('.sidebar-perfil .dropdown-menu').addEventListener('click', function (e) {
      var item = e.target.closest('.dropdown-item');
      if (!item || !item.dataset.perfil) return;
      definirPerfil(item.dataset.perfil);
      bootstrap.Dropdown.getOrCreateInstance(togglePerfil).hide();
    });

    atualizarInterface();
  }

  /* ------------------------------------------------------------
     Atualiza filtro por perfil e rótulos
     ------------------------------------------------------------ */
  function atualizarInterface() {
    var perfil = obterPerfil();
    var permitidos = PERMISSOES[perfil];
    var rotulo = ROTULOS[perfil];

    document.querySelectorAll('#sidebar-root .nav-item').forEach(function (item) {
      item.classList.toggle('d-none', permitidos.indexOf(item.dataset.modulo) === -1);
    });

    document.querySelectorAll('#dropdownPerfilRotulo, #sidebarPerfilUsuario').forEach(function (el) {
      el.textContent = rotulo;
    });

    // Marca o perfil atual no dropdown.
    document.querySelectorAll('#sidebar-root .dropdown-item').forEach(function (item) {
      item.classList.toggle('atual', item.dataset.perfil === perfil);
    });

    // Notifica a tela de seleção (se presente) para sincronizar os cards.
    if (typeof window.inosysAtualizarCards === 'function') {
      window.inosysAtualizarCards(perfil);
    }
  }

  /* ------------------------------------------------------------
     API exposta (usada pela tela de seleção)
     ------------------------------------------------------------ */
  window.inosysObterPerfil = obterPerfil;
  window.inosysDefinirPerfil = definirPerfil;
  window.inosysPermissoes = PERMISSOES;
  window.inosysRotulos = ROTULOS;

  /* ------------------------------------------------------------
     Execução inicial
     ------------------------------------------------------------ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injetarSidebar);
  } else {
    injetarSidebar();
  }
})();
