// app/javascript/controllers/chantier_map_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
	static values = {
		latitude: Number,
		longitude: Number,
		name: String,
	};

	connect() {
		console.log("Chantier map controller connecté!");
	}

	openMap() {
		// Créer le modal
		this.createModal();

		// Initialiser la carte
		setTimeout(() => {
			this.initMap();
		}, 100); // Petit délai pour que le DOM soit prêt
	}

	createModal() {
		// Vérifier si le modal existe déjà
		let modal = document.getElementById("map-modal");
		if (modal) {
			modal.classList.remove("hidden");
			return;
		}

		// Créer le HTML du modal
		const modalHTML = `
      <div id="map-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-bold">${this.nameValue}</h3>
            <button onclick="document.getElementById('map-modal').classList.add('hidden')"
                    class="text-gray-500 hover:text-gray-700 text-2xl">
              ✕
            </button>
          </div>
          <div id="map-container" class="flex-1" style="min-height: 500px;"></div>
        </div>
      </div>
    `;

		document.body.insertAdjacentHTML("beforeend", modalHTML);
	}

	initMap() {
		const mapContainer = document.getElementById("map-container");

		// Supprimer la carte existante si elle existe
		if (this.map) {
			this.map.remove();
		}

		// Créer la carte
		this.map = L.map(mapContainer).setView(
			[this.latitudeValue, this.longitudeValue],
			15
		);

		// Ajouter les tuiles OpenStreetMap
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "© OpenStreetMap contributors",
			maxZoom: 19,
		}).addTo(this.map);

		// Ajouter un marqueur
		const marker = L.marker([this.latitudeValue, this.longitudeValue]).addTo(
			this.map
		);
		marker.bindPopup(`<b>${this.nameValue}</b>`).openPopup();

		// Forcer le recalcul de la taille de la carte
		setTimeout(() => {
			this.map.invalidateSize();
		}, 200);
	}

	disconnect() {
		// Nettoyer la carte si le controller est déconnecté
		if (this.map) {
			this.map.remove();
		}
	}
}
