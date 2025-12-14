// app/javascript/controllers/planning_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
	static targets = ["chantiersList", "timeline", "saveButton", "pendingCount"];

	connect() {
		this.pendingChanges = {
			creates: [],
			updates: [],
			deletes: [],
		};

		this.initializeSortable();
		this.updateSaveButton();
		this.setupNavigationWarning();
		this.setupLinkInterception();
	}

	setupNavigationWarning() {
		// Pour les fermetures d'onglet, changements d'URL, etc.
		window.onbeforeunload = () => {
			const totalChanges =
				this.pendingChanges.creates.length +
				this.pendingChanges.updates.length +
				this.pendingChanges.deletes.length;

			if (totalChanges > 0) {
				return "Vous avez des modifications non sauvegardées.";
			}
		};
	}

	setupLinkInterception() {
		this.boundHandleLinkClick = this.handleLinkClick.bind(this);
		this.boundHandleFormSubmit = this.handleFormSubmit.bind(this);

		document.addEventListener("click", this.boundHandleLinkClick, true);
		document.addEventListener("submit", this.boundHandleFormSubmit, true);
	}

	handleLinkClick(event) {
		const totalChanges =
			this.pendingChanges.creates.length +
			this.pendingChanges.updates.length +
			this.pendingChanges.deletes.length;

		if (totalChanges === 0) {
			return;
		}

		const link = event.target.closest("a[href], button[data-turbo-method]");

		if (link) {
			// Ne pas bloquer les boutons du planning lui-même
			if (link.closest('[data-controller*="planning"]')) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			if (
				confirm(
					"Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter cette page ?"
				)
			) {
				this.cleanupWarnings();

				if (link.href) {
					window.location.href = link.href;
				} else if (link.dataset.turboMethod) {
					link.click();
				}
			}
		}
	}

	handleFormSubmit(event) {
		const totalChanges =
			this.pendingChanges.creates.length +
			this.pendingChanges.updates.length +
			this.pendingChanges.deletes.length;

		if (totalChanges === 0) {
			return;
		}

		// Ne pas bloquer le formulaire de date du planning
		if (event.target.closest('[data-controller*="planning"]')) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (
			confirm(
				"Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter cette page ?"
			)
		) {
			this.cleanupWarnings();
			event.target.submit();
		}
	}

	cleanupWarnings() {
		window.onbeforeunload = null;

		if (this.boundHandleLinkClick) {
			document.removeEventListener("click", this.boundHandleLinkClick, true);
		}

		if (this.boundHandleFormSubmit) {
			document.removeEventListener("submit", this.boundHandleFormSubmit, true);
		}
	}

	disconnect() {
		this.cleanupWarnings();
	}

	initializeSortable() {
		const chantiersList = this.element.querySelector("[data-chantiers-list]");

		if (chantiersList) {
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

		this.draggedItem = null;
		this.mouseX = null;

		const timelines = this.element.querySelectorAll("[data-truck-timeline]");

		timelines.forEach((timeline) => {
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
					this.draggedItem = evt.item;
					this.mouseX = null;
				},

				onAdd: (evt) => {
					this.handleDrop(evt, "onAdd");
				},

				onEnd: (evt) => {
					const item = evt.item;
					const interventionId = item.dataset.interventionId;

					if (interventionId && evt.from === evt.to && this.mouseX !== null) {
						this.handleDrop(evt, "onEnd");
					}

					this.draggedItem = null;
					this.mouseX = null;
				},
			});
		});

		this.element
			.querySelectorAll("[data-delete-intervention]")
			.forEach((button) => {
				button.addEventListener("click", (e) => {
					e.stopPropagation();
					const interventionId = button.dataset.deleteIntervention;

					if (confirm("Supprimer cette intervention ?")) {
						this.deletePendingIntervention(interventionId);
					}
				});
			});
	}

	handleDrop(evt, source) {
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
			return;
		}

		const startTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;

		if (interventionId) {
			this.addPendingUpdate(interventionId, truckId, date, startTime, item);
		} else {
			this.addPendingCreate(chantierId, truckId, date, startTime, item);
		}

		item.classList.add("pending-change");

		const leftOffset = roundedMinutes;
		item.style.left = `${leftOffset}px`;

		const originalBorder = item.style.border;
		item.style.border = "2px dashed #f59e0b";
		item.style.boxShadow = "0 0 10px rgba(245, 158, 11, 0.5)";

		item.dataset.originalBorder = originalBorder;
	}

	addPendingCreate(chantierId, truckId, date, startTime, itemElement) {
		const tempId = `temp-${Date.now()}`;

		this.pendingChanges.creates.push({
			tempId,
			chantier_id: chantierId,
			truck_id: truckId,
			date,
			start_time: startTime,
			element: itemElement,
		});

		itemElement.dataset.tempId = tempId;
		this.updateSaveButton();
	}

	addPendingUpdate(interventionId, truckId, date, startTime, itemElement) {
		const existingIndex = this.pendingChanges.updates.findIndex(
			(u) => u.id === interventionId
		);

		const updateData = {
			id: interventionId,
			truck_id: truckId,
			date,
			start_time: startTime,
			element: itemElement,
		};

		if (existingIndex >= 0) {
			this.pendingChanges.updates[existingIndex] = updateData;
		} else {
			this.pendingChanges.updates.push(updateData);
		}
		this.updateSaveButton();
	}

	deletePendingIntervention(interventionId) {
		const element = this.element.querySelector(
			`[data-intervention-id="${interventionId}"]`
		);

		if (element) {
			element.style.opacity = "0.3";
			element.style.textDecoration = "line-through";
			element.classList.add("pending-delete");
		}

		this.pendingChanges.deletes.push(interventionId);
		this.updateSaveButton();
	}

	updateSaveButton() {
		const totalChanges =
			this.pendingChanges.creates.length +
			this.pendingChanges.updates.length +
			this.pendingChanges.deletes.length;
		if (this.hasSaveButtonTarget) {
			if (totalChanges > 0) {
				this.saveButtonTarget.classList.remove("hidden");
				this.saveButtonTarget.disabled = false;
			} else {
				this.saveButtonTarget.classList.add("hidden");
			}
		}

		if (this.hasPendingCountTarget) {
			this.pendingCountTarget.textContent = totalChanges;
		}
	}

	async saveAllChanges() {
		const totalChanges =
			this.pendingChanges.creates.length +
			this.pendingChanges.updates.length +
			this.pendingChanges.deletes.length;

		if (totalChanges === 0) {
			alert("Aucune modification à sauvegarder");
			return;
		}
		try {
			const response = await fetch("/admin/interventions/batch_update", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRF-Token": document.querySelector('[name="csrf-token"]').content,
				},
				body: JSON.stringify({
					creates: this.pendingChanges.creates.map((c) => ({
						chantier_id: c.chantier_id,
						truck_id: c.truck_id,
						date: c.date,
						start_time: c.start_time,
					})),
					updates: this.pendingChanges.updates.map((u) => ({
						id: u.id,
						truck_id: u.truck_id,
						date: u.date,
						start_time: u.start_time,
					})),
					deletes: this.pendingChanges.deletes,
				}),
			});

			const data = await response.json();

			if (data.success) {
				this.cleanupWarnings();
				window.location.reload();
			} else {
				alert("Erreur : " + data.error);
			}
		} catch (error) {
			console.error("❌ Erreur lors de la sauvegarde:", error);
			alert("Erreur lors de la sauvegarde");
		}
	}

	cancelAllChanges() {
		if (
			confirm(
				"Annuler toutes les modifications non sauvegardées ? Cette action rechargera la page."
			)
		) {
			this.cleanupWarnings();
			window.location.reload();
		}
	}
}
