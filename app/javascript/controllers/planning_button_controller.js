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
		const urlParams = new URLSearchParams(window.location.search).get("date");
		const currentDate = urlParams;
		const date = new Date(currentDate);
		date.setDate(date.getDate() + offset);
		const newDate = date.toISOString().split("T")[0];
		window.location.href = `/admin/planning?date=${newDate}`;
	}
}
