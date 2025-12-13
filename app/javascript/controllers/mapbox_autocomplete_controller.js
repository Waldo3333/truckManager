// app/javascript/controllers/mapbox_autocomplete_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
	static targets = ["input", "results", "latitude", "longitude"];
	static values = {
		accessToken: String,
	};

	connect() {
		console.log("Mapbox autocomplete connecté !");
		this.timeout = null;
	}

	search() {
		clearTimeout(this.timeout);

		const query = this.inputTarget.value;

		if (query.length < 3) {
			this.resultsTarget.innerHTML = "";
			this.resultsTarget.classList.add("hidden");
			return;
		}

		// Attendre 300ms après la dernière frappe
		this.timeout = setTimeout(() => {
			this.fetchSuggestions(query);
		}, 300);
	}

	async fetchSuggestions(query) {
		const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.accessTokenValue}&country=FR&language=fr&limit=5`;

		try {
			const response = await fetch(url);
			const data = await response.json();
			this.displayResults(data.features);
		} catch (error) {
			console.error("Erreur Mapbox:", error);
		}
	}

	displayResults(features) {
		if (features.length === 0) {
			this.resultsTarget.innerHTML =
				"<div class='px-4 py-2 text-gray-500'>Aucun résultat</div>";
			this.resultsTarget.classList.remove("hidden");
			return;
		}

		const html = features
			.map(
				(feature) => `
      <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
           data-action="click->mapbox-autocomplete#selectAddress"
           data-longitude="${feature.geometry.coordinates[0]}"
           data-latitude="${feature.geometry.coordinates[1]}"
           data-place-name="${feature.place_name}">
        ${feature.place_name}
      </div>
    `
			)
			.join("");

		this.resultsTarget.innerHTML = html;
		this.resultsTarget.classList.remove("hidden");
	}

	selectAddress(event) {
		const element = event.currentTarget;
		const placeName = element.dataset.placeName;
		const latitude = element.dataset.latitude;
		const longitude = element.dataset.longitude;

		// Remplir les champs
		this.inputTarget.value = placeName;
		this.latitudeTarget.value = latitude;
		this.longitudeTarget.value = longitude;

		// Cacher les résultats
		this.resultsTarget.classList.add("hidden");

		console.log("Adresse sélectionnée:", placeName, latitude, longitude);
	}

	hideResults() {
		// Petit délai pour permettre le clic sur un résultat
		setTimeout(() => {
			this.resultsTarget.classList.add("hidden");
		}, 200);
	}
}
