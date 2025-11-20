// app/javascript/controllers/modal_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
	connect() {
		console.log("✅ Modal controller connecté");
	}

	open(event) {
		console.log("🎯 Modal open() appelé");

		const button = event.currentTarget;
		const truckId = button.dataset.truckId;
		const date = button.dataset.date;
		const assignmentId = button.dataset.assignmentId;

		console.log("Data:", { truckId, date, assignmentId });

		// Remplir les champs du formulaire
		document.getElementById("modal-truck-id").value = truckId;
		document.getElementById("modal-date").value = date;

		// Si c'est une modification, changer l'action du form
		const form = document.getElementById("assignment-form");

		if (assignmentId) {
			// Modifier l'URL pour la mise à jour
			form.action = `/admin/daily_assignments/${assignmentId}`;

			// Ajouter le champ _method pour PATCH
			let methodField = form.querySelector('input[name="_method"]');
			if (!methodField) {
				methodField = document.createElement("input");
				methodField.type = "hidden";
				methodField.name = "_method";
				form.appendChild(methodField);
			}
			methodField.value = "patch";

			// Changer le texte du bouton
			form.querySelector('[type="submit"]').textContent = "Modifier";
		} else {
			// Créer une nouvelle assignation
			form.action = "/admin/daily_assignments";

			// Supprimer le champ _method s'il existe
			const methodField = form.querySelector('input[name="_method"]');
			if (methodField) {
				methodField.remove();
			}

			// Réinitialiser le select
			form.querySelector('select[name="daily_assignment[user_id]"]').value = "";

			// Changer le texte du bouton
			form.querySelector('[type="submit"]').textContent = "Assigner";
		}

		// Afficher le modal
		const modal = document.getElementById("assignment-modal");
		modal.classList.remove("hidden");
	}

	close() {
		console.log("🚪 Modal close() appelé");
		document.getElementById("assignment-modal").classList.add("hidden");
	}
}
