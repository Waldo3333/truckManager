// app/javascript/controllers/info_card_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
	connect() {
		console.log("✅ Info card controller connecté");
		this.clickStartTime = null;
	}

	// Enregistrer le moment où on commence à cliquer
	startClick(event) {
		this.clickStartTime = Date.now();
	}

	open(event) {
		// Calculer la durée du clic
		const clickDuration = Date.now() - this.clickStartTime;
		console.log("⏱️ Durée du clic:", clickDuration, "ms");

		// Si le clic a duré plus de 100ms, c'est un drag, on ignore
		if (clickDuration > 100) {
			console.log("🚫 Clic trop long (drag détecté), modal non ouverte");
			this.clickStartTime = null;
			return;
		}

		event.stopPropagation();

		const modal = document.getElementById("chantier-info-modal");
		modal.classList.remove("hidden", "pointer-events-none");

		const card = event.currentTarget;
		const chantierId = card.dataset.chantierId;

		console.log("🎯 Ouverture modal pour chantier:", chantierId);

		this.loadChantierInfo(chantierId);
		this.clickStartTime = null;
	}

	async loadChantierInfo(chantierId) {
		const modal = document.getElementById("chantier-info-modal");
		const content = document.getElementById("chantier-info-content");

		if (!modal || !content) {
			console.error("❌ Modal ou content introuvable");
			return;
		}

		try {
			content.innerHTML =
				'<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i></div>';

			modal.classList.remove("opacity-0", "pointer-events-none");
			modal.classList.add("opacity-100", "pointer-events-auto");

			const response = await fetch(`/admin/chantiers/${chantierId}`, {
				headers: {
					Accept: "text/html",
					"X-Requested-With": "XMLHttpRequest",
				},
			});

			if (!response.ok) {
				throw new Error("Erreur lors du chargement");
			}

			const html = await response.text();
			content.innerHTML = html;

			console.log("✅ Chantier chargé");
		} catch (error) {
			console.error("❌ Erreur:", error);
			content.innerHTML =
				'<div class="text-center py-8 text-red-500">Erreur lors du chargement des informations</div>';
		}
	}

	close() {
		console.log("🚪 Fermeture modal");

		const modal = document.getElementById("chantier-info-modal");
		const content = document.getElementById("chantier-info-content");

		if (modal && content) {
			modal.classList.add("hidden", "pointer-events-none");
			content.innerHTML = "";
		}
	}
}
