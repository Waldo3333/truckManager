// L'event turbo:load = page chargé
document.addEventListener("turbo:load", function () {
	console.log("🚀 Planning JS chargé");

	//on recupere notre liste de chantier, <div data-chantiers-list="true"> dans le html
	const chantiersList = document.querySelector("[data-chantiers-list]");

	// config de la bib Sortable, on crée un groupe d'entité à pouvoir drag & drop
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

	// Variables globales pour le drag, afin d'avoir les info sur qui bouge et ou est notre souris
	let draggedItem = null;
	let mouseX = null;

	//on recupere tous les <div data-truck-timeline="true"> dans le html, pour nos lignes de timeline
	const timelines = document.querySelectorAll("[data-truck-timeline]");

	timelines.forEach((timeline, index) => {
		// On traque la position de la souris pendant le drag, dragover se déclenche en continu pendant qu'on survole la zone (timeline)
		timeline.addEventListener("dragover", function (e) {
			mouseX = e.clientX;
		});

		new Sortable(timeline, {
			group: {
				name: "chantiers",
				pull: true,
				put: true,
			},
			animation: 150,
			draggable: "[data-intervention-id], [data-chantier-id]", // Seuls les éléments avec ces attributs peuvent être droppé ici

			// fonction quand on commence à glisser, on dit qui (evt.item), et on remet à zero la position de la souris
			onStart: function (evt) {
				draggedItem = evt.item;
				mouseX = null;
			},

			// Quand on ajoute depuis la sidebar ou depuis une autre timeline
			onAdd: function (evt) {
				handleDrop(evt, "onAdd");
			},

			// Quand on termine le drag (même timeline ou pas)
			onEnd: function (evt) {
				const item = evt.item;
				const interventionId = item.dataset.interventionId;

				// Si c'est une intervention ET qu'on a bougé dans la même timeline
				if (interventionId && evt.from === evt.to && mouseX !== null) {
					handleDrop(evt, "onEnd");
				}

				draggedItem = null;
				mouseX = null;
			},
		});
	});

	function handleDrop(evt, source) {
		//l'élément HTML qu'on a glissé
		const item = evt.item;
		//ID du chantier (si c'est un nouveau)
		const chantierId = item.dataset.chantierId;
		//ID de l'intervention (si on en déplace une existante)
		const interventionId = item.dataset.interventionId;
		//ID du camion (de la timeline)
		const truckId = evt.to.dataset.truckId;
		//Date du jour
		const date = evt.to.dataset.date;

		// Utiliser la position de la souris ou de l'élément
		const timelineRect = evt.to.getBoundingClientRect();
		let relativeX;

		if (mouseX !== null) {
			// Utiliser la position de la souris (pour les déplacements dans la même timeline)
			relativeX = mouseX - timelineRect.left;
		} else {
			// Utiliser la position de l'élément (pour les nouveaux drops)
			const itemRect = item.getBoundingClientRect();
			relativeX = itemRect.left - timelineRect.left;
		}

		// 1px = 1 minute, arrondi à 15 minutes
		const totalMinutesFrom7am = Math.max(0, Math.round(relativeX));
		const roundedMinutes = Math.round(totalMinutesFrom7am / 15) * 15;

		const hours = Math.floor(roundedMinutes / 60);
		const minutes = roundedMinutes % 60;

		const startHour = 7 + hours;
		const startMinute = minutes;

		// Vérifier que l'heure est valide (entre 7h et 18h)
		if (startHour < 7 || startHour >= 19) {
			console.error("❌ Heure invalide:", startHour);
			alert("Vous devez placer l'intervention entre 7h et 18h");
			item.remove();
			window.location.reload();
			return;
		}

		const startTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;

		if (interventionId) {
			updateIntervention(interventionId, truckId, date, startTime);
		} else {
			createIntervention(chantierId, truckId, date, startTime);
		}

		item.remove();
	}

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

function createIntervention(chantierId, truckId, date, startTime) {
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
			console.error("❌ Erreur création:", error);
			alert("Erreur lors de la création");
			window.location.reload();
		});
}

function updateIntervention(interventionId, truckId, date, startTime) {
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
			console.error("❌ Erreur suppression:", error);
			alert("Erreur lors de la suppression");
		});
}
