// app/javascript/planning.js
document.addEventListener("turbo:load", function () {
	// Liste des chantiers (source)
	const chantiersList = document.querySelector("[data-chantiers-list]");

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

	// Zones de drop (chaque créneau horaire)
	const dropZones = document.querySelectorAll("[data-drop-zone]");

	dropZones.forEach((zone) => {
		new Sortable(zone, {
			group: {
				name: "chantiers",
				pull: true, // Permettre de retirer des éléments
				put: true,
			},
			animation: 150,
			onAdd: function (evt) {
				const item = evt.item;
				const chantierId = item.dataset.chantierId;
				const interventionId = item.dataset.interventionId;
				const chantierDuration = item.dataset.chantierDuration;
				const hour = evt.to.dataset.hour;
				const truckId = evt.to.dataset.truckId;
				const date = evt.to.dataset.date;

				if (interventionId) {
					// C'est une intervention existante qu'on déplace
					updateIntervention(interventionId, truckId, date, hour);
				} else {
					// C'est un nouveau chantier
					createIntervention(chantierId, truckId, date, hour, chantierDuration);
				}

				item.remove();
			},
		});
	});

	// Boutons de suppression
	document.querySelectorAll("[data-delete-intervention]").forEach((button) => {
		button.addEventListener("click", function (e) {
			e.stopPropagation();
			const interventionId = this.dataset.deleteIntervention;

			if (confirm("Supprimer cette intervention ?")) {
				deleteIntervention(interventionId);
			}
		});
	});
});

function createIntervention(chantierId, truckId, date, hour, duration) {
	const startTime = `${hour.toString().padStart(2, "0")}:00`;

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
			console.error("Erreur:", error);
			alert("Erreur lors de la création");
			window.location.reload();
		});
}

function updateIntervention(interventionId, truckId, date, hour) {
	const startTime = `${hour.toString().padStart(2, "0")}:00`;

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
			console.error("Erreur:", error);
			alert("Erreur lors du déplacement");
			window.location.reload();
		});
}

function deleteIntervention(interventionId) {
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
			console.error("Erreur:", error);
			alert("Erreur lors de la suppression");
		});
}
