// app/javascript/controllers/planning_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
	static targets = ["chantiersList", "timeline"];

	connect() {
		console.log("🚀 Planning controller connecté");
		this.initializeSortable();
	}

	initializeSortable() {
		// Liste des chantiers (source)
		const chantiersList = this.element.querySelector("[data-chantiers-list]");

		if (chantiersList) {
			console.log("✅ Liste des chantiers trouvée");
			new Sortable(chantiersList, {
				group: {
					name: "chantiers",
					pull: "clone",
					put: false,
				},
				animation: 150,
				sort: false,
			});
		}

		// Variables pour le drag
		this.draggedItem = null;
		this.mouseX = null;

		// Timelines des camions
		const timelines = this.element.querySelectorAll("[data-truck-timeline]");
		console.log(`✅ ${timelines.length} timelines trouvées`);

		timelines.forEach((timeline, index) => {
			console.log(`⚙️ Configuration timeline ${index + 1}`);

			timeline.addEventListener("dragover", (e) => {
				this.mouseX = e.clientX;
			});

			new Sortable(timeline, {
				group: {
					name: "chantiers",
					pull: true,
					put: true,
				},
				animation: 150,
				draggable: "[data-intervention-id], [data-chantier-id]",

				onStart: (evt) => {
					console.log("🎯 onStart déclenché");
					this.draggedItem = evt.item;
					this.mouseX = null;
				},

				onAdd: (evt) => {
					console.log("➕ onAdd déclenché");
					this.handleDrop(evt, "onAdd");
				},

				onEnd: (evt) => {
					console.log("🏁 onEnd déclenché");
					const item = evt.item;
					const interventionId = item.dataset.interventionId;

					if (interventionId && evt.from === evt.to && this.mouseX !== null) {
						console.log("✅ Déplacement dans la même timeline détecté");
						this.handleDrop(evt, "onEnd");
					}

					this.draggedItem = null;
					this.mouseX = null;
				},
			});
		});

		// Boutons de suppression
		this.element
			.querySelectorAll("[data-delete-intervention]")
			.forEach((button) => {
				button.addEventListener("click", (e) => {
					e.stopPropagation();
					const interventionId = button.dataset.deleteIntervention;

					if (confirm("Supprimer cette intervention ?")) {
						this.deleteIntervention(interventionId);
					}
				});
			});
	}

	handleDrop(evt, source) {
		console.log(`🎬 handleDrop appelé depuis: ${source}`);

		const item = evt.item;
		const chantierId = item.dataset.chantierId;
		const interventionId = item.dataset.interventionId;
		const truckId = evt.to.dataset.truckId;
		const date = evt.to.dataset.date;

		const timelineRect = evt.to.getBoundingClientRect();
		let relativeX;

		if (this.mouseX !== null) {
			relativeX = this.mouseX - timelineRect.left;
		} else {
			const itemRect = item.getBoundingClientRect();
			relativeX = itemRect.left - timelineRect.left;
		}

		const totalMinutesFrom7am = Math.max(0, Math.round(relativeX));
		const roundedMinutes = Math.round(totalMinutesFrom7am / 15) * 15;

		const hours = Math.floor(roundedMinutes / 60);
		const minutes = roundedMinutes % 60;

		const startHour = 7 + hours;
		const startMinute = minutes;

		if (startHour < 7 || startHour >= 19) {
			alert("Vous devez placer l'intervention entre 7h et 18h");
			item.remove();
			window.location.reload();
			return;
		}

		const startTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;

		if (interventionId) {
			this.updateIntervention(interventionId, truckId, date, startTime);
		} else {
			this.createIntervention(chantierId, truckId, date, startTime);
		}

		item.remove();
	}

	createIntervention(chantierId, truckId, date, startTime) {
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
					window.location.reload();
				} else {
					alert("Erreur : " + data.error);
					window.location.reload();
				}
			})
			.catch((error) => {
				alert("Erreur lors de la création");
				window.location.reload();
			});
	}

	updateIntervention(interventionId, truckId, date, startTime) {
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
					window.location.reload();
				} else {
					alert("Erreur : " + data.error);
					window.location.reload();
				}
			})
			.catch((error) => {
				alert("Erreur lors du déplacement");
				window.location.reload();
			});
	}

	deleteIntervention(interventionId) {
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
					window.location.reload();
				} else {
					alert("Erreur : " + data.error);
				}
			})
			.catch((error) => {
				alert("Erreur lors de la suppression");
			});
	}
}
