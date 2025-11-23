# app/controllers/employee/team_schedule_controller.rb
class Employee::TeamScheduleController < ApplicationController
  before_action :require_employee

  def index
    # Date sélectionnée (par défaut : aujourd'hui)
    @selected_date = params[:date]&.to_date || Date.today

    # Tous les employés (non admins)
    @employees = User.where(admin: false).order(:email)

    # Assignations du jour pour tous les employés
    @assignments = DailyAssignment.where(date: @selected_date)
                                  .includes(:user, :truck)
                                  .index_by(&:user_id)

    # Interventions par camion pour ce jour
    truck_ids = @assignments.values.map(&:truck_id).uniq
    interventions = Intervention.where(truck_id: truck_ids, date: @selected_date)
                                .includes(:chantier)
                                .order(:start_time)

    @interventions_by_truck = interventions.group_by(&:truck_id)
  end
end
