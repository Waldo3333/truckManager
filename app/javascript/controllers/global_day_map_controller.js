// app/javascript/controllers/global_day_map_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
	static values = {
		trucks: Array,
	};

	connect() {
		console.log("Global day map controller connecté!");
	}

	openMap() {
		// Compter le nombre total d'interventions
		const totalInterventions = this.trucksValue.reduce(
			(sum, truck) => sum + truck.interventions.length,
			0
		);

		if (totalInterventions === 0) {
			alert("Aucun chantier planifié pour cette journée");
			return;
		}

		this.createModal();

		setTimeout(() => {
			this.initMap();
		}, 100);
	}

	createModal() {
		let modal = document.getElementById("global-map-modal");
		if (modal) {
			modal.classList.remove("hidden");
			return;
		}

		const modalHTML = `
      <div id="global-map-modal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-xl font-bold">🗺️ Vue d'ensemble - Tous les chantiers du jour</h3>
            <button onclick="document.getElementById('global-map-modal').classList.add('hidden')"
                    class="text-gray-500 hover:text-gray-700 text-2xl">
              ✕
            </button>
          </div>
          <div class="flex flex-1">
            <div id="global-map-container" class="flex-1" style="min-height: 600px;"></div>
            <div class="w-64 p-4 border-l overflow-y-auto bg-gray-50">
              <h4 class="font-bold mb-3">Légende</h4>
              <div id="legend-container" class="space-y-2"></div>
            </div>
          </div>
        </div>
      </div>
    `;

		document.body.insertAdjacentHTML("beforeend", modalHTML);
	}

	initMap() {
		const mapContainer = document.getElementById("global-map-container");
		const legendContainer = document.getElementById("legend-container");

		if (this.map) {
			this.map.remove();
		}

		// Couleurs pour chaque camion
		const colors = [
			"#3b82f6", // bleu
			"#ef4444", // rouge
			"#10b981", // vert
			"#f59e0b", // orange
			"#8b5cf6", // violet
			"#ec4899", // rose
			"#06b6d4", // cyan
			"#84cc16", // lime
		];

		// Créer la carte
		this.map = L.map(mapContainer);

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "© OpenStreetMap contributors",
			maxZoom: 19,
		}).addTo(this.map);

		const allBounds = [];
		let legendHTML = "";

		// Pour chaque camion
		this.trucksValue.forEach((truck, truckIndex) => {
			const color = colors[truckIndex % colors.length];
			const truckNumber = truckIndex + 1;

			// Ajouter à la légende
			legendHTML += `
        <div class="flex items-center gap-2 p-2 bg-white rounded border">
          <div style="background: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            ${truckNumber}
          </div>
          <div>
            <div class="font-medium text-sm">${truck.name}</div>
            <div class="text-xs text-gray-500">${truck.interventions.length} chantier(s)</div>
          </div>
        </div>
      `;

			// Ajouter les marqueurs pour ce camion
			truck.interventions.forEach((intervention) => {
				const marker = L.marker([
					intervention.latitude,
					intervention.longitude,
				]).addTo(this.map);

				allBounds.push([intervention.latitude, intervention.longitude]);

				// Popup avec infos
				const popupContent = `
          <div class="p-2">
            <div class="font-bold text-sm mb-1" style="color: ${color};">
              🚛 ${truck.name}
            </div>
            <div class="font-medium text-sm">${intervention.name}</div>
            <div class="text-xs text-gray-600 mt-1">${intervention.location}</div>
            <div class="text-xs text-blue-600 mt-1">
              ⏰ ${intervention.start_time} - ${intervention.end_time}
            </div>
            <div class="text-xs text-gray-500">
              📏 ${intervention.duration} min
            </div>
          </div>
        `;

				marker.bindPopup(popupContent);

				// Icône personnalisée avec le numéro du camion et sa couleur
				const icon = L.divIcon({
					className: "custom-marker",
					html: `<div style="background: ${color}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4); font-size: 14px;">${truckNumber}</div>`,
					iconSize: [32, 32],
					iconAnchor: [16, 16],
				});
				marker.setIcon(icon);
			});
		});

		// Afficher la légende
		legendContainer.innerHTML = legendHTML;

		// Ajuster la vue pour montrer tous les marqueurs
		if (allBounds.length > 0) {
			const latLngs = allBounds.map((b) => L.latLng(b[0], b[1]));
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
