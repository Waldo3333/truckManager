// app/javascript/controllers/planning_mobile_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
	static targets = [
		"chantier",
		"toast",
		"truckModal",
		"timeModal",
		"driverModal",
		"selectedChantierInfo",
		"planningInfo",
		"driverTruckInfo",
		"driverForm",
		"driverTruckId",
	];

	connect() {
		console.log("📱 Planning mobile connecté");

		this.adjustViewport();

		// Réajuster lors de la rotation
		window.addEventListener("resize", () => this.adjustViewport());
		window.addEventListener("orientationchange", () => this.adjustViewport());

		this.selectedChantier = null;
		this.selectedTruck = null;
		this.movingIntervention = null; // Pour le déplacement d'interventions
	}

	disconnect() {
		// Nettoyer les listeners
		window.removeEventListener("resize", this.adjustViewport);
		window.removeEventListener("orientationchange", this.adjustViewport);
	}

	adjustViewport() {
		setTimeout(() => {
			const planningContainer = document.querySelector(
				".mobile-timeline-container"
			);

			if (!planningContainer) return;

			const contentWidth = planningContainer.scrollWidth;
			const screenWidth = window.innerWidth;
			const scale = Math.min(screenWidth / contentWidth, 1.0);

			console.log(
				`📐 Planning: ${contentWidth}px | Écran: ${screenWidth}px | Scale: ${scale.toFixed(2)}`
			);

			let viewport = document.querySelector("meta[name=viewport]");

			if (!viewport) {
				viewport = document.createElement("meta");
				viewport.name = "viewport";
				document.head.appendChild(viewport);
			}

			viewport.content = `width=device-width, initial-scale=${scale}, maximum-scale=1.0, user-scalable=yes`;
		}, 100);
	}

	// Navigation de dates
	prevDay(event) {
		event.preventDefault();
		const dateInput = document.querySelector('input[type="date"]');
		const currentDate = new Date(dateInput.value);
		currentDate.setDate(currentDate.getDate() - 1);
		dateInput.value = currentDate.toISOString().split("T")[0];
		dateInput.form.submit();
	}

	nextDay(event) {
		event.preventDefault();
		const dateInput = document.querySelector('input[type="date"]');
		const currentDate = new Date(dateInput.value);
		currentDate.setDate(currentDate.getDate() + 1);
		dateInput.value = currentDate.toISOString().split("T")[0];
		dateInput.form.submit();
	}

	changeDate(event) {
		event.currentTarget.form.submit();
	}

	// Étape 1 : Sélection du chantier (nouveau)
	selectChantier(event) {
		const card = event.currentTarget;

		// Désélectionner tous
		this.chantierTargets.forEach((el) => el.classList.remove("selected"));

		// Sélectionner celui-ci
		card.classList.add("selected");

		this.selectedChantier = {
			id: card.dataset.chantierId,
			name: card.dataset.chantierName,
			duration: parseInt(card.dataset.chantierDuration),
		};

		// Afficher les infos dans la modal
		this.selectedChantierInfoTarget.innerHTML = `
      <div class="info-card">
        <strong>${this.selectedChantier.name}</strong>
        <div>Durée : ${this.selectedChantier.duration} min</div>
      </div>
    `;

		// Ouvrir la modal de sélection du camion
		this.truckModalTarget.classList.remove("hidden");
	}

	// Déplacement d'une intervention existante
	moveIntervention(event) {
		event.stopPropagation();

		const intervention = event.currentTarget;

		this.movingIntervention = {
			id: intervention.dataset.interventionId,
			chantierId: intervention.dataset.chantierId,
			name: intervention.dataset.chantierName,
			duration: parseInt(intervention.dataset.chantierDuration),
			currentTruckId: intervention.dataset.currentTruckId,
		};

		// Afficher les infos dans la modal
		this.selectedChantierInfoTarget.innerHTML = `
      <div class="info-card">
        <div class="text-amber-600 font-semibold mb-2">🔄 Déplacement</div>
        <strong>${this.movingIntervention.name}</strong>
        <div>Durée : ${this.movingIntervention.duration} min</div>
      </div>
    `;

		// Ouvrir la modal de sélection du camion
		this.truckModalTarget.classList.remove("hidden");
	}

	closeTruckModal() {
		this.truckModalTarget.classList.add("hidden");
	}

	// Étape 2 : Sélection du camion
	selectTruck(event) {
		const truckOption = event.currentTarget;

		this.selectedTruck = {
			id: truckOption.dataset.truckId,
			name: truckOption.dataset.truckName,
		};

		// Différencier création vs déplacement
		const isMoving = !!this.movingIntervention;
		const chantierInfo = isMoving
			? this.movingIntervention
			: this.selectedChantier;

		// Afficher les infos dans la modal de temps
		this.planningInfoTarget.innerHTML = `
      <div class="info-card">
        ${isMoving ? '<div class="text-amber-600 font-semibold mb-2">🔄 Déplacement</div>' : ""}
        <div><strong>Chantier :</strong> ${chantierInfo.name}</div>
        <div><strong>Camion :</strong> ${this.selectedTruck.name}</div>
        <div><strong>Durée :</strong> ${chantierInfo.duration} min</div>
      </div>
    `;

		// Fermer modal camion, ouvrir modal temps
		this.closeTruckModal();
		this.timeModalTarget.classList.remove("hidden");
	}

	closeTimeModal() {
		this.timeModalTarget.classList.add("hidden");
	}

	// Étape 3 : Sélection de l'heure
	selectTime(event) {
		const timeSlot = event.currentTarget;
		const time = timeSlot.dataset.time;
		const dateInput = document.querySelector('input[type="date"]');
		const date = dateInput.value;

		// Si on déplace une intervention
		if (this.movingIntervention) {
			this.updateIntervention(
				this.movingIntervention.id,
				this.selectedTruck.id,
				date,
				time
			);

			// Reset
			this.movingIntervention = null;
		}
		// Si on crée une nouvelle intervention
		else {
			this.createIntervention(
				this.selectedChantier.id,
				this.selectedTruck.id,
				date,
				time
			);
		}

		// Fermer la modal
		this.closeTimeModal();
	}

	// Gestion conducteur
	openDriverModal(event) {
		const button = event.currentTarget;
		const truckId = button.dataset.truckId;
		const truckName = button.dataset.truckName;
		const assignmentId = button.dataset.assignmentId || null;

		this.driverTruckInfoTarget.innerHTML = `
      <div class="info-card">
        <strong>${truckName}</strong>
        ${
					assignmentId
						? '<div class="text-sm text-gray-600">Modifier l\'assignation</div>'
						: '<div class="text-sm text-gray-600">Assigner un conducteur</div>'
				}
      </div>
    `;

		this.driverTruckIdTarget.value = truckId;

		// Si c'est une modification, pré-sélectionner le conducteur actuel
		if (assignmentId) {
			this.driverFormTarget.action = `/admin/daily_assignments/${assignmentId}`;
			// Ajouter un champ hidden pour la méthode PATCH
			const methodField = this.driverFormTarget.querySelector(
				'input[name="_method"]'
			);
			if (!methodField) {
				const input = document.createElement("input");
				input.type = "hidden";
				input.name = "_method";
				input.value = "patch";
				this.driverFormTarget.appendChild(input);
			}
		} else {
			this.driverFormTarget.action = "/admin/daily_assignments";
			// Retirer le champ _method s'il existe
			const methodField = this.driverFormTarget.querySelector(
				'input[name="_method"]'
			);
			if (methodField) methodField.remove();
		}

		this.driverModalTarget.classList.remove("hidden");
	}

	closeDriverModal() {
		this.driverModalTarget.classList.add("hidden");
	}

	submitDriver(event) {
		// Le form se soumet normalement
	}

	// Actions sur intervention avec choix
	showInterventionActions(event) {
		event.stopPropagation();

		const intervention = event.currentTarget;
		const interventionId = intervention.dataset.interventionId;
		const name = intervention.dataset.chantierName;

		// Menu d'actions
		const action = confirm(`"${name}"\n\nOK = Déplacer | Annuler = Supprimer`);

		if (action) {
			// Déplacer
			this.moveIntervention(event);
		} else {
			// Supprimer
			if (confirm(`Confirmer la suppression de "${name}" ?`)) {
				this.deleteIntervention(interventionId);
			}
		}
	}

	// API calls
	createIntervention(chantierId, truckId, date, startTime) {
		this.showToast("⏳ Création en cours...");

		fetch("/admin/interventions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": document.querySelector('[name="csrf-token"]').content,
			},
			body: JSON.stringify({
				intervention: {
					chantier_id: chantierId,
					truck_id: truckId,
					date: date,
					start_time: startTime,
				},
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					this.showToast("✅ Intervention créée !");
					setTimeout(() => window.location.reload(), 1000);
				} else {
					this.showToast("❌ Erreur : " + data.error);
				}
			})
			.catch((error) => {
				console.error("❌ Erreur:", error);
				this.showToast("❌ Erreur lors de la création");
			});
	}

	updateIntervention(interventionId, truckId, date, startTime) {
		this.showToast("⏳ Déplacement en cours...");

		fetch(`/admin/interventions/${interventionId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": document.querySelector('[name="csrf-token"]').content,
			},
			body: JSON.stringify({
				intervention: {
					truck_id: truckId,
					date: date,
					start_time: startTime,
				},
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					this.showToast("✅ Intervention déplacée !");
					setTimeout(() => window.location.reload(), 1000);
				} else {
					this.showToast("❌ Erreur : " + data.error);
				}
			})
			.catch((error) => {
				console.error("❌ Erreur:", error);
				this.showToast("❌ Erreur lors du déplacement");
			});
	}

	deleteIntervention(interventionId) {
		this.showToast("⏳ Suppression en cours...");

		fetch(`/admin/interventions/${interventionId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				"X-CSRF-Token": document.querySelector('[name="csrf-token"]').content,
			},
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					this.showToast("✅ Intervention supprimée");
					setTimeout(() => window.location.reload(), 1000);
				} else {
					this.showToast("❌ Erreur : " + data.error);
				}
			})
			.catch((error) => {
				console.error("❌ Erreur:", error);
				this.showToast("❌ Erreur lors de la suppression");
			});
	}

	showToast(message) {
		const toast = this.toastTarget;
		toast.textContent = message;
		toast.classList.remove("hidden");

		setTimeout(() => {
			toast.classList.add("hidden");
		}, 3000);
	}
}
