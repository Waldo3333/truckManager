# app/controllers/admin/weekly_recap_controller.rb
class Admin::WeeklyRecapController < ApplicationController
  before_action :require_admin

  def index
    # Paramètres de l'URL (avec valeurs par défaut)
    @selected_week = params[:week]&.to_date || Date.today.beginning_of_week
    @selected_truck_id = params[:truck_id]&.to_i || Truck.first&.id

    # Charger tous les camions pour la navigation
    @trucks = Truck.order(:name)
    @current_truck = Truck.find_by(id: @selected_truck_id) || @trucks.first

    # Calculer les dates de la semaine (lundi à dimanche)
    @week_days = (0..6).map { |i| @selected_week + i.days }

    # Charger les interventions du camion pour cette semaine
    @interventions = if @current_truck
      @current_truck.interventions
                    .where(date: @week_days)
                    .includes(:chantier)
                    .order(:date, :start_time)
    else
      []
    end

    # Grouper les interventions par jour
    @interventions_by_day = @interventions.group_by(&:date)

    # Charger l'assignation du conducteur pour chaque jour
    @assignments = if @current_truck
      DailyAssignment.where(truck_id: @current_truck.id, date: @week_days)
                    .includes(:user)
                    .index_by(&:date)
    else
      {}
    end

    # Calculer les stats de la semaine
    total_interventions = @interventions.count
    total_minutes = @interventions.sum { |i| i.duration_in_minutes }
    total_hours = (total_minutes / 60.0).round(1)
    free_days = @week_days.count { |day| @interventions_by_day[day].blank? }

    @week_stats = {
      interventions: total_interventions,
      hours: total_hours,
      free_days: free_days
    }
  end
end
