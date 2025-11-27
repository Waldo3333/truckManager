import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="planning-button"
export default class extends Controller {
	prevDay() {
		this.changeDate(-1);
	}

	nextDay() {
		this.changeDate(+1);
	}

	changeDate(offset) {
		const urlParams = new URLSearchParams(window.location.search);
		const currentDate = urlParams.get("date");
		const date = currentDate ? new Date(currentDate) : new Date();
		date.setDate(date.getDate() + offset);
		const newDate = date.toISOString().split("T")[0];
		Turbo.visit(`/admin/planning?date=${newDate}`);
	}
}
