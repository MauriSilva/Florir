// Inicializa o mapa centralizado no Brasil
const map = L.map('map').setView([-15.78, -47.93], 4);

// Adiciona camada base (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let userMarker = null;
let locaisLayerGroup = L.layerGroup().addTo(map);

// Elemento de loading (agora no HTML)
const loadingDiv = document.getElementById('map-loading');

function mostrarLoading() {
  if (loadingDiv) loadingDiv.style.display = 'flex';
}

function esconderLoading() {
  if (loadingDiv) loadingDiv.style.display = 'none';
}

// Ícones personalizados (coloque os arquivos em /public/icons/)
const icons = {
  hospital: L.icon({ iconUrl: '/icons/hospital.svg', iconSize: [32, 32], iconAnchor: [16, 32] }),
  clinic: L.icon({ iconUrl: '/icons/postoSaude.svg', iconSize: [32, 32], iconAnchor: [16, 32] }),
  pharmacy: L.icon({ iconUrl: '/icons/pharmacy.svg', iconSize: [32, 32], iconAnchor: [16, 32] }),
  social_facility: L.icon({ iconUrl: '/icons/socialFacility.svg', iconSize: [32, 32], iconAnchor: [16, 32] }),
  user: L.icon({ iconUrl: '/icons/user.svg', iconSize: [32, 32], iconAnchor: [16, 32] }),
  default: L.icon({ iconUrl: '/icons/default.svg', iconSize: [32, 32], iconAnchor: [16, 32] })
};

// --- Função principal que busca e exibe locais ---
function buscarLocais(lat, lon) {
  const tiposSelecionados = Array.from(document.querySelectorAll('.filtro:checked')).map(el => el.value);

  if (tiposSelecionados.length === 0) {
    locaisLayerGroup.clearLayers();
    return;
  }

  mostrarLoading(); // mostra o aviso de carregamento

  const filtros = tiposSelecionados
    .map(tipo => `node["amenity"="${tipo}"](around:3000,${lat},${lon});`)
    .join("\n") +
    (tiposSelecionados.includes('social_facility') ? `node["social_facility"](around:3000,${lat},${lon});` : "");

  const query = `[out:json];(${filtros});out;`;

  fetch("https://overpass.kumi.systems/api/interpreter?data=" + encodeURIComponent(query))
    .then(res => res.json())
    .then(data => {
      locaisLayerGroup.clearLayers();

      if (data.elements) {
        data.elements.forEach(el => {
          const tipo = el.tags.amenity || el.tags.social_facility || "default";
          const nome = el.tags.name || "Local sem nome";
          const icone = icons[tipo] || icons.default;

          L.marker([el.lat, el.lon], { icon: icone })
            .addTo(locaisLayerGroup)
            .bindPopup(`<strong>${nome}</strong><br>${tipo}`);
        });
      }
    })
    .catch(err => {
      console.error("Erro ao buscar dados:", err);
    })
    .finally(() => {
      esconderLoading(); // esconde o aviso quando terminar
    });
}

// --- Obtém localização do usuário ---
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      map.setView([lat, lon], 14);

      userMarker = L.marker([lat, lon], { icon: icons.user })
        .addTo(map)
        .bindPopup("Você está aqui 👋")
        .openPopup();

      buscarLocais(lat, lon);

      // Atualiza ao alterar os filtros
      document.querySelectorAll('.filtro').forEach(cb => {
        cb.addEventListener('change', () => buscarLocais(lat, lon));
      });

      // Atualiza ao mover o mapa
      let timeout = null;
      map.on('moveend', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const center = map.getCenter();
          buscarLocais(center.lat, center.lng);
        }, 500);
      });
    },
    err => {
      console.error("Erro ao obter localização:", err);
      alert("Não foi possível acessar sua localização.");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
} else {
  alert("Seu navegador não suporta geolocalização.");
}
