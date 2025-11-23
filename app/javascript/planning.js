// app/javascript/planning.js
import Sortable from "sortablejs";
document.addEventListener("turbo:load", function () {
	console.log("🚀 Planning JS chargé");

	// Liste des chantiers (source)
	const chantiersList = document.querySelector("[data-chantiers-list]");

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

	// Variables globales pour le drag
	let draggedItem = null;
	let mouseX = null;

	// Timelines des camions (zones de drop)
	const timelines = document.querySelectorAll("[data-truck-timeline]");
	console.log(`✅ ${timelines.length} timelines trouvées`);

	timelines.forEach((timeline, index) => {
		console.log(`⚙️ Configuration timeline ${index + 1}`);

		// Capturer la position de la souris pendant le drag
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
			draggable: "[data-intervention-id], [data-chantier-id]",

			onStart: function (evt) {
				console.log("🎯 onStart déclenché");
				draggedItem = evt.item;
				mouseX = null;
			},

			// Quand on ajoute depuis la sidebar ou depuis une autre timeline
			onAdd: function (evt) {
				console.log("➕ onAdd déclenché");
				handleDrop(evt, "onAdd");
			},

			// Quand on termine le drag (même timeline ou pas)
			onEnd: function (evt) {
				console.log("🏁 onEnd déclenché");
				const item = evt.item;
				const interventionId = item.dataset.interventionId;

				console.log("Détails onEnd:", {
					interventionId,
					sameTimeline: evt.from === evt.to,
					mouseX,
				});

				// Si c'est une intervention ET qu'on a bougé dans la même timeline
				if (interventionId && evt.from === evt.to && mouseX !== null) {
					console.log("✅ Déplacement dans la même timeline détecté");
					handleDrop(evt, "onEnd");
				}

				draggedItem = null;
				mouseX = null;
			},
		});
	});

	function handleDrop(evt, source) {
		console.log(`🎬 handleDrop appelé depuis: ${source}`);

		const item = evt.item;
		const chantierId = item.dataset.chantierId;
		const interventionId = item.dataset.interventionId;
		const chantierDuration = parseInt(item.dataset.chantierDuration);
		const truckId = evt.to.dataset.truckId;
		const date = evt.to.dataset.date;

		console.log("Données extraites:", {
			chantierId,
			interventionId,
			chantierDuration,
			truckId,
			date,
		});

		// Utiliser la position de la souris ou de l'élément
		const timelineRect = evt.to.getBoundingClientRect();
		let relativeX;

		if (mouseX !== null) {
			// Utiliser la position de la souris (pour les déplacements dans la même timeline)
			relativeX = mouseX - timelineRect.left;
			console.log("📍 Utilisation position souris:", {
				mouseX,
				timelineLeft: timelineRect.left,
				relativeX,
			});
		} else {
			// Utiliser la position de l'élément (pour les nouveaux drops)
			const itemRect = item.getBoundingClientRect();
			relativeX = itemRect.left - timelineRect.left;
			console.log("📍 Utilisation position élément:", {
				itemLeft: itemRect.left,
				timelineLeft: timelineRect.left,
				relativeX,
			});
		}

		// 1px = 1 minute, arrondi à 15 minutes
		const totalMinutesFrom7am = Math.max(0, Math.round(relativeX));
		const roundedMinutes = Math.round(totalMinutesFrom7am / 15) * 15;

		const hours = Math.floor(roundedMinutes / 60);
		const minutes = roundedMinutes % 60;

		const startHour = 7 + hours;
		const startMinute = minutes;

		console.log("Calcul du temps:", {
			relativeX,
			totalMinutesFrom7am,
			roundedMinutes,
			hours,
			minutes,
			startHour,
			startMinute,
		});

		// Vérifier que l'heure est valide (entre 7h et 18h)
		if (startHour < 7 || startHour >= 19) {
			console.error("❌ Heure invalide:", startHour);
			alert("Vous devez placer l'intervention entre 7h et 18h");
			item.remove();
			window.location.reload();
			return;
		}

		const startTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
		console.log("⏰ Heure finale:", startTime);

		if (interventionId) {
			console.log("🔄 Mise à jour intervention existante");
			updateIntervention(interventionId, truckId, date, startTime);
		} else {
			console.log("✨ Création nouvelle intervention");
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
	console.log("📡 Envoi requête création:", {
		chantierId,
		truckId,
		date,
		startTime,
	});

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
			console.log("✅ Réponse création:", data);
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
	console.log("📡 Envoi requête mise à jour:", {
		interventionId,
		truckId,
		date,
		startTime,
	});

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
			console.log("✅ Réponse mise à jour:", data);
			if (data.success) {
				window.location.reload();
			} else {
				alert("Erreur : " + data.error);
				window.location.reload();
			}
		})
		.catch((error) => {
			console.error("❌ Erreur mise à jour:", error);
			alert("Erreur lors du déplacement");
			window.location.reload();
		});
}

function deleteIntervention(interventionId) {
	console.log("📡 Envoi requête suppression:", interventionId);

	fetch(`/admin/interventions/${interventionId}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
			"X-CSRF-Token": document.querySelector('[name="csrf-token"]').content,
		},
	})
		.then((response) => response.json())
		.then((data) => {
			console.log("✅ Réponse suppression:", data);
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
