// app/javascript/controllers/employee_schedule_controller.js
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
	static targets = ["calendar", "colleaguesList", "calendarContent"];
	static values = {
		currentDate: String,
		compareUserId: String,
	};

	connect() {
		console.log("✅ Employee schedule controller connecté");
		// Initialiser la date actuelle depuis l'URL
		const urlParams = new URLSearchParams(window.location.search);
		this.currentDateValue =
			urlParams.get("date") || new Date().toISOString().split("T")[0];
		this.compareUserIdValue = urlParams.get("compare_user_id") || "";
	}

	toggleCalendar() {
		if (this.hasCalendarTarget) {
			const isHidden =
				this.calendarTarget.classList.contains("translate-y-full");

			if (isHidden) {
				// Charger le calendrier du mois actuel
				this.loadCalendar(this.currentDateValue);
				this.calendarTarget.classList.remove("translate-y-full");
				this.calendarTarget.classList.add("translate-y-0");
			} else {
				this.calendarTarget.classList.remove("translate-y-0");
				this.calendarTarget.classList.add("translate-y-full");
			}
		}
	}

	async loadCalendar(date) {
		try {
			const url = `/employee/schedule/calendar?date=${date}&compare_user_id=${this.compareUserIdValue}`;
			const response = await fetch(url, {
				headers: {
					Accept: "text/html",
					"X-Requested-With": "XMLHttpRequest",
				},
			});

			if (response.ok) {
				const html = await response.text();
				if (this.hasCalendarContentTarget) {
					this.calendarContentTarget.innerHTML = html;
				}
			}
		} catch (error) {
			console.error("Erreur chargement calendrier:", error);
		}
	}

	async prevMonth() {
		const date = new Date(this.currentDateValue);
		date.setMonth(date.getMonth() - 1);
		this.currentDateValue = date.toISOString().split("T")[0];
		await this.loadCalendar(this.currentDateValue);
	}

	async nextMonth() {
		const date = new Date(this.currentDateValue);
		date.setMonth(date.getMonth() + 1);
		this.currentDateValue = date.toISOString().split("T")[0];
		await this.loadCalendar(this.currentDateValue);
	}

	toggleColleaguesList() {
		if (this.hasColleaguesListTarget) {
			this.colleaguesListTarget.classList.toggle("hidden");
		}
	}

	closeCalendar() {
		if (this.hasCalendarTarget) {
			this.calendarTarget.classList.remove("translate-y-0");
			this.calendarTarget.classList.add("translate-y-full");
		}
	}

	closeColleaguesList() {
		if (this.hasColleaguesListTarget) {
			this.colleaguesListTarget.classList.add("hidden");
		}
	}
}
