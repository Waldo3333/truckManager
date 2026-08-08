// app/javascript/controllers/truck_day_map_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
	static values = {
		interventions: Array,
		truckName: String,
	};

	connect() {
		console.log("Truck day map controller connecté!");
	}

	openMap() {
		if (this.interventionsValue.length === 0) {
			alert("Aucun chantier planifié pour ce camion aujourd'hui");
			return;
		}

		this.createModal();

		setTimeout(() => {
			this.initMap();
		}, 100);
	}

	createModal() {
		let modal = document.getElementById("truck-map-modal");
		if (modal) {
			modal.classList.remove("hidden");
			return;
		}

		const modalHTML = `
      <div id="truck-map-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-bold">🚛 ${this.truckNameValue} - Chantiers du jour</h3>
            <button onclick="document.getElementById('truck-map-modal').classList.add('hidden')"
                    class="text-gray-500 hover:text-gray-700 text-2xl">
              ✕
            </button>
          </div>
          <div id="truck-map-container" class="flex-1" style="min-height: 600px;"></div>
        </div>
      </div>
    `;

		document.body.insertAdjacentHTML("beforeend", modalHTML);
	}

	initMap() {
		const mapContainer = document.getElementById("truck-map-container");

		if (this.map) {
			this.map.remove();
		}

		// Calculer le centre et le zoom pour afficher tous les points
		const bounds = this.interventionsValue.map((i) => [
			i.latitude,
			i.longitude,
		]);

		// Créer la carte
		this.map = L.map(mapContainer);

		// Ajouter les tuiles
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "© OpenStreetMap contributors",
			maxZoom: 19,
		}).addTo(this.map);

		// Ajouter un marqueur pour chaque intervention
		this.interventionsValue.forEach((intervention, index) => {
			const marker = L.marker([
				intervention.latitude,
				intervention.longitude,
			]).addTo(this.map);

			// Popup avec les infos
			const popupContent = `
        <div class="p-2">
          <div class="font-bold text-sm mb-1">${index + 1}. ${intervention.name}</div>
          <div class="text-xs text-gray-600">${intervention.location}</div>
          <div class="text-xs text-blue-600 mt-1">
            ⏰ ${intervention.start_time} - ${intervention.end_time}
          </div>
          <div class="text-xs text-gray-500">
            📏 ${intervention.duration} min
          </div>
        </div>
      `;

			marker.bindPopup(popupContent);

			// Numéro sur le marqueur
			const icon = L.divIcon({
				className: "custom-marker",
				html: `<div style="background: #3b82f6; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
				iconSize: [30, 30],
				iconAnchor: [15, 15],
			});
			marker.setIcon(icon);
		});

		// Ajuster la vue pour montrer tous les marqueurs
		const latLngs = bounds.map((b) => L.latLng(b[0], b[1]));
		if (latLngs.length > 0) {
			this.map.fitBounds(L.latLngBounds(latLngs), { padding: [50, 50] });
		}

		setTimeout(() => {
			this.map.invalidateSize();
		}, 200);
	}

	disconnect() {
		if (this.map) {
			this.map.remove();
		}
	}
}
