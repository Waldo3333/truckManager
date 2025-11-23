# app/controllers/employee/my_schedule_controller.rb
class Employee::MyScheduleController < ApplicationController
  before_action :require_employee

  def index
    @user = current_user

    # Semaine sélectionnée (par défaut : semaine en cours)
    @selected_week = params[:week]&.to_date || Date.today.beginning_of_week
    @week_days = (0..6).map { |i| @selected_week + i.days }

    # Mes assignations de la semaine
    @assignments = DailyAssignment.where(user: @user, date: @week_days)
                                  .includes(:truck)
                                  .index_by(&:date)

    # Mes interventions de la semaine (groupées par jour)
    truck_ids = @assignments.values.map(&:truck_id).uniq
    @interventions = Intervention.where(truck_id: truck_ids, date: @week_days)
                                 .includes(:chantier)
                                 .order(:date, :start_time)

    @interventions_by_day = @interventions.group_by(&:date)

    # Stats
    total_interventions = @interventions.count
    total_minutes = @interventions.sum { |i| i.duration_in_minutes }
    total_hours = (total_minutes / 60.0).round(1)
    work_days = @assignments.count

    @week_stats = {
      interventions: total_interventions,
      hours: total_hours,
      work_days: work_days
    }
  end
end
